"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X, Link2, Clock, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const APP_URL = typeof window !== "undefined" ? window.location.origin : "";

async function getToken(): Promise<string> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  } catch { return ""; }
}

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  generatorType: string;
  generatorId?: string;
}

export function ShareModal({ open, onClose, title, content, generatorType, generatorId }: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);

  const handleCreate = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, generatorType, generatorId, expiresInDays }),
      });
      if (!res.ok) throw new Error("Failed to create share");
      const json = await res.json();
      const shareToken = json.data?.token;
      if (shareToken) {
        setShareUrl(`${APP_URL}/share/${shareToken}`);
      }
    } catch {
      toast.error("Failed to create shareable link");
    } finally {
      setLoading(false);
    }
  }, [title, content, generatorType, generatorId, expiresInDays]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    onClose();
  };

  const EXPIRY_OPTIONS = [
    { label: "Never", value: null },
    { label: "24 hours", value: 1 },
    { label: "7 days", value: 7 },
    { label: "30 days", value: 30 },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-[20vh] z-50 mx-auto max-w-md px-4"
          >
            <div className="glass rounded-xl border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Share2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Share Output</h3>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{title}</p>
                  </div>
                </div>
                <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {!shareUrl ? (
                  <>
                    {/* Expiry selection */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Link expiry
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {EXPIRY_OPTIONS.map((opt) => (
                          <button
                            key={String(opt.value)}
                            onClick={() => setExpiresInDays(opt.value)}
                            className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                              expiresInDays === opt.value
                                ? "bg-primary/10 border-primary/40 text-primary"
                                : "bg-muted/30 border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="rounded-lg bg-muted/30 border border-border/50 p-3 text-xs text-muted-foreground space-y-1">
                      <p className="flex items-center gap-1.5"><Link2 className="w-3 h-3 text-primary shrink-0" /> Anyone with the link can view this output</p>
                      <p className="flex items-center gap-1.5"><Trash2 className="w-3 h-3 text-muted-foreground shrink-0" /> You can delete the link anytime from your profile</p>
                    </div>

                    <Button className="w-full" onClick={handleCreate} disabled={loading}>
                      {loading ? "Creating link..." : "Generate Share Link"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Your shareable link</p>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border">
                        <Link2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-xs flex-1 truncate text-foreground font-mono">{shareUrl}</span>
                        <button
                          onClick={handleCopy}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleCopy} variant={copied ? "outline" : "default"}>
                        {copied ? (
                          <><Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Link</>
                        )}
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={shareUrl} target="_blank" rel="noreferrer" title="Open in new tab">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {expiresInDays ? `Link expires in ${expiresInDays} day${expiresInDays > 1 ? "s" : ""}` : "Link never expires"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
