import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@ApiTags("Projects")
@ApiBearerAuth()
@Controller("projects")
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: "List all projects" })
  @ApiQuery({ name: "status", required: false, enum: ["active", "archived", "completed"] })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query("status") status?: string
  ) {
    return this.projectsService.findAll(user.userId, status);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get project statistics" })
  async getStats(@CurrentUser() user: AuthUser) {
    return this.projectsService.getStats(user.userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.findOne(id, user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new project" })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProjectDto
  ) {
    return this.projectsService.create(user.userId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a project" })
  async update(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProjectDto
  ) {
    return this.projectsService.update(id, user.userId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a project" })
  async remove(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.remove(id, user.userId);
  }
}
