import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const result = await db.query(
      `SELECT w.id, w.name, w.slug
       FROM public.workspaces w
       JOIN public.workspace_members wm ON wm.workspace_id = w.id
       WHERE wm.user_id = $1 AND wm.role = 'owner'
       ORDER BY w.created_at ASC
       LIMIT 1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/workspaces/default]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
