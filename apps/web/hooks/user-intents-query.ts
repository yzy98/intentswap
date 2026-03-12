import type { graphql, ResultOf, VariablesOf } from "gql.tada";
import { useQuery } from "urql";
import { useAuth } from "@/components/providers/auth-provider";
import {
  type IntentItem_Fragment,
  PersistedGetUserIntents_Query,
} from "@/lib/api/gql";

type GetUserIntentsQueryVariables = VariablesOf<
  typeof PersistedGetUserIntents_Query
>;

export type IntentStatusType = ReturnType<
  typeof graphql.scalar<"IntentStatus">
>;

export type GetUserIntentsQueryResult = ResultOf<
  typeof PersistedGetUserIntents_Query
>;

export type IntentItemFragmentResult = ResultOf<typeof IntentItem_Fragment>;

export const useIntentsQuery = ({
  user,
  status,
  limit,
  offset,
}: GetUserIntentsQueryVariables) => {
  const { isAuthenticated } = useAuth();

  const [{ data, fetching, error }, reExecuteQuery] = useQuery({
    query: PersistedGetUserIntents_Query,
    variables: {
      user: user as string,
      status,
      limit,
      offset,
    },
    pause: !(user && isAuthenticated),
  });

  return {
    data,
    fetching,
    error,
    reExecuteQuery,
  };
};
