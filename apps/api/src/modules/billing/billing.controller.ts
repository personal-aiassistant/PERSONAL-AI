import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { IsString, IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BillingService } from "./billing.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";

class UpgradePlanDto {
  @ApiProperty({ enum: ["free", "pro", "team"] })
  @IsString()
  @IsIn(["free", "pro", "team"])
  planId: string;
}

@ApiTags("Billing")
@ApiBearerAuth()
@Controller("billing")
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get("plans")
  @Public()
  @ApiOperation({ summary: "Get all available plans" })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Get("current")
  @ApiOperation({ summary: "Get current user plan and usage" })
  async getCurrent(@CurrentUser() user: AuthUser) {
    return this.billingService.getCurrentPlan(user.userId);
  }

  @Get("usage")
  @ApiOperation({ summary: "Get usage breakdown (last 30 days)" })
  async getUsage(@CurrentUser() user: AuthUser) {
    return this.billingService.getUsageBreakdown(user.userId);
  }

  @Post("upgrade")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upgrade/change plan" })
  async upgradePlan(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpgradePlanDto
  ) {
    return this.billingService.upgradePlan(user.userId, dto.planId);
  }
}
