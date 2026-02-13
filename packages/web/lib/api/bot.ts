const BATCH_SIZE = 50;

const BOT_API_URL =
  process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8787";

export interface BotStatusBatchResponse {
  ok: boolean;
  statuses: Record<string, boolean>; // { intentId: subscribed }
}

export const fetchBotStatusBatch = async (
  intentIds: readonly bigint[],
  chainId: number
): Promise<BotStatusBatchResponse> => {
  if (intentIds.length === 0) {
    return { ok: true, statuses: {} };
  }

  const params = new URLSearchParams({
    intentIds: intentIds.join(","),
    chainId: chainId.toString(),
  });

  const response = await fetch(`${BOT_API_URL}/status/batch?${params}`);
  const data = await response.json();

  if (!response.ok) {
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
