import { createWorkerDbClient } from "@packages/db/worker";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { getYogaApp } from "@/graphql/yoga";
import { getAuth } from "@/lib/auth";
import type { AppEnv } from "@/lib/types";
import { getPrimaryWalletAddressByUserId } from "@/lib/utils";
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
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const auth = await getAuth(c.env);
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

// Auth route for bot worker
app.get("/auth/bot", sessionMiddleware, async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!(session && user)) {
    return c.json({ ok: false }, 401);
  }

  const db = await createWorkerDbClient(
    c.env.INTENT_SWAP_API_HYPERDRIVE.connectionString
  );
  const walletAddress = await getPrimaryWalletAddressByUserId(db, user.id);

  if (!walletAddress) {
    return c.json({ ok: false, error: "No wallet address found" }, 404);
  }

  return c.json({ ok: true, walletAddress });
});

export default app;
