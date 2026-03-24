import { type IntentEvent, intentEventTypeEnum } from "@packages/db/schema";
import { builder } from "@/graphql/builder";

export const IntentEventTypeGql = builder.enumType("IntentEventType", {
  values: intentEventTypeEnum.enumValues,
});

// Define the IntentEvent object type
export const IntentEventRef = builder.objectRef<IntentEvent>("IntentEvent");

IntentEventRef.implement({
  fields: (t) => ({
    id: t.expose("id", {
      type: "BigInt",
    }),
    chainId: t.exposeInt("chainId"),
    intentId: t.expose("intentId", {
      type: "BigInt",
    }),
    eventType: t.expose("eventType", {
      type: IntentEventTypeGql,
    }),
    txHash: t.exposeString("txHash"),
    blockNumber: t.expose("blockNumber", {
      type: "BigInt",
    }),
    logIndex: t.exposeInt("logIndex"),
    blockTimestamp: t.expose("blockTimestamp", {
      type: "BigInt",
      nullable: true,
    }),
    actor: t.exposeString("actor", {
      nullable: true,
    }),
    payload: t.expose("payload", {
      type: "JSON",
      nullable: true,
    }),
    createdAt: t.expose("createdAt", {
      type: "Date",
    }),
  }),
});
