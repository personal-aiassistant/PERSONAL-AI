"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InviteInfo {
  email: string;
  role: string;
  workspace_name: string;
  invited_by: string;
  expires_at: string;
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "invalid" | "accepting" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) { setInfo(d.data); setStatus("ready"); }
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleAccept = async () => {
    setStatus("accepting");
    try {
      const res = await fetch(`/api/invite/${token}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/workspace"), 2000);
      } else {
        if (res.status === 401) {
          router.push(`/login?redirect=/invite/${token}`);
          return;
        }
        setErrorMsg(data.error ?? "Failed to accept invitation");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">CodeForge AI</span>
        </div>

        <div className="glass rounded-xl p-8 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading invitation...</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold">Invalid invitation</h2>
              <p className="text-sm text-muted-foreground">This invitation link is invalid or has expired.</p>
              <Link href="/dashboard">
                <Button variant="outline" className="mt-2">Go to dashboard</Button>
              </Link>
            </div>
          )}

          {(status === "ready" || status === "accepting") && info && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{info.invited_by} invited you</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  to join <strong>{info.workspace_name}</strong> as{" "}
                  <span className="capitalize font-medium">{info.role}</span>
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 w-full text-left">
                <p className="text-xs text-muted-foreground">Invited email</p>
                <p className="text-sm font-medium">{info.email}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Expires {new Date(info.expires_at).toLocaleDateString()}
              </p>
              <Button
                onClick={handleAccept}
                disabled={status === "accepting"}
                className="w-full"
              >
                {status === "accepting" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                ) : (
                  "Accept invitation"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Need to sign in first?{" "}
                <Link href={`/login?redirect=/invite/${token}`} className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold">You&apos;re in!</h2>
              <p className="text-sm text-muted-foreground">Redirecting to workspace...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button variant="outline" onClick={() => setStatus("ready")}>Try again</Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
