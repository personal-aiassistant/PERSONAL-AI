import { PartialType } from "@nestjs/swagger";
import { CreateProjectDto } from "./create-project.dto";
import { IsOptional, IsString, IsIn } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ enum: ["active", "archived", "completed"] })
  @IsOptional()
  @IsString()
  @IsIn(["active", "archived", "completed"])
  status?: string;
}
