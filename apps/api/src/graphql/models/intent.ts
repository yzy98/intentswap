import { type Intent, intentStatusEnum } from "@packages/db";
import { builder } from "@/graphql/builder";

export const IntentStatusGql = builder.enumType("IntentStatus", {
  values: intentStatusEnum.enumValues,
});

// Define the Intent object type
export const IntentRef = builder.objectRef<Intent>("Intent");

IntentRef.implement({
  fields: (t) => ({
    id: t.expose("id", {
      type: "BigInt",
    }),
    user: t.expose("user", {
      type: "EthAddress",
    }),
    tokenFrom: t.expose("tokenFrom", {
      type: "EthAddress",
    }),
    tokenTo: t.expose("tokenTo", {
      type: "EthAddress",
    }),
    amount: t.exposeString("amount"),
    priceThreshold: t.exposeString("priceThreshold"),
    expiration: t.expose("expiration", {
      type: "BigInt",
    }),
    status: t.expose("status", {
      type: IntentStatusGql,
    }),
    createdTxHash: t.exposeString("createdTxHash", {
      nullable: true,
    }),
    createdBlock: t.expose("createdBlock", {
      type: "BigInt",
      nullable: true,
    }),
    updatedBlock: t.expose("updatedBlock", {
      type: "BigInt",
      nullable: true,
    }),
    createdAt: t.expose("createdAt", {
      type: "Date",
    }),
    updatedAt: t.expose("updatedAt", {
      type: "Date",
    }),
  }),
});
