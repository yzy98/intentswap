import {
  bigint,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const intentStatusEnum = pgEnum("intent_status", [
  "ACTIVE",
  "EXECUTED",
  "CANCELLED",
]);

export const intentEventTypeEnum = pgEnum("intent_event_type", [
  "CREATED",
  "UPDATED",
  "EXECUTED",
  "CANCELLED",
]);

export const intent = pgTable(
  "intent",
  {
    id: bigint({ mode: "bigint" }).primaryKey(),
    user: varchar({ length: 42 }).notNull(),
    tokenFrom: varchar({ length: 42 }).notNull(),
    tokenTo: varchar({ length: 42 }).notNull(),
    amount: text().notNull(),
    priceThreshold: text().notNull(),
    expiration: bigint({ mode: "bigint" }).notNull(),
    status: intentStatusEnum().notNull(),

    createdTxHash: varchar({ length: 66 }),
    createdBlock: bigint({ mode: "bigint" }),
    updatedBlock: bigint({ mode: "bigint" }),

    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("intent_user_idx").on(table.user),
    index("intent_status_idx").on(table.status),
    index("intent_token_pair_idx").on(table.tokenFrom, table.tokenTo),
    index("intent_expiration_idx").on(table.expiration),
    index("intent_created_tx_hash_idx").on(table.createdTxHash),
  ]
);

export const intentEvent = pgTable(
  "intent_event",
  {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    chainId: integer().notNull(),
    intentId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => intent.id, { onDelete: "cascade" }),
    eventType: intentEventTypeEnum().notNull(),
    txHash: varchar({ length: 66 }).notNull(),
    blockNumber: bigint({ mode: "bigint" }).notNull(),
    logIndex: integer().notNull(),
    blockTimestamp: bigint({ mode: "bigint" }),
    actor: varchar({ length: 42 }),
    payload: jsonb(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("intent_event_chain_tx_log_uniq").on(
      table.chainId,
      table.txHash,
      table.logIndex
    ),
    index("intent_event_intent_id_idx").on(table.intentId),
    index("intent_event_chain_tx_idx").on(table.chainId, table.txHash),
    index("intent_event_chain_type_tx_idx").on(
      table.chainId,
      table.eventType,
      table.txHash
    ),
    index("intent_event_timeline_idx").on(
      table.intentId,
      table.blockNumber,
      table.logIndex
    ),
  ]
);

export type Intent = typeof intent.$inferSelect;
export type NewIntent = typeof intent.$inferInsert;
export type IntentStatusValue = (typeof intentStatusEnum.enumValues)[number];
export type IntentEvent = typeof intentEvent.$inferSelect;
export type NewIntentEvent = typeof intentEvent.$inferInsert;
export type IntentEventTypeValue =
  (typeof intentEventTypeEnum.enumValues)[number];
