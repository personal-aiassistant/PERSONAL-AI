import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { email, role = "member" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!["admin", "member", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const roleCheck = await db.query(
      "SELECT role FROM public.workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [id, user.id]
    );
    if (!roleCheck.rows[0] || !["owner", "admin"].includes(roleCheck.rows[0].role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Check if already a member
    const existingMember = await db.query(
      `SELECT 1 FROM public.workspace_members wm
       JOIN public.profiles p ON p.id = wm.user_id
       WHERE wm.workspace_id = $1 AND p.email = $2`,
      [id, email.toLowerCase()]
    );
    if (existingMember.rows.length > 0) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }

    // Upsert invitation
    const result = await db.query(
      `INSERT INTO public.workspace_invitations (workspace_id, email, role, invited_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (token) DO NOTHING
       RETURNING *`,
      [id, email.toLowerCase(), role, user.id]
    );

    const invitation = result.rows[0];
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite/${invitation.token}`;

    // Log activity
    await db.query(
      `INSERT INTO public.activity_logs (workspace_id, user_id, action, entity_type, metadata)
       VALUES ($1, $2, 'invited_member', 'invitation', $3)`,
      [id, user.id, JSON.stringify({ email, role })]
    );

    return NextResponse.json({
      data: {
        ...invitation,
        invite_link: inviteLink,
      },
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/workspaces/[id]/invite]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const roleCheck = await db.query(
      "SELECT role FROM public.workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [id, user.id]
    );
    if (!roleCheck.rows[0] || !["owner", "admin"].includes(roleCheck.rows[0].role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const result = await db.query(
      `SELECT wi.*, p.full_name AS invited_by_name
       FROM public.workspace_invitations wi
       JOIN public.profiles p ON p.id = wi.invited_by
       WHERE wi.workspace_id = $1 AND wi.accepted_at IS NULL AND wi.expires_at > NOW()
       ORDER BY wi.created_at DESC`,
      [id]
    );

    return NextResponse.json({ data: result.rows });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
