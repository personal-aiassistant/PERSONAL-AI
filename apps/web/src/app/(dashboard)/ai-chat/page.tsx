import type { Metadata } from "next";
import { AiChatContent } from "@/modules/ai-chat/components/ai-chat-content";

export const metadata: Metadata = {
  title: "AI Chat",
};

export default function AiChatPage() {
  return <AiChatContent />;
}
