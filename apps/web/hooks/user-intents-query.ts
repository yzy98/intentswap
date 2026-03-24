import { useQuery } from "@tanstack/react-query";
import { useClient } from "urql";
import { useAuth } from "@/components/providers/auth-provider";
import type { GetUserIntentsQueryVariables } from "@/lib/api/gql";
import { fetchUserIntents } from "@/lib/fetchers";

export const useIntentsQuery = ({
  user,
  status,
  limit,
  offset,
}: GetUserIntentsQueryVariables) => {
  const client = useClient();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["user-intents", user, status, limit, offset],
    queryFn: () =>
      fetchUserIntents(client, {
        user,
        status,
        limit,
        offset,
        fresh: false,
      }),
    enabled: !!user && isAuthenticated,
  });
};
