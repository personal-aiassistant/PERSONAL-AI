import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { AiService } from "./ai.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { ChatDto } from "./dto/chat.dto";

@ApiTags("AI Chat")
@ApiBearerAuth()
@Controller("ai")
export class AiController {
  constructor(private aiService: AiService) {}

  @Post("chat")
  @ApiOperation({ summary: "Send a chat message (streaming)" })
  async chat(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChatDto,
    @Res() res: Response
  ) {
    const openai = this.aiService.getOpenAI();
    const model = dto.model || "gpt-4o";

    await this.aiService.checkAndConsumeTokens(user.userId, 2000);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const userMessage = dto.messages[dto.messages.length - 1];
    await this.aiService.saveChatMessage(
      user.userId,
      "user",
      userMessage.content,
      model,
      dto.sessionId
    );

    try {
      const stream = await openai.chat.completions.create({
        model,
        messages: dto.messages,
        stream: true,
        max_tokens: 2048,
      });

      let fullContent = "";
      let totalTokens = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullContent += delta;
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
        if (chunk.usage) {
          totalTokens = chunk.usage.total_tokens;
        }
      }

      await this.aiService.saveChatMessage(
        user.userId,
        "assistant",
        fullContent,
        model,
        dto.sessionId
      );

      const tokensUsed = totalTokens || Math.ceil(fullContent.length / 4);
      await this.aiService.consumeTokens(user.userId, tokensUsed, "chat", model);

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
      res.end();
    }
  }

  @Get("history")
  @ApiOperation({ summary: "Get chat history" })
  async getHistory(
    @CurrentUser() user: AuthUser,
    @Query("sessionId") sessionId?: string,
    @Query("limit") limit?: number
  ) {
    return this.aiService.getChatHistory(user.userId, sessionId, limit);
  }

  @Delete("history")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete chat history" })
  async deleteHistory(
    @CurrentUser() user: AuthUser,
    @Query("sessionId") sessionId?: string
  ) {
    return this.aiService.deleteChatSession(user.userId, sessionId);
  }
}
