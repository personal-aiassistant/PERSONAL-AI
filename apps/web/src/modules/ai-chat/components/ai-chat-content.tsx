"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { motion } from "framer-motion";
import { Bot, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ModelSelector, type AIModel } from "./model-selector";
import { ChatSidebar, type ChatSession } from "./chat-sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Write a REST API in TypeScript with Express + Prisma",
  "Create a React component with Zustand state management",
  "Design a PostgreSQL schema for a SaaS product",
  "Generate a PRD for a mobile task management app",
  "Explain the difference between RSC and client components",
  "Write a CI/CD workflow for a Next.js app on Vercel",
];

export function AiChatContent() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [model, setModel] = useState<AIModel>("gpt-4o-mini");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    error,
  } = useChat({
    api: "/api/ai/chat",
    body: { model },
    onError: (err) => {
      if (err.message.includes("OPENAI_API_KEY")) {
        setApiKeyMissing(true);
      } else {
        toast.error(err.message ?? "Failed to get response");
      }
    },
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", user?.id] });
      // Update session title from first user message
      if (messages.length === 0 && input.trim()) {
        const title = input.trim().slice(0, 40) + (input.length > 40 ? "..." : "");
        const newSession: ChatSession = {
          id: activeSessionId ?? Date.now().toString(),
          title,
          timestamp: new Date(),
        };
        setSessions((prev) => {
          const exists = prev.find((s) => s.id === newSession.id);
          if (exists) return prev;
          return [newSession, ...prev];
        });
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(Date.now().toString());
    setApiKeyMissing(false);
  };

  const handleClearHistory = async () => {
    try {
      await fetch("/api/ai/history", { method: "DELETE" });
      setSessions([]);
      setMessages([]);
      toast.success("Chat history cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>);
  };

  const submitMessage = () => {
    if (!input.trim()) return;
    if (!activeSessionId) {
      const id = Date.now().toString();
      setActiveSessionId(id);
      const title = input.trim().slice(0, 40) + (input.length > 40 ? "..." : "");
      setSessions((prev) => [{ id, title, timestamp: new Date() }, ...prev]);
    }
    handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>);
  };

  return (
    <div className="flex h-full -m-6">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onNew={handleNewChat}
        onClear={handleClearHistory}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">CodeForge AI</span>
          </div>
          <ModelSelector model={model} onChange={setModel} />
        </div>

        {/* API Key Warning */}
        {apiKeyMissing && (
          <div className="px-4 pt-3">
            <Alert variant="warning">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                <strong>OPENAI_API_KEY</strong> is not configured. Please add it to your
                environment variables to use the AI chat.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full px-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">What can I help you build?</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                I&apos;m CodeForge AI — your expert coding assistant. Ask me to write code,
                design systems, explain concepts, or generate documentation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleStarterPrompt(prompt)}
                    className={cn(
                      "text-left text-xs px-3 py-2.5 rounded-lg border border-border",
                      "hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="py-2">
              {messages.map((message, i) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={i === messages.length - 1 && isLoading}
                />
              ))}
              {error && !apiKeyMissing && (
                <div className="px-4 py-2">
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="text-xs">{error.message}</AlertDescription>
                  </Alert>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-border shrink-0">
          <ChatInput
            value={input}
            onChange={(v) =>
              handleInputChange({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>)
            }
            onSubmit={submitMessage}
            onStop={stop}
            isStreaming={isLoading}
            disabled={apiKeyMissing}
          />
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            CodeForge AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
