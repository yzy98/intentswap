/** biome-ignore-all lint/performance/noBarrelFile: <explanation> */
import { initGraphQLTada } from "gql.tada";
import type { introspection } from "./graphql-env.js";

export const graphql = initGraphQLTada<{
  introspection: introspection;

  scalars: {
    Date: Date;
    BigInt: bigint;
    EthAddress: string;
    JSON: unknown;
  };
}>();

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
export { readFragment } from "gql.tada";
