import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat",
};

export default function AiChatPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">AI Chat</p>
        <p className="text-sm text-muted-foreground">Coming in Phase 2</p>
      </div>
    </div>
  );
}
