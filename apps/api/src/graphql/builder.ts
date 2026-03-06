import type { createDbClient } from "@packages/db";
import SchemaBuilder from "@pothos/core";
import { BigIntResolver, DateResolver } from "graphql-scalars";

export interface Context {
  db: ReturnType<typeof createDbClient>;
}

export const builder = new SchemaBuilder<{
  Scalars: {
    Date: { Input: Date; Output: Date };
    BigInt: { Input: bigint; Output: bigint };
  };
  Context: Context;
}>({});

builder.addScalarType("Date", DateResolver, {});
builder.addScalarType("BigInt", BigIntResolver, {});

builder.queryType({});
