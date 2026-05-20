"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const HEARTBEAT_INTERVAL = 60_000;

async function getToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

async function sendHeartbeat() {
  try {
    const token = await getToken();
    if (!token) return;
    await fetch(`${API_BASE}/presence/heartbeat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
  } catch {}
}

async function sendOffline() {
  try {
    const token = await getToken();
    if (!token) return;
    await fetch(`${API_BASE}/presence/offline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: "{}",
    });
  } catch {}
}

export function usePresence() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    sendHeartbeat();

    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendOffline();
      } else {
        sendHeartbeat();
      }
    };

    const handleBeforeUnload = () => {
      sendOffline();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      sendOffline();
    };
  }, []);
}
