import { useQuery } from "urql";
import type { Address } from "viem";
import type { GetUserIntentsQuery, IntentStatus } from "@/gql/graphql";
import { GetUserIntents_Query } from "@/lib/api/gql";

interface UseIntentsQueryArgs {
  user?: Address;
  status?: IntentStatus;
  limit?: number;
  offset?: number;
}

export const useIntentsQuery = ({
  user,
  status,
  limit,
  offset,
}: UseIntentsQueryArgs) => {
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

export type IntentData = NonNullable<
  GetUserIntentsQuery["userIntents"]
>[number];
