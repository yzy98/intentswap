/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'BigInt': unknown;
    'Boolean': unknown;
    'Date': unknown;
    'EthAddress': unknown;
    'Int': unknown;
    'Intent': { kind: 'OBJECT'; name: 'Intent'; fields: { 'amount': { name: 'amount'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'createdAt': { name: 'createdAt'; type: { kind: 'SCALAR'; name: 'Date'; ofType: null; } }; 'createdBlock': { name: 'createdBlock'; type: { kind: 'SCALAR'; name: 'BigInt'; ofType: null; } }; 'createdTxHash': { name: 'createdTxHash'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'expiration': { name: 'expiration'; type: { kind: 'SCALAR'; name: 'BigInt'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'SCALAR'; name: 'BigInt'; ofType: null; } }; 'priceThreshold': { name: 'priceThreshold'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'status': { name: 'status'; type: { kind: 'ENUM'; name: 'IntentStatus'; ofType: null; } }; 'tokenFrom': { name: 'tokenFrom'; type: { kind: 'SCALAR'; name: 'EthAddress'; ofType: null; } }; 'tokenTo': { name: 'tokenTo'; type: { kind: 'SCALAR'; name: 'EthAddress'; ofType: null; } }; 'updatedAt': { name: 'updatedAt'; type: { kind: 'SCALAR'; name: 'Date'; ofType: null; } }; 'updatedBlock': { name: 'updatedBlock'; type: { kind: 'SCALAR'; name: 'BigInt'; ofType: null; } }; 'user': { name: 'user'; type: { kind: 'SCALAR'; name: 'EthAddress'; ofType: null; } }; }; };
    'IntentEvent': { kind: 'OBJECT'; name: 'IntentEvent'; fields: { 'actor': { name: 'actor'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'blockNumber': { name: 'blockNumber'; type: { kind: 'SCALAR'; name: 'BigInt'; ofType: null; } }; 'blockTimestamp': { name: 'blockTimestamp'; type: { kind: 'SCALAR'; name: 'BigInt'; ofType: null; } }; 'chainId': { name: 'chainId'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'createdAt': { name: 'createdAt'; type: { kind: 'SCALAR'; name: 'Date'; ofType: null; } }; 'eventType': { name: 'eventType'; type: { kind: 'ENUM'; name: 'IntentEventType'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'SCALAR'; name: 'BigInt'; ofType: null; } }; 'intentId': { name: 'intentId'; type: { kind: 'SCALAR'; name: 'BigInt'; ofType: null; } }; 'logIndex': { name: 'logIndex'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'payload': { name: 'payload'; type: { kind: 'SCALAR'; name: 'JSON'; ofType: null; } }; 'txHash': { name: 'txHash'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'IntentEventType': { name: 'IntentEventType'; enumValues: 'CANCELLED' | 'CREATED' | 'EXECUTED' | 'UPDATED'; };
    'IntentStatus': { name: 'IntentStatus'; enumValues: 'ACTIVE' | 'CANCELLED' | 'EXECUTED'; };
    'JSON': unknown;
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'intentEventByTxHash': { name: 'intentEventByTxHash'; type: { kind: 'OBJECT'; name: 'IntentEvent'; ofType: null; } }; 'intentEventsByIntentId': { name: 'intentEventsByIntentId'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'IntentEvent'; ofType: null; }; }; } }; 'userIntents': { name: 'userIntents'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Intent'; ofType: null; }; }; } }; 'userIntentsCount': { name: 'userIntentsCount'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; }; };
    'String': unknown;
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
  query: 'Query';
  mutation: never;
  subscription: never;
  types: introspection_types;
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}