import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const [projectsResult, messagesResult] = await Promise.all([
      db.query(
        `SELECT COUNT(*) as total
         FROM public.projects p
         JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
         WHERE wm.user_id = $1`,
        [user.id]
      ),
      db.query(
        `SELECT COUNT(*) as today, COALESCE(SUM(tokens_used), 0) as tokens
         FROM public.messages
         WHERE user_id = $1
           AND created_at >= NOW() - INTERVAL '24 hours'`,
        [user.id]
      ),
    ]);

    return NextResponse.json({
      data: {
        totalProjects: parseInt(projectsResult.rows[0].total, 10),
        aiChatsToday: parseInt(messagesResult.rows[0].today, 10),
        tokensUsed: parseInt(messagesResult.rows[0].tokens, 10),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/dashboard/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
