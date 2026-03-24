import type { Client } from "urql";
import {
  type GetUserIntentsCountQueryVariables,
  type GetUserIntentsQueryVariables,
  PersistedGetUserIntents_Query,
  PersistedGetUserIntentsCount_Query,
} from "@/lib/api/gql";

export const fetchUserIntentsCount = async (
  client: Client,
  args: GetUserIntentsCountQueryVariables
) => {
  const { user, fresh } = args;

  const result = await client
    .query(
      PersistedGetUserIntentsCount_Query,
      {
        user,
        fresh,
      },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();

  if (result.error) {
    throw result.error;
  }

  return result.data;
};

export const fetchUserIntents = async (
  client: Client,
  args: GetUserIntentsQueryVariables
) => {
  const { user, status, limit, offset, fresh } = args;

  const result = await client
    .query(
      PersistedGetUserIntents_Query,
      {
        user,
        status,
        limit,
        offset,
        fresh,
      },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();

  if (result.error) {
    throw result.error;
  }

  return result.data;
};
