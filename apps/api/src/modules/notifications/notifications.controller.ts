import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Sse,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Observable } from "rxjs";
import { NotificationsService } from "./notifications.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Sse("stream")
  @ApiOperation({ summary: "SSE stream — real-time notifications" })
  stream(@CurrentUser() user: AuthUser): Observable<MessageEvent> {
    return this.notificationsService.getSSEStream(user.userId);
  }

  @Get()
  @ApiOperation({ summary: "List notifications" })
  @ApiQuery({ name: "unreadOnly", required: false, type: Boolean })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query("unreadOnly") unreadOnly?: string
  ) {
    return this.notificationsService.findAll(user.userId, unreadOnly === "true");
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  async getUnreadCount(@CurrentUser() user: AuthUser) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  async markAsRead(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Patch("mark-all-read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(@CurrentUser() user: AuthUser) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a notification" })
  async deleteOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.notificationsService.deleteOne(id, user.userId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete all notifications" })
  async deleteAll(@CurrentUser() user: AuthUser) {
    return this.notificationsService.deleteAll(user.userId);
  }
}
