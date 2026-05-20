import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProjects,
      activeProjects,
      generatorsAllTime,
      generatorsThisMonth,
      chatMessages,
      tokenUsage,
      topGeneratorTypes,
      recentActivity,
    ] = await Promise.all([
      this.prisma.project.count({ where: { userId } }),
      this.prisma.project.count({ where: { userId, status: "active" } }),
      this.prisma.generator.count({ where: { userId } }),
      this.prisma.generator.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
      this.prisma.chatHistory.count({
        where: { userId, role: "user", createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.profile.findUnique({
        where: { userId },
        select: { tokenUsed: true, tokenLimit: true, plan: true },
      }),
      this.prisma.generator.groupBy({
        by: ["type"],
        where: { userId },
        _count: { type: true },
        orderBy: { _count: { type: "desc" } },
        take: 5,
      }),
      this.prisma.generator.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          type: true,
          prompt: true,
          tokensUsed: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        archived: totalProjects - activeProjects,
      },
      generators: {
        allTime: generatorsAllTime,
        thisMonth: generatorsThisMonth,
      },
      chat: {
        messagesLast30Days: chatMessages,
      },
      tokens: {
        used: tokenUsage?.tokenUsed || 0,
        limit: tokenUsage?.tokenLimit || 50000,
        plan: tokenUsage?.plan || "free",
        usagePercent: tokenUsage
          ? Math.round((tokenUsage.tokenUsed / tokenUsage.tokenLimit) * 100)
          : 0,
      },
      topGeneratorTypes: topGeneratorTypes.map((t) => ({
        type: t.type,
        count: t._count.type,
      })),
      recentActivity,
    };
  }

  async getTokenTrends(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyData = await this.prisma.$queryRaw<
      Array<{ date: string; tokens: number; requests: number }>
    >`
      SELECT 
        DATE(created_at) as date,
        SUM(tokens_used)::int as tokens,
        COUNT(*)::int as requests
      FROM usage_logs
      WHERE user_id = ${userId}
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return dailyData;
  }

  async getGeneratorBreakdown(userId: string) {
    const [byType, byModel, tokensByType] = await Promise.all([
      this.prisma.generator.groupBy({
        by: ["type"],
        where: { userId },
        _count: { type: true },
        _sum: { tokensUsed: true },
      }),
      this.prisma.generator.groupBy({
        by: ["model"],
        where: { userId },
        _count: { model: true },
      }),
      this.prisma.generator.groupBy({
        by: ["type"],
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
        _sum: { tokensUsed: true },
      }),
    ]);

    return {
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count.type,
        totalTokens: t._sum.tokensUsed || 0,
      })),
      byModel: byModel.map((m) => ({
        model: m.model,
        count: m._count.model,
      })),
      thisMonthByType: tokensByType.map((t) => ({
        type: t.type,
        tokens: t._sum.tokensUsed || 0,
      })),
    };
  }
}
