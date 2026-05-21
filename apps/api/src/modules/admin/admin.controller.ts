import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { IsString, IsIn } from "class-validator";
import { AdminService } from "./admin.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

class UpdatePlanDto {
  @IsString()
  @IsIn(["free", "pro", "team"])
  plan: string;
}

class UpdateRoleDto {
  @IsString()
  @IsIn(["user", "admin"])
  role: string;
}

@ApiTags("Admin")
@ApiBearerAuth()
@Controller("admin")
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get system-wide statistics (admin only)" })
  async getStats(@CurrentUser() user: AuthUser) {
    return this.adminService.getSystemStats(user.userId);
  }

  @Get("users")
  @ApiOperation({ summary: "List all users (admin only)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  async getUsers(
    @CurrentUser() user: AuthUser,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("search") search?: string
  ) {
    return this.adminService.getUsers(user.userId, page, limit, search);
  }

  @Patch("users/:id/plan")
  @ApiOperation({ summary: "Update user plan (admin only)" })
  async updatePlan(
    @CurrentUser() user: AuthUser,
    @Param("id") targetId: string,
    @Body() dto: UpdatePlanDto
  ) {
    return this.adminService.updateUserPlan(user.userId, targetId, dto.plan);
  }

  @Patch("users/:id/role")
  @ApiOperation({ summary: "Update user role (admin only)" })
  async updateRole(
    @CurrentUser() user: AuthUser,
    @Param("id") targetId: string,
    @Body() dto: UpdateRoleDto
  ) {
    return this.adminService.updateUserRole(user.userId, targetId, dto.role);
  }

  @Get("signups")
  @ApiOperation({ summary: "Get daily signups chart data (admin only)" })
  @ApiQuery({ name: "days", required: false, type: Number })
  async getSignups(
    @CurrentUser() user: AuthUser,
    @Query("days", new DefaultValuePipe(30), ParseIntPipe) days: number
  ) {
    return this.adminService.getDailySignups(user.userId, days);
  }
}
