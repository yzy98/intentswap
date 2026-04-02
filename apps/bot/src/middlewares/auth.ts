import type { MiddlewareHandler, Next } from "hono";
import { authBotResponseSchema } from "@/lib/schemas";
import type { AppContext, AppEnv } from "@/lib/types";
import { jsonError } from "@/lib/utils";

export const authMiddleware: MiddlewareHandler<AppEnv> = async (
  c: AppContext,
  next: Next
) => {
  try {
    const url = new URL("/auth/bot", c.env.API_BASE_URL);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        cookie: c.req.header("Cookie") ?? "",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return jsonError(c, "Unauthorized", 401);
      }

      return jsonError(c, "Failed to authenticate", 503);
    }

    const payload = await response.json().catch(() => null);
    const parsed = authBotResponseSchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(c, "Invalid auth response", 503);
    }

    c.set("walletAddress", parsed.data.walletAddress.toLowerCase());
  } catch {
    return jsonError(c, "Failed to authenticate", 503);
  }

  await next();
};
