import { dbClient } from "@/clients/db-client";
import { CONFIG } from "@/config";

export const getLastBlock = async (): Promise<bigint> => {
  const state = await dbClient.indexerState.findUnique({ where: { id: 1 } });
  return state?.lastBlock ?? CONFIG.startBlock;
};

export const setLastBlock = async (block: bigint) => {
  await dbClient.indexerState.upsert({
    where: { id: 1 },
    update: { lastBlock: block },
    create: {
      id: 1,
      lastBlock: block,
    },
  });
};
