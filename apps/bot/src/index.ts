import { Hono } from "hono";
import { logger } from "hono/logger";
import { cron } from "@/cron";
import type { AppEnv } from "@/lib/types";
import { jsonError } from "@/lib/utils";
import { corsMiddleware } from "@/middlewares/cors";
import {
  publicClientMiddleware,
  walletClientMiddleware,
} from "@/middlewares/global";
import { rateLimiterMiddleware } from "@/middlewares/rate-limiter";
import { validateSubscription } from "@/middlewares/validate-subscription";

const app = new Hono<AppEnv>();

// Middlewares
app.use(logger());
app.use("*", corsMiddleware);
app.use("*", rateLimiterMiddleware);
app.use("*", publicClientMiddleware);
app.use("*", walletClientMiddleware);

// Subscribe
app.post("/subscribe", validateSubscription, async (c) => {
  try {
    const { key, value } = c.get("subscriptionKV");
    console.log("Subscribing to intent", key, value);
    await c.env.INTENTS_SUBSCRIPTIONS.put(key, value);
    return c.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return jsonError(c, error.message);
    }
    return jsonError(c, "Failed to subscribe");
  }
});

// Unsubscribe
app.post("/unsubscribe", validateSubscription, async (c) => {
  try {
    const { key, value } = c.get("subscriptionKV");
    console.log("Unsubscribing from intent", key, value);
    await c.env.INTENTS_SUBSCRIPTIONS.delete(key);
    return c.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return jsonError(c, error.message);
    }
    return jsonError(c, "Failed to unsubscribe");
  }
});

// Status
app.get("/status", async (c) => {
  try {
    const intentId = c.req.query("intentId");
    const chainId = c.req.query("chainId");

    if (!(intentId && chainId)) {
      return jsonError(c, "Missing intentId or chainId");
    }

    const key = `sub:${chainId}:${intentId}`;
    const value = await c.env.INTENTS_SUBSCRIPTIONS.get(key);

    return c.json({
      ok: true,
      subscribed: value !== null,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return jsonError(c, error.message);
    }
    return jsonError(c, "Failed to get status");
  }
});

// Status - batch
app.get("/status/batch", async (c) => {
  try {
    const intentIds = c.req.query("intentIds"); // comma separated: "1,2,3"
    const chainId = c.req.query("chainId");

    if (!(intentIds && chainId)) {
      return jsonError(c, "Missing intentIds or chainId");
    }

    const intentIdsArr = intentIds.split(",").filter(Boolean);

    if (intentIdsArr.length === 0) {
      return c.json({
        ok: true,
        statuses: {},
      });
    }

    // Restrict to 50 intent ids max per request
    if (intentIdsArr.length > 50) {
      return jsonError(c, "Too many intentIds, max 50");
    }

    const results = await Promise.all(
      intentIdsArr.map(async (intentId) => {
        const value = await c.env.INTENTS_SUBSCRIPTIONS.get(
          `sub:${chainId}:${intentId}`
        );
        return [intentId, value !== null] as const;
      })
    );

    // format results to { intentId: subscribed }
    const statuses = Object.fromEntries(results);

    return c.json({
      ok: true,
      statuses,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return jsonError(c, error.message);
    }
    return jsonError(c, "Failed to get statuses batched");
  }
});

export default {
  fetch: app.fetch,
  scheduled: cron,
};
