/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
  BigInt: unknown;
  Boolean: unknown;
  Date: unknown;
  EthAddress: unknown;
  Int: unknown;
  Intent: {
    kind: "OBJECT";
    name: "Intent";
    fields: {
      amount: {
        name: "amount";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
      };
      createdAt: {
        name: "createdAt";
        type: { kind: "SCALAR"; name: "Date"; ofType: null };
      };
      createdBlock: {
        name: "createdBlock";
        type: { kind: "SCALAR"; name: "BigInt"; ofType: null };
      };
      createdTxHash: {
        name: "createdTxHash";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
      };
      expiration: {
        name: "expiration";
        type: { kind: "SCALAR"; name: "BigInt"; ofType: null };
      };
      id: {
        name: "id";
        type: { kind: "SCALAR"; name: "BigInt"; ofType: null };
      };
      priceThreshold: {
        name: "priceThreshold";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
      };
      status: {
        name: "status";
        type: { kind: "ENUM"; name: "IntentStatus"; ofType: null };
      };
      tokenFrom: {
        name: "tokenFrom";
        type: { kind: "SCALAR"; name: "EthAddress"; ofType: null };
      };
      tokenTo: {
        name: "tokenTo";
        type: { kind: "SCALAR"; name: "EthAddress"; ofType: null };
      };
      updatedAt: {
        name: "updatedAt";
        type: { kind: "SCALAR"; name: "Date"; ofType: null };
      };
      updatedBlock: {
        name: "updatedBlock";
        type: { kind: "SCALAR"; name: "BigInt"; ofType: null };
      };
      user: {
        name: "user";
        type: { kind: "SCALAR"; name: "EthAddress"; ofType: null };
      };
    };
  };
  IntentStatus: {
    name: "IntentStatus";
    enumValues: "ACTIVE" | "CANCELLED" | "EXECUTED";
  };
  Query: {
    kind: "OBJECT";
    name: "Query";
    fields: {
      userIntents: {
        name: "userIntents";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "OBJECT"; name: "Intent"; ofType: null };
          };
        };
      };
      userIntentsCount: {
        name: "userIntentsCount";
        type: { kind: "SCALAR"; name: "Int"; ofType: null };
      };
    };
  };
  String: unknown;
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: never;
  query: "Query";
  mutation: never;
  subscription: never;
  types: introspection_types;
};

declare module "gql.tada" {
  interface setupSchema {
    introspection: introspection;
  }
}
