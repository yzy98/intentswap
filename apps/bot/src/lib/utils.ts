import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const jsonError = (
  c: Context,
  message: string,
  status: ContentfulStatusCode = 400
) => {
  return c.json({ ok: false, error: message }, status);
};

export const formatSubscriptionKV = (
  chainId: number,
  intentId: string,
  walletAddress: string
) => {
  const key = `sub:${chainId}:${intentId}`;
  const value = JSON.stringify({
    intentId,
    walletAddress,
    chainId,
  });

  return { key, value };
};
