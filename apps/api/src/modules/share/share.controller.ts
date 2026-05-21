import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { ShareService } from "./share.service";

@ApiTags("share")
@Controller("api/v1/share")
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a shareable link for generator output" })
  async createShare(
    @Req() req: { user: { sub: string } },
    @Body()
    body: {
      title: string;
      content: string;
      generatorType: string;
      generatorId?: string;
      expiresInDays?: number;
    }
  ) {
    const data = await this.shareService.createShare(req.user.sub, body);
    return { data };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List my shared outputs" })
  async listMyShares(@Req() req: { user: { sub: string } }) {
    const data = await this.shareService.listMyShares(req.user.sub);
    return { data };
  }

  @Get(":token")
  @Public()
  @ApiOperation({ summary: "Get shared output by token (public)" })
  async getShare(@Param("token") token: string) {
    const data = await this.shareService.getShare(token);
    return { data };
  }

  @Delete(":id")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a share" })
  async deleteShare(
    @Req() req: { user: { sub: string } },
    @Param("id") id: string
  ) {
    const data = await this.shareService.deleteShare(req.user.sub, id);
    return { data };
  }
}
