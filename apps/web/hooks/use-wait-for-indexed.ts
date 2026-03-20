import { useClient } from "urql";
import type { IntentEventType } from "@/graphql/types";
import { PersistedGetIntentEventByTxHash_Query } from "@/lib/api/gql";
import { pollUntil } from "@/lib/utils";

export const useWaitForIndexed = ({
  eventType,
}: {
  eventType: IntentEventType;
}) => {
  const client = useClient();

  const waitForIndexed = async (txHash: `0x${string}`, chainId?: number) => {
    await pollUntil({
      fn: async () => {
        try {
          const res = await client.query(
            PersistedGetIntentEventByTxHash_Query,
            {
              txHash,
              eventType,
              chainId,
            },
            {
              requestPolicy: "network-only",
            }
          );

          if (res.error) {
            return null;
          }

          return res.data?.intentEventByTxHash ?? null;
        } catch {
          return null;
        }
      },
      validate: (intentEvent) => Boolean(intentEvent?.id),
      interval: 2000,
      timeout: 45_000,
    });
  };

  return { waitForIndexed };
};
