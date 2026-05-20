import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    tokenLimit: 50_000,
    features: [
      "50,000 tokens/month",
      "3 AI generator tools",
      "1 workspace",
      "Community support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 19,
    tokenLimit: 500_000,
    features: [
      "500,000 tokens/month",
      "All 7 AI generator tools",
      "5 workspaces",
      "Priority support",
      "Advanced analytics",
    ],
  },
  team: {
    id: "team",
    name: "Team",
    price: 49,
    tokenLimit: 2_000_000,
    features: [
      "2,000,000 tokens/month",
      "All 7 AI generator tools",
      "Unlimited workspaces",
      "Team collaboration",
      "Dedicated support",
      "Custom integrations",
    ],
  },
};

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  getPlans() {
    return Object.values(PLANS);
  }

  async getCurrentPlan(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { plan: true, tokenUsed: true, tokenLimit: true },
    });

    if (!profile) throw new NotFoundException("Profile not found");

    const plan = PLANS[profile.plan] || PLANS.free;

    return {
      currentPlan: plan,
      tokenUsed: profile.tokenUsed,
      tokenLimit: profile.tokenLimit,
      usagePercent: Math.round((profile.tokenUsed / profile.tokenLimit) * 100),
    };
  }

  async getUsageBreakdown(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsage, byType, dailyUsage] = await Promise.all([
      this.prisma.usageLog.aggregate({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        _sum: { tokensUsed: true },
      }),
      this.prisma.usageLog.groupBy({
        by: ["type"],
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        _sum: { tokensUsed: true },
        orderBy: { _sum: { tokensUsed: "desc" } },
      }),
      this.prisma.$queryRaw<Array<{ date: string; tokens: number }>>`
        SELECT 
          DATE(created_at) as date,
          SUM(tokens_used)::int as tokens
        FROM usage_logs
        WHERE user_id = ${userId}
          AND created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    return {
      totalTokens: totalUsage._sum.tokensUsed || 0,
      byType: byType.map((t) => ({
        type: t.type,
        tokens: t._sum.tokensUsed || 0,
      })),
      dailyUsage,
    };
  }

  async upgradePlan(userId: string, planId: string) {
    if (!PLANS[planId]) {
      throw new NotFoundException(`Plan '${planId}' not found`);
    }

    const plan = PLANS[planId];

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        plan: planId,
        tokenLimit: plan.tokenLimit,
      },
      select: { plan: true, tokenLimit: true },
    });

    return {
      message: `Successfully upgraded to ${plan.name} plan`,
      plan: profile.plan,
      tokenLimit: profile.tokenLimit,
    };
  }
}
