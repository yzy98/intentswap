import { Hono } from "hono";
import { logger } from "hono/logger";
import { getYogaApp } from "@/graphql/yoga";
import { getAuth } from "@/lib/auth";
import type { AppEnv } from "@/lib/types";
import { authCorsMiddleware } from "@/middlewares/cors";
import { rateLimiterMiddleware } from "@/middlewares/rate-limiter";
import { sessionMiddleware } from "@/middlewares/session";

const app = new Hono<AppEnv>();

// Middlewares
app.use(logger());
app.use("*", rateLimiterMiddleware);
app.use("/api/auth/*", authCorsMiddleware);
app.use("/graphql", sessionMiddleware);

// Auth route
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = getAuth(c.env);
  return auth.handler(c.req.raw);
});

// GraphQL route
app.all("/graphql", (c) => {
  const yoga = getYogaApp(c.env);
  return yoga.fetch(c.req.raw, {
    ...c.env,
    user: c.get("user"),
    session: c.get("session"),
  });
});

export default app;
