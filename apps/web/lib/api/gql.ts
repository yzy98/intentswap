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

const GetIntentByCreatedTxHash_Query = graphql(`
  query GetIntentByCreatedTxHash($txHash: String!) {
    intentByCreatedTxHash(txHash: $txHash) {
      id
    }
  }
`);

export const PersistedGetIntentByCreatedTxHash_Query = graphql.persisted(
  "GET_INTENT_BY_CREATED_TX_HASH",
  GetIntentByCreatedTxHash_Query
);
