import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../../prisma/prisma.service";

interface JwtPayload {
  sub: string;
  email: string;
  aud?: string;
  iss?: string;
  exp?: number;
  iat?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("SUPABASE_JWT_SECRET") || "fallback-secret",
      algorithms: ["HS256"],
    });
  }

  async validate(payload: JwtPayload) {
    const userId = payload.sub;
    const email = payload.email;

    if (!userId || !email) {
      throw new UnauthorizedException("Invalid token payload");
    }

    let profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      try {
        profile = await this.prisma.profile.create({
          data: {
            userId,
            email,
            plan: "free",
            tokenUsed: 0,
            tokenLimit: 50000,
          },
        });
        this.logger.log(`Auto-created profile for user ${userId}`);
      } catch (error) {
        this.logger.error(`Failed to auto-create profile: ${error}`);
        throw new UnauthorizedException("User profile could not be created");
      }
    }

    return {
      id: profile.id,
      userId: profile.userId,
      email: profile.email,
      plan: profile.plan,
      tokenUsed: profile.tokenUsed,
      tokenLimit: profile.tokenLimit,
    };
  }
}
