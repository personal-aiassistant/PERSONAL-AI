"use client";

import { useState } from "react";
import { Copy, Check, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  lang?: string;
}

function CodeBlock({ code, lang }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-3 rounded-md overflow-hidden border border-border/50">
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted/60 border-b border-border/40">
        <span className="text-xs font-mono text-muted-foreground">{lang ?? "code"}</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCopy}>
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed bg-muted/20"><code>{code}</code></pre>
    </div>
  );
}

function renderMarkdown(content: string) {
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
  return parts.map((part, i) => {
    const codeBlock = part.match(/^```(\w+)?\n?([\s\S]*?)```$/);
    if (codeBlock) return <CodeBlock key={i} lang={codeBlock[1]} code={codeBlock[2].trim()} />;
    const inlineCode = part.match(/^`([^`]+)`$/);
    if (inlineCode) return <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{inlineCode[1]}</code>;

    return (
      <span key={i}>
        {part.split("\n").map((line, li) => {
          if (line.startsWith("### ")) return <h3 key={li} className="text-base font-semibold mt-5 mb-2 text-foreground">{line.slice(4)}</h3>;
          if (line.startsWith("## ")) return <h2 key={li} className="text-lg font-bold mt-6 mb-3 text-foreground border-b border-border pb-1">{line.slice(3)}</h2>;
          if (line.startsWith("# ")) return <h1 key={li} className="text-xl font-bold mt-4 mb-3 text-foreground">{line.slice(2)}</h1>;
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

interface GeneratorOutputProps {
  content: string;
  isStreaming: boolean;
  onRegenerate?: () => void;
  className?: string;
}

export function GeneratorOutput({ content, isStreaming, onRegenerate, className }: GeneratorOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-output.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!content && !isStreaming) return null;

  return (
    <div className={cn("glass rounded-lg flex flex-col", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", isStreaming ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
          <span className="text-xs text-muted-foreground font-medium">
            {isStreaming ? "Generating..." : "Output"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onRegenerate && !isStreaming && content && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onRegenerate}>
              <RefreshCw className="w-3 h-3" /> Regenerate
            </Button>
          )}
          {content && !isStreaming && (
            <>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCopyAll}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleDownload}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 prose prose-sm max-w-none">
        {renderMarkdown(content)}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}
