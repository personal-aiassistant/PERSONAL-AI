import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const result = await db.query(
    `SELECT wi.*, w.name AS workspace_name, w.slug AS workspace_slug,
            p.full_name AS invited_by_name
     FROM public.workspace_invitations wi
     JOIN public.workspaces w ON w.id = wi.workspace_id
     JOIN public.profiles p ON p.id = wi.invited_by
     WHERE wi.token = $1 AND wi.accepted_at IS NULL AND wi.expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
  }

  const invite = result.rows[0];
  return NextResponse.json({
    data: {
      email: invite.email,
      role: invite.role,
      workspace_name: invite.workspace_name,
      workspace_slug: invite.workspace_slug,
      invited_by: invite.invited_by_name,
      expires_at: invite.expires_at,
    },
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await requireAuth();
    const { token } = await params;

    const invite = await db.query(
      `SELECT * FROM public.workspace_invitations
       WHERE token = $1 AND accepted_at IS NULL AND expires_at > NOW()`,
      [token]
    );

    if (invite.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
    }

    const inv = invite.rows[0];

    // Check user email matches invite
    const profileResult = await db.query(
      "SELECT email FROM public.profiles WHERE id = $1",
      [user.id]
    );
    const userEmail = profileResult.rows[0]?.email;

    if (userEmail && userEmail.toLowerCase() !== inv.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Add to workspace members
    await db.query(
      `INSERT INTO public.workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [inv.workspace_id, user.id, inv.role]
    );

    // Mark invitation as accepted
    await db.query(
      "UPDATE public.workspace_invitations SET accepted_at = NOW() WHERE id = $1",
      [inv.id]
    );

    // Log activity
    await db.query(
      `INSERT INTO public.activity_logs (workspace_id, user_id, action, entity_type, metadata)
       VALUES ($1, $2, 'joined_workspace', 'member', $3)`,
      [inv.workspace_id, user.id, JSON.stringify({ role: inv.role })]
    );

    return NextResponse.json({ success: true, workspace_id: inv.workspace_id });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
