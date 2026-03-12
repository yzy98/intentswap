"use client";

import idToHash from "@packages/graphql-artifacts/persisted-id-to-hash";
import { persistedExchange } from "@urql/exchange-persisted";
import type { TadaPersistedDocumentNode } from "gql.tada";
import { useMemo } from "react";
import { cacheExchange, createClient, fetchExchange, Provider } from "urql";
import { useAuth } from "./auth-provider";

export function UrqlProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  const client = useMemo(
    () =>
      createClient({
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
        fetchOptions: () => ({
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
        exchanges: [
          cacheExchange,
          persistedExchange({
            // biome-ignore lint/suspicious/useAwait: <explanation>
            generateHash: async (_, document) => {
              const documentId = (document as TadaPersistedDocumentNode)
                .documentId;
              return (
                (idToHash as Record<string, string>)[documentId] ?? documentId
              );
            },
            preferGetForPersistedQueries: true,
            enforcePersistedQueries: true,
            enableForMutation: true,
            enableForSubscriptions: true,
          }),
          fetchExchange,
        ],
      }),
    [token]
  );

  return <Provider value={client}>{children}</Provider>;
}
