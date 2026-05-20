import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Subject, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

export interface NotificationEvent {
  userId: string;
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly eventSubject = new Subject<NotificationEvent>();

  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, message, link, read: false },
    });

    const event: NotificationEvent = {
      userId,
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link || undefined,
      read: notification.read,
      createdAt: notification.createdAt,
    };

    this.eventSubject.next(event);
    return notification;
  }

  getSSEStream(userId: string): Observable<MessageEvent> {
    return this.eventSubject.pipe(
      filter((event) => event.userId === userId),
      map(
        (event) =>
          ({
            data: JSON.stringify(event),
          }) as MessageEvent
      )
    );
  }

  async findAll(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: result.count };
  }

  async deleteOne(id: string, userId: string) {
    await this.prisma.notification.delete({ where: { id, userId } });
    return { deleted: true };
  }

  async deleteAll(userId: string) {
    const result = await this.prisma.notification.deleteMany({ where: { userId } });
    return { deleted: result.count };
  }

  async createSystemNotification(userId: string, title: string, message: string, link?: string) {
    return this.create(userId, "system", title, message, link);
  }
}
