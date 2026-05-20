export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  project_id: string | null;
  user_id: string;
  model: string | null;
  tokens_used: number | null;
  created_at: string;
}
