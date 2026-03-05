"use client";

import { cacheExchange, createClient, fetchExchange, Provider } from "urql";

const client = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "",
  exchanges: [cacheExchange, fetchExchange],
});

export function UrqlProvider({ children }: { children: React.ReactNode }) {
  return <Provider value={client}>{children}</Provider>;
}
