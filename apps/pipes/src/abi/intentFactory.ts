import type {
  EventParams as EParams,
  FunctionArguments,
  FunctionReturn,
} from "@subsquid/evm-abi";
import { ContractBase, event, fun, indexed, viewFun } from "@subsquid/evm-abi";
import * as p from "@subsquid/evm-codec";

export const events = {
  IntentCancelled: event(
    "0x48539a6710fcc0ad9cae060e0c3788155ce5246980a2a7590c2c7ebdfcd4cccd",
    "IntentCancelled(uint256,address)",
    { intentId: indexed(p.uint256), user: indexed(p.address) }
  ),
  IntentCreated: event(
    "0xd5d4586fe4316bdb24cc2bafceb1c55795cf66e02cc1638f75eef8ad97654b2e",
    "IntentCreated(uint256,address,address,address,uint256,uint256,uint256)",
    {
      intentId: indexed(p.uint256),
      user: indexed(p.address),
      tokenFrom: p.address,
      tokenTo: p.address,
      amount: p.uint256,
      priceThreshold: p.uint256,
      expiration: p.uint256,
    }
  ),
  IntentExecuted: event(
    "0x6852407858602d696344801f0181bc507c808c727c914bb6cdfeabd42431af38",
    "IntentExecuted(uint256,address)",
    { intentId: indexed(p.uint256), user: indexed(p.address) }
  ),
  IntentUpdated: event(
    "0x8eede8b54b7feffa2be52684577cb686bf6d3d3a2d3ee047fae93a511813630b",
    "IntentUpdated(uint256,address,uint256,uint256)",
    {
      intentId: indexed(p.uint256),
      user: indexed(p.address),
      oldPriceThreshold: p.uint256,
      newPriceThreshold: p.uint256,
    }
  ),
  OwnershipTransferred: event(
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
    "OwnershipTransferred(address,address)",
    { previousOwner: indexed(p.address), newOwner: indexed(p.address) }
  ),
};

export const functions = {
  MAX_EXPIRATION_DURATION: viewFun(
    "0xbd86e29b",
    "MAX_EXPIRATION_DURATION()",
    {},
    p.uint256
  ),
  cancelIntent: fun("0xa0a31aac", "cancelIntent(uint256)", {
    _intentId: p.uint256,
  }),
  createIntent: fun(
    "0x2a55acd9",
    "createIntent(address,address,uint256,uint256,uint256)",
    {
      _tokenFrom: p.address,
      _tokenTo: p.address,
      _amount: p.uint256,
      _priceThreshold: p.uint256,
      _expiration: p.uint256,
    },
    p.uint256
  ),
  getIntent: viewFun(
    "0x906e277b",
    "getIntent(uint256)",
    { _intentId: p.uint256 },
    p.struct({
      user: p.address,
      tokenFrom: p.address,
      tokenTo: p.address,
      amount: p.uint256,
      priceThreshold: p.uint256,
      expiration: p.uint256,
      status: p.uint8,
    })
  ),
  getUserIntentIds: viewFun(
    "0xfdc53eff",
    "getUserIntentIds(address)",
    { _user: p.address },
    p.array(p.uint256)
  ),
  intents: viewFun(
    "0x46a1a095",
    "intents(uint256)",
    { _0: p.uint256 },
    {
      user: p.address,
      tokenFrom: p.address,
      tokenTo: p.address,
      amount: p.uint256,
      priceThreshold: p.uint256,
      expiration: p.uint256,
      status: p.uint8,
    }
  ),
  markExecuted: fun("0xf6405119", "markExecuted(uint256)", {
    _intentId: p.uint256,
  }),
  owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
  renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}),
  transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {
    newOwner: p.address,
  }),
  updateIntentCondition: fun(
    "0xa65f2654",
    "updateIntentCondition(uint256,uint256)",
    { _intentId: p.uint256, _newPriceThreshold: p.uint256 }
  ),
  userIntentIds: viewFun(
    "0x996417ab",
    "userIntentIds(address,uint256)",
    { _0: p.address, _1: p.uint256 },
    p.uint256
  ),
};

export class Contract extends ContractBase {
  MAX_EXPIRATION_DURATION() {
    return this.eth_call(functions.MAX_EXPIRATION_DURATION, {});
  }

  getIntent(_intentId: GetIntentParams["_intentId"]) {
    return this.eth_call(functions.getIntent, { _intentId });
  }

  getUserIntentIds(_user: GetUserIntentIdsParams["_user"]) {
    return this.eth_call(functions.getUserIntentIds, { _user });
  }

  intents(_0: IntentsParams["_0"]) {
    return this.eth_call(functions.intents, { _0 });
  }

  owner() {
    return this.eth_call(functions.owner, {});
  }

  userIntentIds(_0: UserIntentIdsParams["_0"], _1: UserIntentIdsParams["_1"]) {
    return this.eth_call(functions.userIntentIds, { _0, _1 });
  }
}

/// Event types
export type IntentCancelledEventArgs = EParams<typeof events.IntentCancelled>;
export type IntentCreatedEventArgs = EParams<typeof events.IntentCreated>;
export type IntentExecutedEventArgs = EParams<typeof events.IntentExecuted>;
export type IntentUpdatedEventArgs = EParams<typeof events.IntentUpdated>;
export type OwnershipTransferredEventArgs = EParams<
  typeof events.OwnershipTransferred
>;

/// Function types
export type MAX_EXPIRATION_DURATIONParams = FunctionArguments<
  typeof functions.MAX_EXPIRATION_DURATION
>;
export type MAX_EXPIRATION_DURATIONReturn = FunctionReturn<
  typeof functions.MAX_EXPIRATION_DURATION
>;

export type CancelIntentParams = FunctionArguments<
  typeof functions.cancelIntent
>;
export type CancelIntentReturn = FunctionReturn<typeof functions.cancelIntent>;

export type CreateIntentParams = FunctionArguments<
  typeof functions.createIntent
>;
export type CreateIntentReturn = FunctionReturn<typeof functions.createIntent>;

export type GetIntentParams = FunctionArguments<typeof functions.getIntent>;
export type GetIntentReturn = FunctionReturn<typeof functions.getIntent>;

export type GetUserIntentIdsParams = FunctionArguments<
  typeof functions.getUserIntentIds
>;
export type GetUserIntentIdsReturn = FunctionReturn<
  typeof functions.getUserIntentIds
>;

export type IntentsParams = FunctionArguments<typeof functions.intents>;
export type IntentsReturn = FunctionReturn<typeof functions.intents>;

export type MarkExecutedParams = FunctionArguments<
  typeof functions.markExecuted
>;
export type MarkExecutedReturn = FunctionReturn<typeof functions.markExecuted>;

export type OwnerParams = FunctionArguments<typeof functions.owner>;
export type OwnerReturn = FunctionReturn<typeof functions.owner>;

export type RenounceOwnershipParams = FunctionArguments<
  typeof functions.renounceOwnership
>;
export type RenounceOwnershipReturn = FunctionReturn<
  typeof functions.renounceOwnership
>;

export type TransferOwnershipParams = FunctionArguments<
  typeof functions.transferOwnership
>;
export type TransferOwnershipReturn = FunctionReturn<
  typeof functions.transferOwnership
>;

export type UpdateIntentConditionParams = FunctionArguments<
  typeof functions.updateIntentCondition
>;
export type UpdateIntentConditionReturn = FunctionReturn<
  typeof functions.updateIntentCondition
>;

export type UserIntentIdsParams = FunctionArguments<
  typeof functions.userIntentIds
>;
export type UserIntentIdsReturn = FunctionReturn<
  typeof functions.userIntentIds
>;
