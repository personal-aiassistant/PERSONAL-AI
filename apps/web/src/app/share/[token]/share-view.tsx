"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, Download, Eye, Calendar, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  architecture: "Architecture",
  prd: "PRD",
  api: "API Spec",
  documentation: "Documentation",
  schema: "DB Schema",
  docker: "Dockerfile",
  cicd: "CI/CD Pipeline",
  "code-review": "Code Review",
};

function renderMarkdown(content: string) {
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
  return parts.map((part, i) => {
    const codeBlock = part.match(/^```(\w+)?\n?([\s\S]*?)```$/);
    if (codeBlock)
      return (
        <div key={i} className="relative my-3 rounded-md overflow-hidden border border-border/50">
          <div className="flex items-center justify-between px-4 py-1.5 bg-muted/60 border-b border-border/40">
            <span className="text-xs font-mono text-muted-foreground">{codeBlock[1] ?? "code"}</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed bg-muted/20">
            <code>{codeBlock[2].trim()}</code>
          </pre>
        </div>
      );
    const inlineCode = part.match(/^`([^`]+)`$/);
    if (inlineCode) return <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{inlineCode[1]}</code>;
    return (
      <span key={i}>
        {part.split("\n").map((line, li) => {
          if (line.startsWith("### ")) return <h3 key={li} className="text-base font-semibold mt-5 mb-2">{line.slice(4)}</h3>;
          if (line.startsWith("## ")) return <h2 key={li} className="text-lg font-bold mt-6 mb-3 border-b border-border pb-1">{line.slice(3)}</h2>;
          if (line.startsWith("# ")) return <h1 key={li} className="text-xl font-bold mt-4 mb-3">{line.slice(2)}</h1>;
          if (line.startsWith("**") && line.endsWith("**")) return <p key={li} className="font-semibold text-sm my-1">{line.slice(2, -2)}</p>;
          if (line.startsWith("- ") || line.startsWith("* ")) return <li key={li} className="text-sm ml-4 my-0.5 list-disc">{line.slice(2)}</li>;
          if (line.match(/^\d+\. /)) return <li key={li} className="text-sm ml-4 my-0.5 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
          if (line.startsWith("> ")) return <blockquote key={li} className="border-l-2 border-primary pl-3 my-2 text-muted-foreground text-sm">{line.slice(2)}</blockquote>;
          if (line === "") return <br key={li} />;
          return <p key={li} className="text-sm my-1 leading-relaxed">{line}</p>;
        })}
      </span>
    );
  });
}

interface ShareViewProps {
  share: {
    title: string;
    content: string;
    generator_type: string;
    view_count: number;
    created_at: string;
    expires_at: string | null;
  };
}

export function ShareView({ share }: ShareViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(share.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([share.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${share.title.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const typeLabel = TYPE_LABELS[share.generator_type] ?? share.generator_type;
  const formattedDate = new Date(share.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            CodeForge AI
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Copy content" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download .md" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button asChild size="sm" className="h-7 text-xs gap-1.5">
              <Link href="/login">
                Try CodeForge AI <ExternalLink className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Meta */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" /> {share.view_count} view{share.view_count !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" /> {formattedDate}
              </span>
              {share.expires_at && (
                <span className="text-xs text-amber-500">
                  Expires {new Date(share.expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{share.title}</h1>
          </div>

          {/* Output card */}
          <div className="glass rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/20">
              <span className="text-xs font-medium text-muted-foreground">Output</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCopy}>
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleDownload}>
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="p-6 prose prose-sm max-w-none">
              {renderMarkdown(share.content)}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">Generate your own AI outputs with CodeForge AI</p>
            <Button asChild>
              <Link href="/login">Get started free <ExternalLink className="w-3.5 h-3.5 ml-1.5" /></Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
