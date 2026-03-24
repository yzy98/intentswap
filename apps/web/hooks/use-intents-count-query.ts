"use client";

import { useQuery } from "@tanstack/react-query";
import { useClient } from "urql";
import { useAuth } from "@/components/providers/auth-provider";
import type { GetUserIntentsCountQueryVariables } from "@/lib/api/gql";
import { fetchUserIntentsCount } from "@/lib/fetchers";

export const useIntentsCountQuery = ({
  user,
}: GetUserIntentsCountQueryVariables) => {
  const client = useClient();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["user-intents-count", user],
    queryFn: () =>
      fetchUserIntentsCount(client, {
        user,
      }),
    enabled: !!user && isAuthenticated,
  });
};
