import { rateLimiter } from "hono-rate-limiter";
import type { AppEnv } from "@/lib/types";

export const rateLimiterMiddleware = rateLimiter<AppEnv>({
  binding: (c) => c.env.SUBSCRIPTION_RATE_LIMITER,
  keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  message: "Rate limit exceeded",
  statusCode: 429,
});
