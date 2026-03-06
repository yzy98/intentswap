"use client";

import { useQuery } from "urql";
import type { Address } from "viem";
import { GetUserIntentsCount_Query } from "@/lib/api/gql";

interface UseIntentsCountQueryArgs {
  user?: Address;
}

export const useIntentsCountQuery = ({ user }: UseIntentsCountQueryArgs) => {
  const [{ data, fetching, error }, reExecuteQuery] = useQuery({
    query: GetUserIntentsCount_Query,
    variables: {
      user: user as string,
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
