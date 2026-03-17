import { eq } from "@packages/db/helper";
import { indexerState } from "@packages/db/schema";
import { db } from "@/clients/db-client";
import { CONFIG } from "@/config";

export const getLastBlock = async (): Promise<bigint> => {
  const [state] = await db
    .select()
    .from(indexerState)
    .where(eq(indexerState.id, 1))
    .limit(1);

  return state?.lastBlock ?? CONFIG.startBlock;
};

export const setLastBlock = async (block: bigint) => {
  await db
    .insert(indexerState)
    .values({
      id: 1,
      lastBlock: block,
    })
    .onConflictDoUpdate({
      target: indexerState.id,
      set: {
        lastBlock: block,
      },
    });
};
