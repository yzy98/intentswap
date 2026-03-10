import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

const isEthAddress = (address: string): boolean => {
  return addressRegex.test(address);
};

export const EthAddressResolver = new GraphQLScalarType({
  name: "EthAddress",
  description: "An Ethereum address, validated and normalized to lowercase",
  parseValue(value: unknown): string {
    if (typeof value !== "string" || !isEthAddress(value)) {
      throw new GraphQLError(`Invalid Ethereum address: ${value}`);
    }
    return value.toLowerCase();
  },
  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING || !isEthAddress(ast.value)) {
      throw new GraphQLError("Invalid Ethereum address literal");
    }
    return ast.value.toLowerCase();
  },
  serialize(value: unknown): string {
    return String(value).toLowerCase();
  },
});
