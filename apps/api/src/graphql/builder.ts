import SchemaBuilder from "@pothos/core";
import { BigIntResolver, DateResolver } from "graphql-scalars";

export const builder = new SchemaBuilder<{
  Scalars: {
    Date: { Input: Date; Output: Date };
    BigInt: { Input: bigint; Output: bigint };
  };
}>({});

builder.addScalarType("Date", DateResolver, {});
builder.addScalarType("BigInt", BigIntResolver, {});

builder.queryType({});
