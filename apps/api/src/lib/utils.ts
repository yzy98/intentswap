import { and, eq } from "@packages/db/helper";
import { walletAddress } from "@packages/db/schema";
import type { WorkerDbClient } from "@packages/db/worker";

export const getPrimaryWalletAddressByUserId = async (
  db: WorkerDbClient,
  userId: string
) => {
  const [result] = await db
    .select({
      address: walletAddress.address,
    })
    .from(walletAddress)
    .where(
      and(eq(walletAddress.userId, userId), eq(walletAddress.isPrimary, true))
    );

  return result?.address.toLowerCase() ?? null;
};
