"use client";

import { useRef, KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) {
        onSubmit();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  };

  return (
    <div className="relative flex items-end gap-2 bg-background border border-input rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 shadow-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything... (Shift+Enter for newline)"
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          "min-h-[24px] max-h-[160px] py-0.5 leading-relaxed",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        style={{ height: "auto" }}
      />
      {isStreaming ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
          onClick={onStop}
        >
          <Square className="w-4 h-4 fill-current" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!value.trim() || disabled}
          onClick={onSubmit}
        >
          <Send className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
