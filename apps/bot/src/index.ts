import { Hono } from "hono";
import { logger } from "hono/logger";
import { cron } from "@/cron";
import type { AppEnv } from "@/lib/types";
import { jsonError } from "@/lib/utils";
import { authMiddleware } from "@/middlewares/auth";
import { clientsMiddleware } from "@/middlewares/clients";
import { corsMiddleware } from "@/middlewares/cors";
import { rateLimiterMiddleware } from "@/middlewares/rate-limiter";
import { statusQueryValidator } from "@/validators/status";
import { statusBatchQueryValidator } from "@/validators/status-batch";
import {
  runSubscriptionValidation,
  subscribeJsonValidator,
} from "@/validators/subscribe";

const app = new Hono<AppEnv>();

// Middlewares
app.use(logger());
app.use("*", corsMiddleware);
app.use("*", rateLimiterMiddleware);
app.use("*", authMiddleware);
app.use("*", clientsMiddleware);

const routes = app
  .post("/subscribe", subscribeJsonValidator, async (c) => {
    try {
      const body = c.req.valid("json");
      const validationResponse = await runSubscriptionValidation(c, body);
      if (validationResponse) {
        return validationResponse;
      }

      const { key, value } = c.get("subscriptionKV");
      await c.env.INTENTS_SUBSCRIPTIONS.put(key, value);
      return c.json({ ok: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return jsonError(c, error.message);
      }
      return jsonError(c, "Failed to subscribe");
    }
  })
  .post("/unsubscribe", subscribeJsonValidator, async (c) => {
    try {
      const body = c.req.valid("json");
      const validationResponse = await runSubscriptionValidation(c, body);
      if (validationResponse) {
        return validationResponse;
      }

      const { key } = c.get("subscriptionKV");
      await c.env.INTENTS_SUBSCRIPTIONS.delete(key);
      return c.json({ ok: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return jsonError(c, error.message);
      }
      return jsonError(c, "Failed to unsubscribe");
    }
  })
  .get("/status", statusQueryValidator, async (c) => {
    try {
      const { chainId, intentId } = c.req.valid("query");
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
  })
  .get("/status/batch", statusBatchQueryValidator, async (c) => {
    try {
      const { intentIds, chainId } = c.req.valid("query");

      const results = await Promise.all(
        intentIds.map(async (intentId) => {
          const value = await c.env.INTENTS_SUBSCRIPTIONS.get(
            `sub:${chainId}:${intentId}`
          );
          return [intentId, value !== null] as const;
        })
      );

      return c.json({
        ok: true,
        statuses: Object.fromEntries(results),
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

export type AppType = typeof routes;
