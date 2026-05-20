import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, memberId } = await params;
    const { role } = await request.json();

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

    const result = await db.query(
      `UPDATE public.workspace_members
       SET role = $3
       WHERE id = $1 AND workspace_id = $2 AND role != 'owner'
       RETURNING *`,
      [memberId, id, role]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cannot update this member" }, { status: 400 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, memberId } = await params;

    const roleCheck = await db.query(
      "SELECT role FROM public.workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [id, user.id]
    );
    if (!roleCheck.rows[0] || !["owner", "admin"].includes(roleCheck.rows[0].role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    await db.query(
      "DELETE FROM public.workspace_members WHERE id = $1 AND workspace_id = $2 AND role != 'owner'",
      [memberId, id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
