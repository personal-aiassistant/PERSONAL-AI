import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface SearchResult {
  id: string;
  type: "project" | "generator" | "chat";
  title: string;
  subtitle: string;
  href: string;
  createdAt: Date;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(userId: string, query: string, limit = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim().toLowerCase();

    const [projects, generators, chats] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
          status: { not: "deleted" },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: { id: true, name: true, description: true, status: true, createdAt: true },
      }),
      this.prisma.generator.findMany({
        where: {
          userId,
          OR: [
            { prompt: { contains: q, mode: "insensitive" } },
            { output: { contains: q, mode: "insensitive" } },
            { type: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, type: true, prompt: true, createdAt: true },
      }),
      this.prisma.chatHistory.findMany({
        where: {
          userId,
          role: "user",
          content: { contains: q, mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, content: true, sessionId: true, createdAt: true },
        distinct: ["sessionId"],
      }),
    ]);

    const results: SearchResult[] = [];

    for (const p of projects) {
      results.push({
        id: p.id,
        type: "project",
        title: p.name,
        subtitle: p.description || p.status,
        href: `/projects`,
        createdAt: p.createdAt,
      });
    }

    for (const g of generators) {
      results.push({
        id: g.id,
        type: "generator",
        title: `${g.type.replace(/-/g, " ")} — ${g.prompt.slice(0, 60)}${g.prompt.length > 60 ? "…" : ""}`,
        subtitle: `AI Generator · ${g.type}`,
        href: `/${g.type === "api-builder" ? "api-builder" : g.type === "code-review" ? "code-review" : g.type}`,
        createdAt: g.createdAt,
      });
    }

    for (const c of chats) {
      results.push({
        id: c.id,
        type: "chat",
        title: c.content.slice(0, 80) + (c.content.length > 80 ? "…" : ""),
        subtitle: "AI Chat",
        href: `/ai-chat`,
        createdAt: c.createdAt,
      });
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return results.slice(0, limit);
  }
}
