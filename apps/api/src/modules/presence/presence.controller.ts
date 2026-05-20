import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { PresenceService } from "./presence.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

class HeartbeatDto {
  @IsOptional()
  metadata?: Record<string, unknown>;
}

@ApiTags("Presence")
@ApiBearerAuth()
@Controller("presence")
export class PresenceController {
  constructor(private presenceService: PresenceService) {}

  @Post("heartbeat")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send presence heartbeat (every 60s)" })
  async heartbeat(
    @CurrentUser() user: AuthUser,
    @Body() dto: HeartbeatDto
  ) {
    return this.presenceService.heartbeat(user.userId, dto.metadata);
  }

  @Post("offline")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark user as offline" })
  async setOffline(@CurrentUser() user: AuthUser) {
    return this.presenceService.setOffline(user.userId);
  }

  @Get("me")
  @ApiOperation({ summary: "Get own presence status" })
  async getMyPresence(@CurrentUser() user: AuthUser) {
    return this.presenceService.getPresence(user.userId);
  }

  @Get("workspace/:workspaceId")
  @ApiOperation({ summary: "Get workspace members presence" })
  async getWorkspacePresence(@Param("workspaceId") workspaceId: string) {
    return this.presenceService.getWorkspacePresence(workspaceId);
  }
}
