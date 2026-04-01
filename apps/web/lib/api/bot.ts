import type { AppType } from "@apps/bot/rpc";
import { hc, type InferResponseType } from "hono/client";

const BATCH_SIZE = 50;

const BOT_API_URL =
  process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8787";

const botClient = hc<AppType>(BOT_API_URL, {
  init: {
    credentials: "include",
  },
});

type StatusBatchResponse = InferResponseType<
  typeof botClient.status.batch.$get
>;
type SubscribeResponse = InferResponseType<typeof botClient.subscribe.$post>;
type UnsubscribeResponse = InferResponseType<
  typeof botClient.unsubscribe.$post
>;

type StatusBatchOK = Extract<
  StatusBatchResponse,
  {
    ok: true;
  }
>;
type SubscribeOK = Extract<
  SubscribeResponse,
  {
    ok: true;
  }
>;
type UnsubscribeOK = Extract<
  UnsubscribeResponse,
  {
    ok: true;
  }
>;

export const fetchBotStatusBatch = async (
  intentIds: readonly bigint[],
  chainId: number
): Promise<StatusBatchOK> => {
  if (intentIds.length === 0) {
    return { ok: true, statuses: {} };
  }

  const res = await botClient.status.batch.$get({
    query: {
      intentIds: intentIds.join(","),
      chainId: chainId.toString(),
    },
  });
  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error ?? "Failed to get bot statuses");
  }

  return data;
};

export const fetchBotSubscriptionCount = async (
  intentIds: readonly bigint[],
  chainId: number
): Promise<number> => {
  if (intentIds.length === 0) {
    return 0;
  }

  // Split into chunks of BATCH_SIZE to respect /status/batch limit
  const chunks: bigint[][] = [];
  for (let i = 0; i < intentIds.length; i += BATCH_SIZE) {
    chunks.push(intentIds.slice(i, i + BATCH_SIZE) as bigint[]);
  }

  const counts = await Promise.all(
    chunks.map(async (batch) => {
      const { statuses } = await fetchBotStatusBatch(batch, chainId);
      return Object.values(statuses).filter(Boolean).length;
    })
  );

  return counts.reduce((sum, count) => sum + count, 0);
};

export const subscribeBotOrNot = async ({
  subscribe,
  intentId,
  chainId,
  user,
}: {
  subscribe: boolean;
  intentId: bigint;
  chainId: number;
  user: `0x${string}`;
}): Promise<SubscribeOK | UnsubscribeOK> => {
  const res = subscribe
    ? await botClient.subscribe.$post({
        json: {
          intentId: intentId.toString(),
          chainId,
          user,
        },
      })
    : await botClient.unsubscribe.$post({
        json: {
          intentId: intentId.toString(),
          chainId,
          user,
        },
      });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error ?? "Failed to toggle bot auto-execution");
  }

  return data;
};
