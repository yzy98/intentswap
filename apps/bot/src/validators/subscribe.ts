import { zValidator } from "@hono/zod-validator";
import {
  getDeployment,
  intentFactoryAbi,
} from "@packages/contract-deployments";
import { subscribeJsonSchema } from "@/lib/schemas";
import type { AppContext, SubscribeBody } from "@/lib/types";
import { formatSubscriptionKV, jsonError } from "@/lib/utils";

export const subscribeJsonValidator = zValidator(
  "json",
  subscribeJsonSchema,
  (result, c) => {
    if (!result.success) {
      return jsonError(c, "Invalid request body");
    }
  }
);

export const runSubscriptionValidation = async (
  c: AppContext,
  body: SubscribeBody
) => {
  try {
    const publicClient = c.get("publicClient");
    const walletAddress = c.get("walletAddress");

    if (body.chainId !== publicClient.chain?.id) {
      return jsonError(c, "Unsupported chainId");
    }

    const intent = await publicClient.readContract({
      abi: intentFactoryAbi,
      address: getDeployment(publicClient.chain.id).contracts.intentFactory,
      functionName: "getIntent",
      args: [BigInt(body.intentId)],
    });

    if (intent.user.toLowerCase() !== walletAddress.toLowerCase()) {
      return jsonError(c, "Intent owner mismatch", 403);
    }

    const { key, value } = formatSubscriptionKV(
      body.chainId,
      body.intentId,
      walletAddress.toLowerCase()
    );

    c.set("subscriptionKV", { key, value });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return jsonError(c, error.message);
    }
    return jsonError(c, "Failed to validate subscription");
  }
};
