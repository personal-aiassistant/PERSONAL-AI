import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getOrCreateProfile } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import type { UserProfile } from "@codeforge/types";

export async function GET() {
  try {
    const user = await requireAuth();

    const profile = await getOrCreateProfile(
      user.id,
      user.email!,
      user.user_metadata?.full_name,
      user.user_metadata?.avatar_url
    );

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const allowedFields = ["full_name", "avatar_url"];
    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const setClauses = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(", ");

    const result = await db.query<UserProfile>(
      `UPDATE public.profiles SET ${setClauses}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [user.id, ...Object.values(updates)]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
