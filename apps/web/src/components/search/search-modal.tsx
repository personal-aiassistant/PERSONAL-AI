"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FolderKanban, Zap, MessageSquareCode, X, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getToken(): Promise<string> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  } catch {
    return "";
  }
}

interface SearchResult {
  id: string;
  type: "project" | "generator" | "chat";
  title: string;
  subtitle: string;
  href: string;
}

const TYPE_ICON = {
  project: FolderKanban,
  generator: Zap,
  chat: MessageSquareCode,
};

const TYPE_COLOR = {
  project: "text-amber-500",
  generator: "text-primary",
  chat: "text-purple-500",
};

const TYPE_LABEL = {
  project: "Project",
  generator: "Generator",
  chat: "Chat",
};

const RECENT_KEY = "codeforge_recent_searches";

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}

function saveRecent(q: string) {
  try {
    const prev = getRecent().filter((r) => r !== q);
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 5)));
  } catch {}
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setRecent(getRecent());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (!user) return;

    setLoading(true);
    getToken().then((token) => {
      fetch(`${API_BASE}/api/v1/search?q=${encodeURIComponent(debouncedQuery)}&limit=15`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((json) => { setResults(json.data ?? json ?? []); setActiveIndex(0); })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    });
  }, [debouncedQuery, user]);

  const navigate = useCallback(
    (result: SearchResult) => {
      saveRecent(query);
      onClose();
      router.push(result.href);
    },
    [query, router, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[activeIndex]) navigate(results[activeIndex]);
    else if (e.key === "Escape") onClose();
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-[10vh] z-50 mx-auto max-w-xl px-4"
          >
            <div className="glass rounded-xl overflow-hidden border border-border shadow-2xl">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search projects, generators, chats..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />}
                {query && !loading && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center px-1.5 py-0.5 rounded text-xs bg-muted border border-border text-muted-foreground font-mono">Esc</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto py-2">
                {!query && recent.length > 0 && (
                  <div className="px-3 pb-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent searches
                    </p>
                    {recent.map((r) => (
                      <button key={r} onClick={() => setQuery(r)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-left">
                        <Clock className="w-3.5 h-3.5 shrink-0" />{r}
                      </button>
                    ))}
                  </div>
                )}

                {!query && recent.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p>Search projects, generators &amp; chats</p>
                    <p className="text-xs mt-1 opacity-60">Type at least 2 characters</p>
                  </div>
                )}

                {query.length >= 2 && !loading && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No results for <span className="font-medium text-foreground">"{query}"</span>
                  </div>
                )}

                {(["project", "generator", "chat"] as const).map((type) => {
                  const items = grouped[type];
                  if (!items?.length) return null;
                  const Icon = TYPE_ICON[type];
                  const groupStart = results.findIndex((r) => r.type === type);
                  return (
                    <div key={type} className="px-2 mb-1">
                      <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 uppercase tracking-wider">{TYPE_LABEL[type]}s</p>
                      {items.map((result, i) => {
                        const idx = groupStart + i;
                        return (
                          <button key={result.id} onClick={() => navigate(result)} onMouseEnter={() => setActiveIndex(idx)}
                            className={cn("w-full flex items-start gap-3 px-2 py-2 rounded-md text-left transition-colors",
                              activeIndex === idx ? "bg-primary/10 text-foreground" : "hover:bg-muted/40")}>
                            <div className={cn("mt-0.5 shrink-0", TYPE_COLOR[type])}><Icon className="w-3.5 h-3.5" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{result.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                            </div>
                            {activeIndex === idx && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">↵</kbd> open</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">Esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
