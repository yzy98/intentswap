import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { isAddress } from "viem";

export const EthAddressResolver = new GraphQLScalarType({
  name: "EthAddress",
  description: "An Ethereum address, validated and normalized to lowercase",
  parseValue(value: unknown): string {
    if (typeof value !== "string" || !isAddress(value)) {
      throw new GraphQLError(`Invalid Ethereum address: ${value}`);
    }
    return value.toLowerCase();
  },
  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING || !isAddress(ast.value)) {
      throw new GraphQLError("Invalid Ethereum address literal");
    }
    return ast.value.toLowerCase();
  },
  serialize(value: unknown): string {
    return String(value).toLowerCase();
  },
});
