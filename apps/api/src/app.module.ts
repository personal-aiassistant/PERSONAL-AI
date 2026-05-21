import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerBehindProxyGuard } from "./common/guards/throttler-behind-proxy.guard";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { AiModule } from "./modules/ai/ai.module";
import { BillingModule } from "./modules/billing/billing.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PresenceModule } from "./modules/presence/presence.module";
import { AdminModule } from "./modules/admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env.local", "../../.env"],
    }),
    ThrottlerModule.forRoot([
      { name: "short", ttl: 1000, limit: 10 },
      { name: "medium", ttl: 10000, limit: 50 },
      { name: "long", ttl: 60000, limit: 200 },
    ]),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    AiModule,
    BillingModule,
    AnalyticsModule,
    HealthModule,
    NotificationsModule,
    PresenceModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
