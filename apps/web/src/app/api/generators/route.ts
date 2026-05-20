import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

    const result = await db.query(
      `SELECT * FROM public.generators
       WHERE user_id = $1 ${type ? "AND type = $3" : ""}
       ORDER BY created_at DESC LIMIT $2`,
      type ? [user.id, limit, type] : [user.id, limit]
    );

    return NextResponse.json({ data: result.rows });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { type, title, input, project_id } = body;

    if (!type || !title) {
      return NextResponse.json({ error: "type and title are required" }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO public.generators (user_id, type, title, input, project_id, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [user.id, type, title, JSON.stringify(input ?? {}), project_id ?? null]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
