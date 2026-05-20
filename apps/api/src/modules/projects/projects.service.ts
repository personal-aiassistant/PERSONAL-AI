import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, status?: string) {
    return this.prisma.project.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { generators: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        generators: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { generators: true },
        },
      },
    });

    if (!project) throw new NotFoundException("Project not found");
    if (project.userId !== userId) throw new ForbiddenException("Access denied");

    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        workspaceId: dto.workspaceId,
        techStack: dto.techStack || [],
        status: "active",
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException("Project not found");
    if (project.userId !== userId) throw new ForbiddenException("Access denied");

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.techStack !== undefined && { techStack: dto.techStack }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException("Project not found");
    if (project.userId !== userId) throw new ForbiddenException("Access denied");

    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }

  async getStats(userId: string) {
    const [total, active, archived, recentGenerators] = await Promise.all([
      this.prisma.project.count({ where: { userId } }),
      this.prisma.project.count({ where: { userId, status: "active" } }),
      this.prisma.project.count({ where: { userId, status: "archived" } }),
      this.prisma.generator.count({
        where: {
          userId,
          createdAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
    ]);

    return { total, active, archived, recentGenerators };
  }
}
