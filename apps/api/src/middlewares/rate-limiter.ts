import type { MiddlewareHandler, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import type { AppContext, AppEnv } from "@/lib/types";

const baseRateLimiter = rateLimiter<AppEnv>({
  binding: (c) => c.env.API_RATE_LIMITER,
  keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  message: "Rate limit exceeded",
  statusCode: 429,
});

export const rateLimiterMiddleware: MiddlewareHandler<AppEnv> = async (
  c: AppContext,
  next: Next
) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }
  return baseRateLimiter(c, next);
};
