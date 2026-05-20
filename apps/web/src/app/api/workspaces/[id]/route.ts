import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const result = await db.query(
      `SELECT w.*, wm.role AS my_role,
        (SELECT COUNT(*) FROM public.workspace_members WHERE workspace_id = w.id) AS member_count,
        (SELECT COUNT(*) FROM public.projects WHERE workspace_id = w.id) AS project_count
       FROM public.workspaces w
       JOIN public.workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = $2
       WHERE w.id = $1`,
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { name, description, avatar_url } = body;

    // Verify owner/admin
    const roleCheck = await db.query(
      "SELECT role FROM public.workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [id, user.id]
    );
    if (!roleCheck.rows[0] || !["owner", "admin"].includes(roleCheck.rows[0].role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const result = await db.query(
      `UPDATE public.workspaces
       SET name = COALESCE($3, name),
           description = COALESCE($4, description),
           avatar_url = COALESCE($5, avatar_url),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, user.id, name ?? null, description ?? null, avatar_url ?? null]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
