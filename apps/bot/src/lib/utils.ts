import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { SubscribeBody } from "./types";

export const jsonError = (
  c: Context,
  message: string,
  status: ContentfulStatusCode = 400
) => {
  return c.json({ ok: false, error: message }, status);
};

export const formatSubscriptionKV = (body: SubscribeBody) => {
  const key = `sub:${body.chainId}:${body.intentId}`;
  const value = JSON.stringify({
    intentId: body.intentId,
    user: body.user,
    chainId: body.chainId,
  });

  return { key, value };
};
