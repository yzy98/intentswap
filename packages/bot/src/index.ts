import { Hono } from "hono";
import { logger } from "hono/logger";
import { cron } from "./cron";
import type { Bindings, Variables } from "./lib/types";
import { jsonError } from "./lib/utils";
import {
  corsMiddleware,
  publicClientMiddleware,
  walletClientMiddleware,
} from "./middlewares/global";
import { validateSubscription } from "./middlewares/validate-subscription";

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Middlewares
app.use(logger());
app.use("*", corsMiddleware);
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

export default {
  fetch: app.fetch,
  scheduled: cron,
};
