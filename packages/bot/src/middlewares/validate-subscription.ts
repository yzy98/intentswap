import { intentFactoryAbi } from "@packages/web/abis/intentFactory";
import type { Next } from "hono";
import type { AppContext, SubscribeBody } from "../lib/types";
import {
  formatSubscriptionKV,
  hasMissingSubscribeFields,
  jsonError,
} from "../lib/utils";

export const validateSubscription = async (c: AppContext, next: Next) => {
  try {
    const body = await c.req.json<SubscribeBody>();

    if (hasMissingSubscribeFields(body)) {
      return jsonError(c, "Missing required fields");
    }

    const publicClient = c.get("publicClient");

    if (body.chainId !== publicClient.chain?.id) {
      return jsonError(c, "Unsupported chainId");
    }

    const intent = await publicClient.readContract({
      abi: intentFactoryAbi,
      address: c.env.CONTRACT_INTENT_FACTORY_ADDRESS,
      functionName: "getIntent",
      args: [BigInt(body.intentId)],
    });

    if (intent.user.toLowerCase() !== body.user.toLowerCase()) {
      return jsonError(c, "Intent owner mismatch", 403);
    }

    const { key, value } = formatSubscriptionKV(body);

    c.set("subscriptionKV", { key, value });
    await next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return jsonError(c, error.message);
    }
    return jsonError(c, "Failed to validate subscription");
  }
};
