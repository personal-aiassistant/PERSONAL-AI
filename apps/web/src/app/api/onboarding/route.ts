import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const user = await requireAuth();

    await db.query(
      `UPDATE public.profiles SET onboarding_completed = true, updated_at = NOW() WHERE id = $1`,
      [user.id]
    );

    return NextResponse.json({ data: { onboarding_completed: true } });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
