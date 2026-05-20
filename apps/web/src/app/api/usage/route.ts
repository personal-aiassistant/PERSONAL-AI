import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const [tokenStats, chatStats, generatorStats, projectStats] = await Promise.all([
      // Total tokens used across all generators
      db.query(
        `SELECT COALESCE(SUM(tokens_used), 0)::int AS total_tokens
         FROM public.generators WHERE user_id = $1`,
        [user.id]
      ),
      // AI chat messages (approximated token usage: ~500 tokens/message)
      db.query(
        `SELECT COUNT(*)::int AS total_messages,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS monthly_messages
         FROM public.messages WHERE user_id = $1`,
        [user.id]
      ),
      // Generator count by type
      db.query(
        `SELECT type, COUNT(*)::int AS count
         FROM public.generators WHERE user_id = $1
         GROUP BY type ORDER BY count DESC`,
        [user.id]
      ),
      // Project count
      db.query(
        `SELECT COUNT(*)::int AS total_projects FROM public.projects WHERE user_id = $1`,
        [user.id]
      ),
    ]);

    const generatorTokens = tokenStats.rows[0]?.total_tokens ?? 0;
    const chatMessages = chatStats.rows[0]?.total_messages ?? 0;
    const estimatedChatTokens = chatMessages * 500;
    const totalTokens = generatorTokens + estimatedChatTokens;

    const FREE_LIMIT = 100_000;
    const PRO_LIMIT = 2_000_000;

    return NextResponse.json({
      data: {
        tokens_used: totalTokens,
        tokens_from_generators: generatorTokens,
        estimated_tokens_from_chat: estimatedChatTokens,
        messages_total: chatMessages,
        messages_monthly: chatStats.rows[0]?.monthly_messages ?? 0,
        generators_by_type: generatorStats.rows,
        total_projects: projectStats.rows[0]?.total_projects ?? 0,
        plan: "free",
        limits: {
          free: FREE_LIMIT,
          pro: PRO_LIMIT,
        },
        usage_percent: Math.min(Math.round((totalTokens / FREE_LIMIT) * 100), 100),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/usage]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
