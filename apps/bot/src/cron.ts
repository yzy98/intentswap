/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: big function */
import {
  getDeployment,
  intentExecutorAbi,
  intentFactoryAbi,
} from "@packages/contract-deployments";
import {
  type Account,
  type Address,
  type ContractFunctionParameters,
  erc20Abi,
  type PublicClient,
  type WalletClient,
} from "viem";
import { getPublicClient, getWalletClient } from "@/clients";
import type { Bindings, SubscribeBody } from "@/lib/types";

// Maximum number of intents to process in a single batch
// Adjust based on RPC provider limits (some have limits on multicall size)
const BATCH_SIZE = 50;

const INTENT_STATUS_MAP = {
  Active: 0,
  Executed: 1,
  Cancelled: 2,
} as const;

interface SubscriptionData {
  key: string;
  subscription: SubscribeBody;
}

interface ProcessBatchParams {
  subscriptions: SubscriptionData[];
  env: Bindings;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Account;
  blockTimestamp: bigint;
}

interface ProcessBatchResult {
  executed: number;
  removed: number;
  failed: number;
}

interface ValidatedIntent {
  key: string;
  intentId: bigint;
  isValid: boolean;
  reason?: string;
}

type BalanceAllowanceContract = ContractFunctionParameters<
  typeof erc20Abi,
  "view",
  "balanceOf" | "allowance"
>;

interface ExecuteIntentParams {
  key: string;
  intentId: bigint;
  env: Bindings;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Account;
}

const parseSubscriptions = async (
  keys: KVNamespaceListKey<unknown, string>[],
  env: Bindings
): Promise<SubscriptionData[]> => {
  const subscriptions: SubscriptionData[] = [];

  for (const key of keys) {
    const valueString = await env.INTENTS_SUBSCRIPTIONS.get(key.name);
    if (!valueString) {
      continue;
    }

    try {
      const subscription = JSON.parse(valueString) as SubscribeBody;
      subscriptions.push({
        key: key.name,
        subscription,
      });
    } catch {
      console.error(`Failed to parse subscription ${key.name}`);
    }
  }

  return subscriptions;
};

/**
 * Split array into chunks of specified size
 */
const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Validate a batch of intents and check their status, expiration, balance and allowance
 */
const validateIntentsBatch = async ({
  subscriptions,
  env,
  publicClient,
  blockTimestamp,
}: Pick<
  ProcessBatchParams,
  "subscriptions" | "env" | "publicClient" | "blockTimestamp"
>): Promise<ValidatedIntent[]> => {
  if (subscriptions.length === 0) {
    return [];
  }

  // Step 1: Batch get all intents in a single multicall
  console.log(`Batch fetching ${subscriptions.length} intents...`);

  const intentFactoryAddress = getDeployment(
    publicClient.chain?.id ?? Number(env.CHAIN_ID)
  ).contracts.intentFactory;
  const intentExecutorAddress = getDeployment(
    publicClient.chain?.id ?? Number(env.CHAIN_ID)
  ).contracts.intentExecutor;

  const intentContracts = subscriptions.map((sub) => ({
    abi: intentFactoryAbi,
    address: intentFactoryAddress,
    functionName: "getIntent" as const,
    args: [BigInt(sub.subscription.intentId)] as const,
  }));

  const intentResults = await publicClient.multicall({
    contracts: intentContracts,
  });

  const balanceAllowanceContracts: BalanceAllowanceContract[] = [];
  const validatedIntents: ValidatedIntent[] = [];

  // Track which subscriptions need balance/allowance checks
  const needsBalanceCheck: {
    index: number;
    subscription: SubscriptionData;
    intent: {
      tokenFrom: Address;
      amount: bigint;
    };
  }[] = [];

  for (let i = 0; i < subscriptions.length; i++) {
    const subscriptionData = subscriptions[i];
    const intentResult = intentResults[i];

    const key = subscriptionData.key;
    const intentId = BigInt(subscriptionData.subscription.intentId);

    // Handle failed muticall result
    if (intentResult.status === "failure") {
      validatedIntents.push({
        key,
        intentId,
        isValid: false,
        reason: `Failed to fetch intent: ${intentResult.error.message}`,
      });
      continue;
    }

    const intent = intentResult.result;

    // Check if intent status is active
    if (intent.status !== INTENT_STATUS_MAP.Active) {
      validatedIntents.push({
        key,
        intentId,
        isValid: false,
        reason: "Intent status is not active",
      });
      continue;
    }

    // Check if intent is expired
    if (intent.expiration <= blockTimestamp) {
      validatedIntents.push({
        key,
        intentId,
        isValid: false,
        reason: `Intent expired at ${intent.expiration}, current block timestamp is ${blockTimestamp}`,
      });
      continue;
    }

    // This intent passed initial checks, needs balance/allowance checks
    needsBalanceCheck.push({
      index: i,
      subscription: subscriptionData,
      intent: {
        tokenFrom: intent.tokenFrom,
        amount: intent.amount,
      },
    });

    // Add balance and allowance contracts for this intent
    balanceAllowanceContracts.push({
      address: intent.tokenFrom,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [intent.user],
    });
    balanceAllowanceContracts.push({
      address: intent.tokenFrom,
      abi: erc20Abi,
      functionName: "allowance",
      args: [intent.user, intentExecutorAddress],
    });
  }

  // If no intents need balance/allowance checks, return early
  if (needsBalanceCheck.length === 0) {
    return validatedIntents;
  }

  // Step 2: Batch get all balances and allowances in a single multicall
  console.log(
    `Batch fetching balances and allowances for ${needsBalanceCheck.length} intents...`
  );

  const balanceAllowanceResults = await publicClient.multicall({
    contracts: balanceAllowanceContracts,
  });

  for (let i = 0; i < needsBalanceCheck.length; i++) {
    const { subscription: subscriptionData, intent } = needsBalanceCheck[i];
    const balanceResult = balanceAllowanceResults[i * 2];
    const allowanceResult = balanceAllowanceResults[i * 2 + 1];

    const key = subscriptionData.key;
    const intentId = BigInt(subscriptionData.subscription.intentId);

    // Handle failed balance check
    if (balanceResult.status === "failure") {
      validatedIntents.push({
        key,
        intentId,
        isValid: false,
        reason: `Failed to fetch balance: ${balanceResult.error.message}`,
      });
      continue;
    }

    // Handle failed allowance check
    if (allowanceResult.status === "failure") {
      validatedIntents.push({
        key,
        intentId,
        isValid: false,
        reason: `Failed to fetch allowance: ${allowanceResult.error.message}`,
      });
      continue;
    }

    const balance = balanceResult.result as bigint;
    const allowance = allowanceResult.result as bigint;

    // Check balance
    if (balance < intent.amount) {
      validatedIntents.push({
        key,
        intentId,
        isValid: false,
        reason: `Insufficient balance: ${balance} < ${intent.amount}`,
      });
      continue;
    }

    // Check allowance
    if (allowance < intent.amount) {
      validatedIntents.push({
        key,
        intentId,
        isValid: false,
        reason: `Insufficient allowance: ${allowance} < ${intent.amount}`,
      });
      continue;
    }

    // All checks passed, intent is valid
    validatedIntents.push({
      key,
      intentId,
      isValid: true,
    });
  }

  return validatedIntents;
};

/**
 * Execute a single intent
 */
const executeIntent = async ({
  key,
  intentId,
  env,
  publicClient,
  walletClient,
  account,
}: ExecuteIntentParams): Promise<void> => {
  console.log(`Executing intent ${intentId}...`);

  const { request } = await publicClient.simulateContract({
    account,
    abi: intentExecutorAbi,
    address: getDeployment(publicClient.chain?.id ?? Number(env.CHAIN_ID))
      .contracts.intentExecutor,
    functionName: "executeIntent",
    args: [intentId],
  });

  const txHash = await walletClient.writeContract(request);
  console.log(`Executed intent ${intentId}: ${txHash}`);

  // Delete subscription from KV
  await env.INTENTS_SUBSCRIPTIONS.delete(key);
  console.log(`Deleted subscription ${key} for intent ${intentId}`);
};

/**
 * Remove invalid subscription from KV
 */
const removeInvalidSubscription = async (
  validated: ValidatedIntent,
  env: Bindings
): Promise<void> => {
  console.log(
    `Intent ${validated.intentId} is not valid: ${validated.reason}. Removing from subscriptions.`
  );
  await env.INTENTS_SUBSCRIPTIONS.delete(validated.key);
};

/**
 * Process a batch of subscriptions
 */
const processBatch = async ({
  subscriptions,
  env,
  publicClient,
  walletClient,
  account,
  blockTimestamp,
}: ProcessBatchParams): Promise<ProcessBatchResult> => {
  let executed = 0;
  let removed = 0;
  let failed = 0;

  // Validate intents batch
  const validatedIntents = await validateIntentsBatch({
    subscriptions,
    env,
    publicClient,
    blockTimestamp,
  });

  // Process valid intents
  for (const validated of validatedIntents) {
    try {
      if (validated.isValid) {
        // Execute valid intent
        await executeIntent({
          key: validated.key,
          intentId: validated.intentId,
          env,
          publicClient,
          walletClient,
          account,
        });
        executed++;
      } else {
        // Remove invalid subscription
        await removeInvalidSubscription(validated, env);
        removed++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `Failed to process intent ${validated.intentId}: ${message}`
      );
      failed++;
    }
  }

  return {
    executed,
    removed,
    failed,
  };
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

  // Get all intents subscriptions from KV
  const { keys } = await env.INTENTS_SUBSCRIPTIONS.list();
  console.log(`Found ${keys.length} intents subscriptions`);

  if (keys.length === 0) {
    return;
  }

  // Get current block timestamp
  const block = await publicClient.getBlock();
  const blockTimestamp = block.timestamp;

  // Parse all subscriptions from KV
  const subscriptions = await parseSubscriptions(keys, env);
  console.log(`Parsed ${subscriptions.length} valid subscriptions`);

  // Split into batches to avoid RPC limits
  const batches = chunk(subscriptions, BATCH_SIZE);
  console.log(`Processing ${batches.length} batch(es)...`);

  let totalExecuted = 0;
  let totalRemoved = 0;
  let totalFailed = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `\n--- Processing batch ${i + 1}/${batches.length} (${batch.length} intents) ---`
    );

    const { executed, removed, failed } = await processBatch({
      subscriptions: batch,
      env,
      publicClient,
      walletClient,
      account,
      blockTimestamp,
    });

    totalExecuted += executed;
    totalRemoved += removed;
    totalFailed += failed;
  }

  console.log("\n=== Cron job completed ===");
  console.log(`Executed: ${totalExecuted}`);
  console.log(`Removed (invalid): ${totalRemoved}`);
  console.log(`Failed: ${totalFailed}`);
};

export const cron = (
  _controller: ScheduledController,
  env: Bindings,
  ctx: ExecutionContext
) => {
  ctx.waitUntil(runCronJob(env));
};
