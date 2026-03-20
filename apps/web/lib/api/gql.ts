import { graphql } from "@/graphql";

const GetUserIntentsCount_Query = graphql(`
  query GetUserIntentsCount($user: EthAddress!) {
    total: userIntentsCount(user: $user)
    active: userIntentsCount(user: $user, status: ACTIVE)
    executed: userIntentsCount(user: $user, status: EXECUTED)
    cancelled: userIntentsCount(user: $user, status: CANCELLED)
  }
`);

export const PersistedGetUserIntentsCount_Query = graphql.persisted(
  "GET_USER_INTENTS_COUNT",
  GetUserIntentsCount_Query
);

export const IntentItem_Fragment = graphql(`
  fragment IntentItem on Intent {
    tokenFrom
    tokenTo
    amount
    priceThreshold
    status
    expiration
  }
`);

const GetUserIntents_Query = graphql(
  `
  query GetUserIntents($user: EthAddress!, $status: IntentStatus, $limit: Int, $offset: Int) {
    userIntents(user: $user, status: $status, limit: $limit, offset: $offset) {
      id
      user
      createdTxHash
      createdBlock
      updatedBlock
      createdAt
      updatedAt
      ...IntentItem
    }
  }
`,
  [IntentItem_Fragment]
);

export const PersistedGetUserIntents_Query = graphql.persisted(
  "GET_USER_INTENTS",
  GetUserIntents_Query
);

const GetIntentEventByTxHash_Query = graphql(`
  query GetIntentEventByTxHash($txHash: String!, $eventType: IntentEventType!, $chainId: Int) {
    intentEventByTxHash(txHash: $txHash, eventType: $eventType, chainId: $chainId) {
      id
    }
  }`);

export const PersistedGetIntentEventByTxHash_Query = graphql.persisted(
  "GET_INTENT_EVENT_BY_TX_HASH",
  GetIntentEventByTxHash_Query
);
