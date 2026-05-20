import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import OpenAI from "openai";

const PLAN_LIMITS: Record<string, number> = {
  free: 50_000,
  pro: 500_000,
  team: 2_000_000,
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async checkAndConsumeTokens(userId: string, estimatedTokens: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { tokenUsed: true, tokenLimit: true, plan: true },
    });

    if (!profile) throw new Error("Profile not found");

    const limit = PLAN_LIMITS[profile.plan] || PLAN_LIMITS.free;

    if (profile.tokenUsed + estimatedTokens > limit) {
      throw new HttpException(
        "Token limit exceeded. Please upgrade your plan.",
        HttpStatus.PAYMENT_REQUIRED
      );
    }

    return profile;
  }

  async consumeTokens(userId: string, tokensUsed: number, type: string, model: string) {
    await Promise.all([
      this.prisma.profile.update({
        where: { userId },
        data: { tokenUsed: { increment: tokensUsed } },
      }),
      this.prisma.usageLog.create({
        data: {
          userId,
          type,
          tokensUsed,
          model,
        },
      }),
    ]);
  }

  async getChatHistory(userId: string, sessionId?: string, limit = 50) {
    return this.prisma.chatHistory.findMany({
      where: {
        userId,
        ...(sessionId ? { sessionId } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async saveChatMessage(
    userId: string,
    role: string,
    content: string,
    model: string,
    sessionId?: string
  ) {
    return this.prisma.chatHistory.create({
      data: { userId, role, content, model, sessionId },
    });
  }

  async deleteChatSession(userId: string, sessionId?: string) {
    await this.prisma.chatHistory.deleteMany({
      where: {
        userId,
        ...(sessionId ? { sessionId } : {}),
      },
    });
    return { deleted: true };
  }

  getOpenAI(): OpenAI {
    if (!this.openai) {
      throw new ServiceUnavailableException("OpenAI API key not configured");
    }
    return this.openai;
  }
}
