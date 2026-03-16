import type { createDbClient } from "@packages/db";
import SchemaBuilder from "@pothos/core";
import { BigIntResolver, DateResolver } from "graphql-scalars";
import type { User } from "@/lib/types";
import { EthAddressResolver } from "./scalars/eth-address";

export interface Context {
  db: ReturnType<typeof createDbClient>;
  user: User | null;
}

export const builder = new SchemaBuilder<{
  Scalars: {
    Date: { Input: Date; Output: Date };
    BigInt: { Input: bigint; Output: bigint };
    EthAddress: { Input: string; Output: string };
  };
  Context: Context;
}>({});

builder.addScalarType("Date", DateResolver, {});
builder.addScalarType("BigInt", BigIntResolver, {});
builder.addScalarType("EthAddress", EthAddressResolver, {});

builder.queryType({});
