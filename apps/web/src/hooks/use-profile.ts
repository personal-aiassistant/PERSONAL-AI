"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import type { UserProfile } from "@codeforge/types";

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  const { data } = await res.json();
  return data;
}

async function updateProfile(
  updates: Partial<Pick<UserProfile, "full_name" | "avatar_url">>
): Promise<UserProfile> {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  const { data } = await res.json();
  return data;
}

export function useProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: fetchProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", user?.id], data);
      setProfile(data);
    },
  });
}
