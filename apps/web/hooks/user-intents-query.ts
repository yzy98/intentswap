import type { graphql, ResultOf, VariablesOf } from "gql.tada";
import { useQuery } from "urql";
import { GetUserIntents_Query, type IntentItem_Fragment } from "@/lib/api/gql";

type GetUserIntentsQueryVariables = VariablesOf<typeof GetUserIntents_Query>;

export type IntentStatusType = ReturnType<
  typeof graphql.scalar<"IntentStatus">
>;

export type GetUserIntentsQueryResult = ResultOf<typeof GetUserIntents_Query>;

export type IntentItemFragmentResult = ResultOf<typeof IntentItem_Fragment>;

export const useIntentsQuery = ({
  user,
  status,
  limit,
  offset,
}: GetUserIntentsQueryVariables) => {
  const [{ data, fetching, error }, reExecuteQuery] = useQuery({
    query: GetUserIntents_Query,
    variables: {
      user: user as string,
      status,
      limit,
      offset,
    },
    pause: !user,
  });

  return {
    data,
    fetching,
    error,
    reExecuteQuery,
  };
};
