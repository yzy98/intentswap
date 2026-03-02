import type { indexerState, intent, intentStatusEnum } from "./schema";

export type Intent = typeof intent.$inferSelect;
export type NewIntent = typeof intent.$inferInsert;
export type IndexerState = typeof indexerState.$inferSelect;
export type NewIndexerState = typeof indexerState.$inferInsert;
export type IntentStatusValue = (typeof intentStatusEnum.enumValues)[number];
