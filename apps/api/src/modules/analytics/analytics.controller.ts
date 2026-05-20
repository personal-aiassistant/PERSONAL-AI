import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Analytics")
@ApiBearerAuth()
@Controller("analytics")
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard statistics" })
  async getDashboard(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getDashboardStats(user.userId);
  }

  @Get("token-trends")
  @ApiOperation({ summary: "Get token usage trends" })
  @ApiQuery({ name: "days", required: false, type: Number })
  async getTokenTrends(
    @CurrentUser() user: AuthUser,
    @Query("days") days?: number
  ) {
    return this.analyticsService.getTokenTrends(user.userId, days || 30);
  }

  @Get("generators")
  @ApiOperation({ summary: "Get generator breakdown analytics" })
  async getGenerators(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getGeneratorBreakdown(user.userId);
  }
}
