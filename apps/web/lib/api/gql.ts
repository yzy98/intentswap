import { graphql } from "@/graphql";

export const GetUserIntentsCount_Query = graphql(`
  query GetUserIntentsCount($user: String!) {
    total: userIntentsCount(user: $user)
    active: userIntentsCount(user: $user, status: ACTIVE)
    executed: userIntentsCount(user: $user, status: EXECUTED)
    cancelled: userIntentsCount(user: $user, status: CANCELLED)
  }
`);

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

export const GetUserIntents_Query = graphql(
  `
  query GetUserIntents($user: String!, $status: IntentStatus, $limit: Int, $offset: Int) {
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
