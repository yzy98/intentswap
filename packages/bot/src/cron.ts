import type {
  ExecutionContext,
  KVNamespaceListKey,
  ScheduledController,
} from "@cloudflare/workers-types";
import { intentExecutorAbi } from "@packages/web/abis/intentExecutor";
import type { Account, PublicClient, WalletClient } from "viem";
import { getPublicClient, getWalletClient } from "./clients";
import type { Bindings, SubscribeBody } from "./lib/types";

interface ProcessSubscriptionParams {
  key: KVNamespaceListKey<unknown, string>;
  env: Bindings;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Account;
}

const processSubscription = async ({
  key,
  env,
  publicClient,
  walletClient,
  account,
}: ProcessSubscriptionParams) => {
  const k = key.name;
  const valueString = await env.INTENTS_SUBSCRIPTIONS.get(k);
  if (!valueString) {
    return;
  }

  const subscription = JSON.parse(valueString) as SubscribeBody;
  console.log(`Processing intent ${subscription.intentId}`);

  const { request } = await publicClient.simulateContract({
    account,
    abi: intentExecutorAbi,
    address: env.CONTRACT_INTENT_EXECUTOR_ADDRESS,
    functionName: "executeIntent",
    args: [BigInt(subscription.intentId)],
  });

  const txHash = await walletClient.writeContract(request);
  console.log(`Executed intent ${subscription.intentId}: ${txHash}`);

  // Delete KV after successful execution
  await env.INTENTS_SUBSCRIPTIONS.delete(k);
};

const runCronJob = async (env: Bindings) => {
  const publicClient = getPublicClient(env.RPC_URL, env.CHAIN_ID);
  const walletClient = getWalletClient(
    env.RPC_URL,
    env.PRIVATE_KEY,
    env.CHAIN_ID
  );

  const { account } = walletClient;
  if (!account) {
    console.error("Wallet client missing account");
    return;
  }

  const { keys } = await env.INTENTS_SUBSCRIPTIONS.list();
  console.log(`Found ${keys.length} intents subscriptions`);

  for (const key of keys) {
    try {
      await processSubscription({
        key,
        env,
        publicClient,
        walletClient,
        account,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to process ${key.name}: ${message}`);
    }
  }
};

export const cron = (
  _controller: ScheduledController,
  env: Bindings,
  ctx: ExecutionContext
) => {
  ctx.waitUntil(runCronJob(env));
};
