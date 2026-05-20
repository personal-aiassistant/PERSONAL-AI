import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  constructor(private prisma: PrismaService) {}

  async heartbeat(userId: string, metadata?: Record<string, unknown>) {
    const meta = metadata ? (metadata as object) : undefined;
    await this.prisma.userPresence.upsert({
      where: { userId },
      create: {
        userId,
        lastSeen: new Date(),
        isOnline: true,
        ...(meta !== undefined && { metadata: meta }),
      },
      update: {
        lastSeen: new Date(),
        isOnline: true,
        ...(meta !== undefined && { metadata: meta }),
      },
    });
    return { ok: true };
  }

  async setOffline(userId: string) {
    await this.prisma.userPresence.upsert({
      where: { userId },
      create: {
        userId,
        lastSeen: new Date(),
        isOnline: false,
        metadata: {},
      },
      update: {
        isOnline: false,
      },
    });
    return { ok: true };
  }

  async getPresence(userId: string) {
    const presence = await this.prisma.userPresence.findUnique({
      where: { userId },
    });

    if (!presence) return { isOnline: false, lastSeen: null };

    const isOnline =
      presence.isOnline &&
      Date.now() - presence.lastSeen.getTime() < ONLINE_THRESHOLD_MS;

    return {
      isOnline,
      lastSeen: presence.lastSeen,
    };
  }

  async getWorkspacePresence(workspaceId: string) {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true },
    });

    const userIds = members.map((m) => m.userId);

    const presences = await this.prisma.userPresence.findMany({
      where: { userId: { in: userIds } },
    });

    const onlineThreshold = new Date(Date.now() - ONLINE_THRESHOLD_MS);

    return presences.map((p) => ({
      userId: p.userId,
      isOnline: p.isOnline && p.lastSeen > onlineThreshold,
      lastSeen: p.lastSeen,
    }));
  }
}
