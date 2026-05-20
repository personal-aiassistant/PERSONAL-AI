import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { UserProfile } from "@codeforge/types";

/**
 * Get the current authenticated user from Supabase + their profile from Replit DB
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return user;
}

/**
 * Get or create profile in Replit DB for a Supabase auth user
 */
export async function getOrCreateProfile(
  userId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string
): Promise<UserProfile | null> {
  try {
    // Try to fetch existing profile
    const existing = await db.query<UserProfile>(
      "SELECT * FROM public.profiles WHERE id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Generate workspace slug from email
    const baseSlug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
    const workspaceSlug = `${baseSlug}-${userId.slice(0, 6)}`;
    const workspaceName = `${fullName ?? email.split("@")[0]}'s Workspace`;

    // Create profile in transaction
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const profileResult = await client.query<UserProfile>(
        `INSERT INTO public.profiles (id, email, full_name, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
           avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
           updated_at = NOW()
         RETURNING *`,
        [userId, email, fullName ?? null, avatarUrl ?? null]
      );

      const profile = profileResult.rows[0];

      // Create personal workspace
      const wsResult = await client.query(
        `INSERT INTO public.workspaces (name, slug, owner_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [workspaceName, workspaceSlug, userId]
      );

      if (wsResult.rows.length > 0) {
        const workspaceId = wsResult.rows[0].id;
        await client.query(
          `INSERT INTO public.workspace_members (workspace_id, user_id, role)
           VALUES ($1, $2, 'owner')
           ON CONFLICT (workspace_id, user_id) DO NOTHING`,
          [workspaceId, userId]
        );
      }

      await client.query("COMMIT");
      return profile;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[getOrCreateProfile] Error:", err);
    return null;
  }
}

/**
 * Verify auth in API routes — returns user or throws
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
