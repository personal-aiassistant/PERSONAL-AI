import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 100);

    // Verify membership
    const check = await db.query(
      "SELECT 1 FROM public.workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [id, user.id]
    );
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = await db.query(
      `SELECT al.*, p.full_name, p.avatar_url
       FROM public.activity_logs al
       LEFT JOIN public.profiles p ON p.id = al.user_id
       WHERE al.workspace_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [id, limit]
    );

    return NextResponse.json({ data: result.rows });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { action, entity_type, entity_id, metadata } = await request.json();

    await db.query(
      `INSERT INTO public.activity_logs (workspace_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, user.id, action, entity_type ?? null, entity_id ?? null, JSON.stringify(metadata ?? {})]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
