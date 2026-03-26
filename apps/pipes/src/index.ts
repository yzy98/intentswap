/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore */
import { getDeployment } from "@packages/contract-deployments";
import { eq } from "@packages/db/helper";
import {
  intent,
  intentEvent,
  type NewIntent,
  type NewIntentEvent,
} from "@packages/db/schema";
import { evmDecoder, evmPortalSource } from "@subsquid/pipes/evm";
import {
  chunk,
  drizzleTarget,
} from "@subsquid/pipes/targets/drizzle/node-postgres";
import { allAbis } from "@/abi";
import { dbClient } from "@/client/db";
import { CONFIG } from "@/lib/config";
import { IntentEventType, IntentStatus } from "@/lib/constants";
import { ENV } from "@/lib/env";
import { normalizeAddress } from "@/lib/utils";

const intentFactoryAddress = getDeployment(ENV.CHAIN_ID).contracts
  .intentFactory;

async function main() {
  await evmPortalSource({
    portal: {
      url: "https://portal.sqd.dev/datasets/ethereum-sepolia",
    },
  })
    .pipe(
      evmDecoder({
        range: {
          from: CONFIG.startBlock,
        },
        contracts: [intentFactoryAddress],
        events: {
          intentCreated: allAbis.intentFactory.events.IntentCreated,
          intentExecuted: allAbis.intentFactory.events.IntentExecuted,
          intentCancelled: allAbis.intentFactory.events.IntentCancelled,
          intentUpdated: allAbis.intentFactory.events.IntentUpdated,
        },
      })
    )
    .pipeTo(
      drizzleTarget({
        db: dbClient,
        tables: [intentEvent, intent],
        onData: async ({ tx, data }) => {
          // Intent Created
          for (const values of chunk(data.intentCreated)) {
            await tx
              .insert(intent)
              .values(
                values.map(
                  (d): NewIntent => ({
                    id: d.event.intentId,
                    user: normalizeAddress(d.event.user),
                    tokenFrom: normalizeAddress(d.event.tokenFrom),
                    tokenTo: normalizeAddress(d.event.tokenTo),
                    amount: d.event.amount.toString(),
                    priceThreshold: d.event.priceThreshold.toString(),
                    expiration: d.event.expiration,
                    status: IntentStatus.ACTIVE,
                    createdTxHash: d.rawEvent.transactionHash,
                    createdBlock: BigInt(d.block.number),
                  })
                )
              )
              .onConflictDoNothing({
                target: [intent.id],
              });

            await tx
              .insert(intentEvent)
              .values(
                values.map(
                  (d): NewIntentEvent => ({
                    chainId: ENV.CHAIN_ID,
                    intentId: d.event.intentId,
                    eventType: IntentEventType.CREATED,
                    txHash: d.rawEvent.transactionHash,
                    blockNumber: BigInt(d.block.number),
                    logIndex: d.rawEvent.logIndex,
                    actor: normalizeAddress(d.event.user),
                    payload: {
                      tokenFrom: normalizeAddress(d.event.tokenFrom),
                      tokenTo: normalizeAddress(d.event.tokenTo),
                      amount: d.event.amount.toString(),
                      priceThreshold: d.event.priceThreshold.toString(),
                      expiration: d.event.expiration.toString(),
                    },
                  })
                )
              )
              .onConflictDoNothing({
                target: [
                  intentEvent.chainId,
                  intentEvent.txHash,
                  intentEvent.logIndex,
                ],
              });
          }

          // Intent Updated
          for (const values of chunk(data.intentUpdated)) {
            for (const d of values) {
              await tx
                .update(intent)
                .set({
                  priceThreshold: d.event.newPriceThreshold.toString(),
                  updatedBlock: BigInt(d.block.number),
                })
                .where(eq(intent.id, d.event.intentId));
            }

            await tx
              .insert(intentEvent)
              .values(
                values.map(
                  (d): NewIntentEvent => ({
                    chainId: ENV.CHAIN_ID,
                    intentId: d.event.intentId,
                    eventType: IntentEventType.UPDATED,
                    txHash: d.rawEvent.transactionHash,
                    blockNumber: BigInt(d.block.number),
                    logIndex: d.rawEvent.logIndex,
                    actor: normalizeAddress(d.event.user),
                    payload: {
                      oldPriceThreshold: d.event.oldPriceThreshold.toString(),
                      newPriceThreshold: d.event.newPriceThreshold.toString(),
                    },
                  })
                )
              )
              .onConflictDoNothing({
                target: [
                  intentEvent.chainId,
                  intentEvent.txHash,
                  intentEvent.logIndex,
                ],
              });
          }

          // Intent Executed
          for (const values of chunk(data.intentExecuted)) {
            for (const d of values) {
              await tx
                .update(intent)
                .set({
                  status: IntentStatus.EXECUTED,
                  updatedBlock: BigInt(d.block.number),
                })
                .where(eq(intent.id, d.event.intentId));
            }

            await tx
              .insert(intentEvent)
              .values(
                values.map(
                  (d): NewIntentEvent => ({
                    chainId: ENV.CHAIN_ID,
                    intentId: d.event.intentId,
                    eventType: IntentEventType.EXECUTED,
                    txHash: d.rawEvent.transactionHash,
                    blockNumber: BigInt(d.block.number),
                    logIndex: d.rawEvent.logIndex,
                    actor: normalizeAddress(d.event.user),
                  })
                )
              )
              .onConflictDoNothing({
                target: [
                  intentEvent.chainId,
                  intentEvent.txHash,
                  intentEvent.logIndex,
                ],
              });
          }

          // Intent Cancelled
          for (const values of chunk(data.intentCancelled)) {
            for (const d of values) {
              await tx
                .update(intent)
                .set({
                  status: IntentStatus.CANCELLED,
                  updatedBlock: BigInt(d.block.number),
                })
                .where(eq(intent.id, d.event.intentId));
            }

            await tx
              .insert(intentEvent)
              .values(
                values.map(
                  (d): NewIntentEvent => ({
                    chainId: ENV.CHAIN_ID,
                    intentId: d.event.intentId,
                    eventType: IntentEventType.CANCELLED,
                    txHash: d.rawEvent.transactionHash,
                    blockNumber: BigInt(d.block.number),
                    logIndex: d.rawEvent.logIndex,
                    actor: normalizeAddress(d.event.user),
                  })
                )
              )
              .onConflictDoNothing({
                target: [
                  intentEvent.chainId,
                  intentEvent.txHash,
                  intentEvent.logIndex,
                ],
              });
          }
        },
      })
    );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
