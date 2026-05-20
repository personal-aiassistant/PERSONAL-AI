import { Injectable, Logger, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AiService } from "./ai.service";
import { GenerateDto, GeneratorType } from "./dto/generate.dto";

const SYSTEM_PROMPTS: Record<GeneratorType, string> = {
  architecture: `You are an expert software architect. Generate detailed, production-ready system architecture documentation with diagrams (use Mermaid syntax), component descriptions, technology choices, scalability considerations, and deployment strategies.`,
  prd: `You are a senior product manager. Generate comprehensive Product Requirements Documents (PRDs) with executive summary, problem statement, user stories, acceptance criteria, technical requirements, KPIs, timeline, and risks.`,
  "api-builder": `You are an API design expert. Generate complete REST API specifications in OpenAPI 3.0 format with endpoints, request/response schemas, authentication, error codes, rate limiting, and example payloads.`,
  schema: `You are a database architect. Generate normalized database schemas with tables, columns, relationships, indexes, constraints, and migration scripts. Support PostgreSQL, MySQL, and MongoDB.`,
  docker: `You are a DevOps expert. Generate production-ready Dockerfiles, docker-compose files with all services, environment variables, health checks, volumes, and networking configuration.`,
  cicd: `You are a CI/CD specialist. Generate complete pipeline configurations for GitHub Actions, GitLab CI, or CircleCI with build, test, security scan, and deployment stages.`,
  documentation: `You are a technical writer. Generate comprehensive developer documentation with getting started guides, API references, architecture overview, code examples, and troubleshooting sections.`,
};

@Injectable()
export class GeneratorsService {
  private readonly logger = new Logger(GeneratorsService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) {}

  async generate(userId: string, dto: GenerateDto) {
    const openai = this.aiService.getOpenAI();
    const model = dto.model || "gpt-4o";

    await this.aiService.checkAndConsumeTokens(userId, 4000);

    const systemPrompt = SYSTEM_PROMPTS[dto.type];

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: dto.prompt },
      ],
      max_tokens: 4096,
    });

    const output = completion.choices[0]?.message?.content || "";
    const tokensUsed = completion.usage?.total_tokens || Math.ceil(output.length / 4);

    const generator = await this.prisma.generator.create({
      data: {
        userId,
        projectId: dto.projectId,
        type: dto.type,
        prompt: dto.prompt,
        output,
        tokensUsed,
        model,
      },
    });

    await this.aiService.consumeTokens(userId, tokensUsed, `generator:${dto.type}`, model);

    return generator;
  }

  async findAll(userId: string, type?: string) {
    return this.prisma.generator.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async findOne(id: string, userId: string) {
    const generator = await this.prisma.generator.findUnique({ where: { id } });
    if (!generator) throw new NotFoundException("Generator output not found");
    if (generator.userId !== userId) throw new ForbiddenException("Access denied");
    return generator;
  }

  async remove(id: string, userId: string) {
    const generator = await this.prisma.generator.findUnique({ where: { id } });
    if (!generator) throw new NotFoundException("Generator output not found");
    if (generator.userId !== userId) throw new ForbiddenException("Access denied");
    await this.prisma.generator.delete({ where: { id } });
    return { deleted: true };
  }

  async streamGenerate(
    userId: string,
    dto: GenerateDto,
    onChunk: (chunk: string) => void
  ): Promise<{ tokensUsed: number; id: string }> {
    const openai = this.aiService.getOpenAI();
    const model = dto.model || "gpt-4o";

    await this.aiService.checkAndConsumeTokens(userId, 4000);

    const systemPrompt = SYSTEM_PROMPTS[dto.type];

    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: dto.prompt },
      ],
      stream: true,
      max_tokens: 4096,
    });

    let fullOutput = "";
    let totalTokens = 0;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        fullOutput += delta;
        onChunk(delta);
      }
      if (chunk.usage) {
        totalTokens = chunk.usage.total_tokens;
      }
    }

    const tokensUsed = totalTokens || Math.ceil(fullOutput.length / 4);

    const generator = await this.prisma.generator.create({
      data: {
        userId,
        projectId: dto.projectId,
        type: dto.type,
        prompt: dto.prompt,
        output: fullOutput,
        tokensUsed,
        model,
      },
    });

    await this.aiService.consumeTokens(userId, tokensUsed, `generator:${dto.type}`, model);

    return { tokensUsed, id: generator.id };
  }
}
