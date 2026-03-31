import type { MiddlewareHandler, Next } from "hono";
import type { AppContext, AppEnv, User } from "@/lib/types";
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

    const data: {
      ok: boolean;
      user: User;
    } = await response.json();

    if (!response.ok) {
      return jsonError(c, "Unauthorized", 401);
    }

    c.set("user", data.user);
  } catch {
    return jsonError(c, "Failed to authenticate", 503);
  }

  await next();
};
