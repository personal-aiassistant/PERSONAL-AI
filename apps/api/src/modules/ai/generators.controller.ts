import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Response } from "express";
import { GeneratorsService } from "./generators.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { AiThrottle } from "../../common/decorators/throttle.decorator";
import { GenerateDto } from "./dto/generate.dto";

@ApiTags("AI Generators")
@ApiBearerAuth()
@Controller("generators")
export class GeneratorsController {
  constructor(private generatorsService: GeneratorsService) {}

  @Post("generate")
  @AiThrottle()
  @ApiOperation({ summary: "Generate AI output (streaming)" })
  async generate(
    @CurrentUser() user: AuthUser,
    @Body() dto: GenerateDto,
    @Res() res: Response
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    try {
      const { tokensUsed, id } = await this.generatorsService.streamGenerate(
        user.userId,
        dto,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      );

      res.write(
        `data: ${JSON.stringify({ done: true, tokensUsed, id })}\n\n`
      );
      res.end();
    } catch (error: any) {
      res.write(
        `data: ${JSON.stringify({ error: error.message || "Generation failed" })}\n\n`
      );
      res.end();
    }
  }

  @Get()
  @ApiOperation({ summary: "List generator history" })
  @ApiQuery({ name: "type", required: false })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query("type") type?: string
  ) {
    return this.generatorsService.findAll(user.userId, type);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get generator output by ID" })
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.generatorsService.findOne(id, user.userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete generator output" })
  async remove(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.generatorsService.remove(id, user.userId);
  }
}
