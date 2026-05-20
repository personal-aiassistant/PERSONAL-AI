import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import type { Project } from "@codeforge/types";

export async function GET() {
  try {
    const user = await requireAuth();

    const result = await db.query<Project>(
      `SELECT p.*
       FROM public.projects p
       JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
       WHERE wm.user_id = $1
       ORDER BY p.updated_at DESC
       LIMIT 20`,
      [user.id]
    );

    return NextResponse.json({ data: result.rows });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/projects]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { name, description, workspace_id } = body;

    if (!name || !workspace_id) {
      return NextResponse.json(
        { error: "name and workspace_id are required" },
        { status: 400 }
      );
    }

    // Verify user is a member of this workspace
    const memberCheck = await db.query(
      `SELECT id FROM public.workspace_members
       WHERE workspace_id = $1 AND user_id = $2 AND role IN ('owner', 'admin', 'member')`,
      [workspace_id, user.id]
    );

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db.query<Project>(
      `INSERT INTO public.projects (name, description, workspace_id, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description ?? null, workspace_id, user.id]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/projects]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
