"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

/**
 * Initializes Supabase auth state listener.
 * Must be called once at the app root (inside Providers).
 */
export function useAuthListener() {
  const { setUser, setLoading, setProfile } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Fetch or create profile in Replit DB
        fetch("/api/profile")
          .then((res) => res.json())
          .then(({ data }) => {
            if (data) setProfile(data);
          })
          .catch(console.error);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Ensure profile exists in Replit DB
        fetch("/api/profile")
          .then((res) => res.json())
          .then(({ data }) => {
            if (data) setProfile(data);
          })
          .catch(console.error);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setProfile]);
}
