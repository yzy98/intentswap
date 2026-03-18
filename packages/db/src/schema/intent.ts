import {
  bigint,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const intentStatusEnum = pgEnum("intent_status", [
  "ACTIVE",
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

export const indexerState = pgTable("indexer_state", {
  id: integer().primaryKey().default(1),
  lastBlock: bigint({ mode: "bigint" }).notNull(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Intent = typeof intent.$inferSelect;
export type NewIntent = typeof intent.$inferInsert;
export type IndexerState = typeof indexerState.$inferSelect;
export type NewIndexerState = typeof indexerState.$inferInsert;
export type IntentStatusValue = (typeof intentStatusEnum.enumValues)[number];
