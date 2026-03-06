import type { Address } from "viem";
import { intentFactoryAbi } from "@/abis/intent-factory";
import { publicClient } from "@/clients/public-client";
import { CONFIG } from "@/config";
import { getLastBlock, setLastBlock } from "@/core/state";
import { ENV } from "@/env";
import {
  handleIntentCancelled,
  handleIntentCreated,
  handleIntentExecuted,
  handleIntentUpdated,
} from "./event-handlers";

export const syncBlocks = async () => {
  let fromBlock = await getLastBlock();

  while (true) {
    const latestBlock = await publicClient.getBlockNumber();
    console.log(`Latest block: ${latestBlock}`);
    const safeLatestBlock = latestBlock - CONFIG.confirmations;

    if (fromBlock > safeLatestBlock) {
      await new Promise((resolve) => setTimeout(resolve, CONFIG.pollInterval));
      continue;
    }

    const toBlock =
      fromBlock + CONFIG.batchSize < safeLatestBlock
        ? fromBlock + CONFIG.batchSize
        : safeLatestBlock;

    console.log(`Syncing blocks from ${fromBlock} to ${toBlock}`);
    const logs = await publicClient.getLogs({
      address: ENV.INTENT_FACTORY_ADDRESS as Address,
      fromBlock,
      toBlock,
      events: intentFactoryAbi,
    });
    console.log(`Found ${logs.length} logs`);

    for (const log of logs) {
      switch (log.eventName) {
        case "IntentCreated":
          await handleIntentCreated(log);
          break;
        case "IntentUpdated":
          await handleIntentUpdated(log);
          break;
        case "IntentExecuted":
          await handleIntentExecuted(log);
          break;
        case "IntentCancelled":
          await handleIntentCancelled(log);
          break;
        default:
          break;
      }
    }

    await setLastBlock(toBlock + BigInt(1));
    fromBlock = toBlock + BigInt(1);
  }
};
