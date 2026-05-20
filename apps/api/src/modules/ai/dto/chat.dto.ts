import { IsString, IsArray, IsOptional, IsIn, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ChatMessageDto {
  @ApiProperty({ enum: ["user", "assistant", "system"] })
  @IsString()
  @IsIn(["user", "assistant", "system"])
  role: "user" | "assistant" | "system";

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatDto {
  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiPropertyOptional({ default: "gpt-4o" })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}
