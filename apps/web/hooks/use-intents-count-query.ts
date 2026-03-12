"use client";

import { useQuery } from "urql";
import type { Address } from "viem";
import { useAuth } from "@/components/providers/auth-provider";
import { PersistedGetUserIntentsCount_Query } from "@/lib/api/gql";

interface UseIntentsCountQueryArgs {
  user?: Address;
}

export const useIntentsCountQuery = ({ user }: UseIntentsCountQueryArgs) => {
  const { isAuthenticated } = useAuth();
  const [{ data, fetching, error }, reExecuteQuery] = useQuery({
    query: PersistedGetUserIntentsCount_Query,
    variables: {
      user: user as string,
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
