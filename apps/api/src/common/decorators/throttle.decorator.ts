import { SetMetadata } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

export const AiThrottle = () => Throttle({ short: { ttl: 60000, limit: 20 }, medium: { ttl: 3600000, limit: 200 } });
export const StrictThrottle = () => Throttle({ short: { ttl: 60000, limit: 5 }, medium: { ttl: 3600000, limit: 30 } });
export const AdminThrottle = () => Throttle({ short: { ttl: 60000, limit: 30 }, medium: { ttl: 3600000, limit: 300 } });

export const SKIP_THROTTLE_KEY = "skipThrottle";
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);
