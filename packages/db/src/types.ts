import type { indexerState, intent } from "./schema";

export type Intent = typeof intent.$inferSelect;
export type NewIntent = typeof intent.$inferInsert;
export type IndexerState = typeof indexerState.$inferSelect;
export type NewIndexerState = typeof indexerState.$inferInsert;
