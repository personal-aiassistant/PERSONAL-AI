import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const maxDuration = 120;

type GeneratorType = "architecture" | "prd" | "api" | "documentation" | "schema" | "docker" | "cicd";

function buildSystemPrompt(type: GeneratorType): string {
  const base = `You are CodeForge AI, an expert software architect and developer. Generate production-ready, comprehensive output. Use proper Markdown formatting with headers, code blocks, tables, and bullet lists.`;

  const prompts: Record<GeneratorType, string> = {
    architecture: `${base}
You specialize in system architecture design. When given a project description, generate:
1. **System Overview** — High-level architecture description
2. **Technology Stack** — Frontend, Backend, Database, DevOps tools with justification
3. **System Components** — Detailed breakdown of each service/module
4. **Data Flow** — How data moves through the system (describe as ASCII diagram)
5. **API Design** — REST/GraphQL endpoints overview
6. **Database Schema** — Core tables and relationships
7. **Infrastructure** — Deployment architecture (cloud services, containers)
8. **Security Considerations** — Auth, authorization, data protection
9. **Scalability Plan** — How to scale each component
10. **Development Phases** — Phased implementation plan`,

    prd: `${base}
You specialize in Product Requirements Documents. When given a product idea, generate a comprehensive PRD including:
1. **Executive Summary**
2. **Problem Statement**
3. **Goals & Success Metrics** (KPIs with specific numbers)
4. **Target Users** (personas with details)
5. **Feature Requirements** (must-have, should-have, nice-to-have)
6. **User Stories** (in "As a [user], I want to [action] so that [benefit]" format)
7. **Acceptance Criteria** for each major feature
8. **Non-functional Requirements** (performance, security, accessibility)
9. **Technical Constraints**
10. **Timeline & Milestones**
11. **Open Questions & Risks**`,

    api: `${base}
You specialize in API design. Generate a comprehensive REST API specification including:
1. **API Overview** — Base URL, versioning, authentication
2. **Authentication** — JWT/OAuth flow with examples
3. **Endpoints** — Full CRUD for each resource with:
   - Method, path, description
   - Request headers, params, body (with TypeScript interfaces)
   - Response schema (success + error)
   - Example curl commands
4. **Error Codes** — Standard error response format
5. **Rate Limiting** — Strategy and limits
6. **Webhooks** (if applicable)
7. **OpenAPI/Swagger snippet** for key endpoints`,

    documentation: `${base}
Generate comprehensive project documentation including:
1. **README** — Project overview, badges, quick start
2. **Installation Guide** — Step-by-step setup
3. **Configuration** — Environment variables with descriptions
4. **Usage Examples** — Code examples for key features
5. **Architecture Overview**
6. **API Reference** — Key endpoints
7. **Contributing Guide**
8. **Changelog template**
9. **License section**`,

    schema: `${base}
Generate a comprehensive database schema including:
1. **Entity Relationship Overview**
2. **SQL Schema** — CREATE TABLE statements with constraints, indexes
3. **TypeScript Types** — Matching interfaces for each table
4. **Seed Data** — Sample INSERT statements
5. **Migration Strategy** — How to evolve the schema
6. **RLS Policies** (if using Supabase/PostgreSQL)
7. **Performance Indexes** — Recommended indexes with justification`,

    docker: `${base}
Generate complete Docker configuration including:
1. **Dockerfile** — Multi-stage build for production
2. **docker-compose.yml** — Full development stack
3. **docker-compose.prod.yml** — Production configuration
4. **.dockerignore** — Files to exclude
5. **Environment variables** — .env.example
6. **Health checks** — Readiness and liveness probes
7. **Networking** — Service communication
8. **Volume management** — Persistent data strategy`,

    cicd: `${base}
Generate complete CI/CD pipeline configuration including:
1. **GitHub Actions workflow** — Build, test, deploy
2. **Environment stages** — dev, staging, production
3. **Secrets management** — How to handle API keys
4. **Test pipeline** — Unit, integration, e2e
5. **Docker build & push**
6. **Deployment strategy** — Blue-green or rolling
7. **Rollback plan**
8. **Monitoring & alerts setup**`,
  };

  return prompts[type] ?? base;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 503 }
      );
    }

    const user = await requireAuth();
    const body = await request.json();
    const { type, input, generator_id, model = "gpt-4o" } = body as {
      type: GeneratorType;
      input: Record<string, string>;
      generator_id?: string;
      model?: string;
    };

    if (!type || !input) {
      return NextResponse.json({ error: "type and input are required" }, { status: 400 });
    }

    // Build user prompt from input
    const userPrompt = Object.entries(input)
      .map(([k, v]) => `**${k}:** ${v}`)
      .join("\n");

    // Update generator status to generating
    if (generator_id) {
      await db.query(
        "UPDATE public.generators SET status = 'generating' WHERE id = $1 AND user_id = $2",
        [generator_id, user.id]
      );
    }

    const result = streamText({
      model: openai(model),
      system: buildSystemPrompt(type),
      prompt: userPrompt,
      onFinish: async ({ text, usage }) => {
        if (generator_id) {
          await db.query(
            `UPDATE public.generators
             SET output = $3, status = 'complete', tokens_used = $4, model = $5
             WHERE id = $1 AND user_id = $2`,
            [generator_id, user.id, text, usage.totalTokens ?? null, model]
          );
        }
      },
    });

    return result.toDataStreamResponse({ sendUsage: false });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/generators/generate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
