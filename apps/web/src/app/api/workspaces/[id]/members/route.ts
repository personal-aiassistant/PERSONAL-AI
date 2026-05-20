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

    // Verify membership
    const check = await db.query(
      "SELECT 1 FROM public.workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [id, user.id]
    );
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = await db.query(
      `SELECT wm.id, wm.role, wm.created_at,
              p.id AS user_id, p.full_name, p.email, p.avatar_url
       FROM public.workspace_members wm
       JOIN public.profiles p ON p.id = wm.user_id
       WHERE wm.workspace_id = $1
       ORDER BY
         CASE wm.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END,
         wm.created_at ASC`,
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
