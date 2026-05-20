import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
    const project_id = searchParams.get("project_id");

    const result = await db.query(
      `SELECT id, content, role, model, tokens_used, created_at, project_id
       FROM public.messages
       WHERE user_id = $1 ${project_id ? "AND project_id = $3" : "AND project_id IS NULL"}
       ORDER BY created_at DESC
       LIMIT $2`,
      project_id ? [user.id, limit, project_id] : [user.id, limit]
    );

    return NextResponse.json({ data: result.rows.reverse() });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/ai/history]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();
    await db.query(
      "DELETE FROM public.messages WHERE user_id = $1 AND project_id IS NULL",
      [user.id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
