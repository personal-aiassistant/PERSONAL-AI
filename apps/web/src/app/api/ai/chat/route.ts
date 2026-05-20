import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const maxDuration = 60;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SUPPORTED_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
] as const;

type SupportedModel = (typeof SUPPORTED_MODELS)[number];

function isValidModel(model: string): model is SupportedModel {
  return SUPPORTED_MODELS.includes(model as SupportedModel);
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured. Please add it in Settings." },
        { status: 503 }
      );
    }

    const user = await requireAuth();
    const body = await request.json();
    const { messages, model = "gpt-4o-mini", project_id } = body as {
      messages: ChatMessage[];
      model?: string;
      project_id?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages is required" }, { status: 400 });
    }

    const selectedModel: SupportedModel = isValidModel(model) ? model : "gpt-4o-mini";

    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are CodeForge AI, an expert AI coding assistant and developer productivity tool. 
You help developers with:
- Writing, reviewing, and debugging code
- Architecting systems and designing APIs
- Generating PRDs (Product Requirements Documents)
- Creating database schemas and migrations
- Explaining complex technical concepts clearly
- Suggesting best practices and design patterns

Always provide well-structured, production-ready code with proper TypeScript types when applicable.
Format code blocks with the appropriate language identifier.
Be concise but comprehensive. Today's date: ${new Date().toISOString().split("T")[0]}.`,
    };

    const allMessages = [systemMessage, ...messages];
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();

    const result = streamText({
      model: openai(selectedModel),
      messages: allMessages,
      onFinish: async ({ text, usage }) => {
        try {
          // Save user message
          if (lastUserMessage) {
            await db.query(
              `INSERT INTO public.messages (content, role, user_id, project_id, model)
               VALUES ($1, 'user', $2, $3, $4)`,
              [lastUserMessage.content, user.id, project_id ?? null, selectedModel]
            );
          }
          // Save assistant response
          await db.query(
            `INSERT INTO public.messages (content, role, user_id, project_id, model, tokens_used)
             VALUES ($1, 'assistant', $2, $3, $4, $5)`,
            [
              text,
              user.id,
              project_id ?? null,
              selectedModel,
              usage.totalTokens ?? null,
            ]
          );
        } catch (err) {
          console.error("[AI Chat] Failed to save messages:", err);
        }
      },
    });

    return result.toDataStreamResponse({ sendUsage: false });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/ai/chat]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
