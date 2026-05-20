import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
      },
    });

    return profile;
  }

  async getUsageSummary(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        tokenUsed: true,
        tokenLimit: true,
        plan: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    const generatorsThisMonth = await this.prisma.generator.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    const chatMessagesThisMonth = await this.prisma.chatHistory.count({
      where: {
        userId,
        role: "user",
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    return {
      tokenUsed: profile.tokenUsed,
      tokenLimit: profile.tokenLimit,
      plan: profile.plan,
      usagePercent: Math.round((profile.tokenUsed / profile.tokenLimit) * 100),
      generatorsThisMonth,
      chatMessagesThisMonth,
    };
  }
}
