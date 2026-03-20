import { and, desc, eq } from "@packages/db/helper";
import { intent, intentEvent } from "@packages/db/schema";
import { builder } from "@/graphql/builder";
import {
  IntentEventRef,
  IntentEventTypeGql,
} from "@/graphql/models/intent-event";
import { getAuthenticatedWalletAddress, getSafeLimitAndOffset } from "./utils";

// Query a intent event by its transaction hash
builder.queryField("intentEventByTxHash", (t) =>
  t.field({
    type: IntentEventRef,
    nullable: true,
    args: {
      txHash: t.arg.string({ required: true }),
      eventType: t.arg({
        type: IntentEventTypeGql,
        required: true,
      }),
      chainId: t.arg.int({
        required: false,
      }),
    },
    resolve: async (_, { txHash, eventType, chainId }, ctx) => {
      const address = await getAuthenticatedWalletAddress(ctx);

      const whereClause = chainId
        ? and(
            eq(intentEvent.txHash, txHash.toLowerCase()),
            eq(intentEvent.eventType, eventType),
            eq(intentEvent.chainId, chainId),
            eq(intent.user, address)
          )
        : and(
            eq(intentEvent.txHash, txHash.toLowerCase()),
            eq(intentEvent.eventType, eventType),
            eq(intent.user, address)
          );

      const [result] = await ctx.dbNoCache
        .select({ intentEvent })
        .from(intentEvent)
        .innerJoin(intent, eq(intentEvent.intentId, intent.id))
        .where(whereClause)
        .limit(1);

      return result?.intentEvent ?? null;
    },
  })
);

// Query intent events by intent id
builder.queryField("intentEventsByIntentId", (t) =>
  t.field({
    type: [IntentEventRef],
    args: {
      intentId: t.arg({
        type: "BigInt",
        required: true,
      }),
      eventType: t.arg({
        type: IntentEventTypeGql,
        required: false,
      }),
      limit: t.arg.int({ defaultValue: 20, required: false }),
      offset: t.arg.int({ defaultValue: 0, required: false }),
    },
    resolve: async (_, { intentId, eventType, limit, offset }, ctx) => {
      const address = await getAuthenticatedWalletAddress(ctx);

      const { safeLimit, safeOffset } = getSafeLimitAndOffset({
        limit,
        offset,
        defaultLimit: 20,
      });

      const whereClause = eventType
        ? and(
            eq(intentEvent.intentId, intentId),
            eq(intent.user, address),
            eq(intentEvent.eventType, eventType)
          )
        : and(eq(intentEvent.intentId, intentId), eq(intent.user, address));

      const result = await ctx.dbNoCache
        .select({ intentEvent })
        .from(intentEvent)
        .innerJoin(intent, eq(intentEvent.intentId, intent.id))
        .where(whereClause)
        .limit(safeLimit)
        .offset(safeOffset)
        .orderBy(desc(intentEvent.blockNumber), desc(intentEvent.logIndex));

      return result.map((row) => row.intentEvent);
    },
  })
);
