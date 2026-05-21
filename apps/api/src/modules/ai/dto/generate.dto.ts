import { IsString, IsOptional, IsIn, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export type GeneratorType =
  | "architecture"
  | "prd"
  | "api-builder"
  | "schema"
  | "docker"
  | "cicd"
  | "documentation"
  | "code-review";

export class GenerateDto {
  @ApiProperty({
    enum: ["architecture", "prd", "api-builder", "schema", "docker", "cicd", "documentation", "code-review"],
  })
  @IsString()
  @IsIn(["architecture", "prd", "api-builder", "schema", "docker", "cicd", "documentation", "code-review"])
  type: GeneratorType;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  prompt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ default: "gpt-4o" })
  @IsOptional()
  @IsString()
  model?: string;
}
