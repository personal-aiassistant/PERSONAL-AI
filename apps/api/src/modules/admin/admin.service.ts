import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async assertAdmin(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { role: true },
    });
    if (!profile || profile.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }
  }

  async getSystemStats(requestingUserId: string) {
    await this.assertAdmin(requestingUserId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisMonth,
      activeUsersToday,
      totalProjects,
      totalGenerations,
      generationsThisMonth,
      totalChatMessages,
      planBreakdown,
      topGeneratorTypes,
      recentSignups,
      tokenStats,
    ] = await Promise.all([
      this.prisma.profile.count(),
      this.prisma.profile.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.profile.count({ where: { updatedAt: { gte: yesterday } } }),
      this.prisma.project.count(),
      this.prisma.generator.count(),
      this.prisma.generator.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.chatHistory.count({ where: { role: "user" } }),
      this.prisma.profile.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
      this.prisma.generator.groupBy({
        by: ["type"],
        _count: { type: true },
        orderBy: { _count: { type: "desc" } },
        take: 8,
      }),
      this.prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          userId: true,
          fullName: true,
          email: true,
          plan: true,
          createdAt: true,
          tokenUsed: true,
        },
      }),
      this.prisma.profile.aggregate({
        _sum: { tokenUsed: true },
        _avg: { tokenUsed: true },
        _max: { tokenUsed: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        activeToday: activeUsersToday,
      },
      content: {
        totalProjects,
        totalGenerations,
        generationsThisMonth,
        totalChatMessages,
      },
      plans: planBreakdown.map((p) => ({ plan: p.plan, count: p._count.plan })),
      topGeneratorTypes: topGeneratorTypes.map((g) => ({
        type: g.type,
        count: g._count.type,
      })),
      recentSignups,
      tokens: {
        totalUsed: tokenStats._sum.tokenUsed || 0,
        avgPerUser: Math.round(tokenStats._avg.tokenUsed || 0),
        maxByUser: tokenStats._max.tokenUsed || 0,
      },
    };
  }

  async getUsers(
    requestingUserId: string,
    page = 1,
    limit = 20,
    search?: string
  ) {
    await this.assertAdmin(requestingUserId);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { fullName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          userId: true,
          fullName: true,
          email: true,
          plan: true,
          role: true,
          tokenUsed: true,
          tokenLimit: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUserPlan(
    requestingUserId: string,
    targetUserId: string,
    plan: string
  ) {
    await this.assertAdmin(requestingUserId);

    const limits: Record<string, number> = {
      free: 100_000,
      pro: 2_000_000,
      team: 10_000_000,
    };

    return this.prisma.profile.update({
      where: { userId: targetUserId },
      data: { plan, tokenLimit: limits[plan] || 100_000 },
      select: {
        userId: true,
        fullName: true,
        email: true,
        plan: true,
        tokenLimit: true,
      },
    });
  }

  async updateUserRole(
    requestingUserId: string,
    targetUserId: string,
    role: string
  ) {
    await this.assertAdmin(requestingUserId);
    if (targetUserId === requestingUserId) {
      throw new ForbiddenException("Cannot change your own role");
    }
    return this.prisma.profile.update({
      where: { userId: targetUserId },
      data: { role },
      select: { userId: true, fullName: true, email: true, role: true },
    });
  }

  async getDailySignups(requestingUserId: string, days = 30) {
    await this.assertAdmin(requestingUserId);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const signups = await this.prisma.profile.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const buckets: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    for (const s of signups) {
      const key = s.createdAt.toISOString().slice(0, 10);
      if (key in buckets) buckets[key]++;
    }

    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  }
}
