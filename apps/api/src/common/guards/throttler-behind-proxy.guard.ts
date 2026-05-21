import { ThrottlerGuard } from "@nestjs/throttler";
import { Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0].trim();
      return ip;
    }
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  protected async throwThrottlingException(): Promise<void> {
    const { ThrottlerException } = await import("@nestjs/throttler");
    throw new ThrottlerException("Too many requests — please slow down");
  }
}
