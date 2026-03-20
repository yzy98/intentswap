import type { graphql } from "gql.tada";

export type IntentEventType = ReturnType<
  typeof graphql.scalar<"IntentEventType">
>;
