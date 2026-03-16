import type { MiddlewareHandler, Next } from "hono";
import { getAuth } from "@/lib/auth";
import type { AppContext, AppEnv } from "@/lib/types";

export const sessionMiddleware: MiddlewareHandler<AppEnv> = async (
  c: AppContext,
  next: Next
) => {
  const auth = getAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
