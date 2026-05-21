import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async createShare(
    userId: string,
    body: {
      title: string;
      content: string;
      generatorType: string;
      generatorId?: string;
      expiresInDays?: number;
    }
  ) {
    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 86_400_000)
      : null;

    const result = await this.prisma.$queryRaw<
      { id: string; token: string; created_at: Date }[]
    >`
      INSERT INTO public.shared_outputs (user_id, generator_id, title, content, generator_type, expires_at)
      VALUES (
        ${userId}::uuid,
        ${body.generatorId ?? null}::uuid,
        ${body.title},
        ${body.content},
        ${body.generatorType},
        ${expiresAt}
      )
      RETURNING id, token, created_at
    `;

    return result[0];
  }

  async getShare(token: string) {
    const rows = await this.prisma.$queryRaw<
      {
        id: string;
        token: string;
        title: string;
        content: string;
        generator_type: string;
        view_count: number;
        expires_at: Date | null;
        created_at: Date;
      }[]
    >`
      SELECT id, token, title, content, generator_type, view_count, expires_at, created_at
      FROM public.shared_outputs
      WHERE token = ${token}
      LIMIT 1
    `;

    if (!rows.length) throw new NotFoundException("Share not found");

    const share = rows[0];
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      throw new NotFoundException("Share link has expired");
    }

    await this.prisma.$executeRaw`
      UPDATE public.shared_outputs SET view_count = view_count + 1 WHERE token = ${token}
    `;

    return share;
  }

  async listMyShares(userId: string) {
    return this.prisma.$queryRaw<
      { id: string; token: string; title: string; generator_type: string; view_count: number; created_at: Date }[]
    >`
      SELECT id, token, title, generator_type, view_count, created_at
      FROM public.shared_outputs
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `;
  }

  async deleteShare(userId: string, shareId: string) {
    const rows = await this.prisma.$queryRaw<{ user_id: string }[]>`
      SELECT user_id FROM public.shared_outputs WHERE id = ${shareId}::uuid LIMIT 1
    `;
    if (!rows.length) throw new NotFoundException("Share not found");
    if (rows[0].user_id !== userId) throw new ForbiddenException();
    await this.prisma.$executeRaw`DELETE FROM public.shared_outputs WHERE id = ${shareId}::uuid`;
    return { deleted: true };
  }
}
