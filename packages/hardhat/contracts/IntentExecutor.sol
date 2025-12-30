// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IntentFactory} from "./IntentFactory.sol";
import {UniversalRouterV4Swapper} from "./UniversalRouterV4Swapper.sol";
import {Oracle} from "./Oracle.sol";

/**
 * @title IntentExecutor
 * @author yzy98
 * @notice This contract is responsible for executing intents. It uses the Oracle contract to get the price of the tokens and the IntentFactory contract to get the intent details.
 * 
 */
contract IntentExecutor is Ownable {
  IntentFactory public intentFactory;
  Oracle public oracle;
  UniversalRouterV4Swapper public swapper;

  mapping (bytes32 => PoolKey) public poolKeys;
  mapping (bytes32 => bool) public poolKeysSet;

  uint256 public executionFee = 0.001 ether; // Service fee / Rewards for executing intents

  event ExecutionFeeUpdated(uint256 newFee);

  error IntentExecutor__IntentAlreadyExecuted();
  error IntentExecutor__IntentAlreadyCancelled();
  error IntentExecutor__IntentExpired();
  error IntentExecutor__PriceThresholdNotMet();
  error IntentExecutor__PaymentFailed();
  error IntentExecutor__PoolKeyNotSet();

  constructor(address _intentFactory, address _oracle, address _swapper) Ownable(msg.sender) {
    intentFactory = IntentFactory(_intentFactory);
    oracle = Oracle(_oracle);
    swapper = UniversalRouterV4Swapper(_swapper);
  }

  function _pairId(address a, address b) internal pure returns (bytes32) {
    (address x, address y) = a < b ? (a, b) : (b, a);
    return keccak256(abi.encodePacked(x, y));
  }

  function setPoolKey(
    address tokenA,
    address tokenB,
    uint24 fee,
    int24 tickSpacing,
    address hooks
  ) external onlyOwner {
    (address x, address y) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    bytes32 id = _pairId(x, y);

    poolKeys[id] = PoolKey({
      currency0: Currency.wrap(x),
      currency1: Currency.wrap(y),
      fee: fee,
      tickSpacing: tickSpacing,
      hooks: IHooks(hooks)
    });
    poolKeysSet[id] = true;
  }

  /**
   * @notice Execute an intent
   * @param _intentId The intent ID
   */
  function executeIntent(uint256 _intentId) external {
    IntentFactory.Intent memory intent = intentFactory.getIntent(_intentId);

    if (intent.status == IntentFactory.Status.Executed) {
      revert IntentExecutor__IntentAlreadyExecuted();
    }
    if (intent.status == IntentFactory.Status.Cancelled) {
      revert IntentExecutor__IntentAlreadyCancelled();
    }
    if (intent.expiration <= block.timestamp) {
      revert IntentExecutor__IntentExpired();
    }

    uint256 rawPrice = oracle.getPrice(intent.tokenFrom, intent.tokenTo);
    uint8 decimals = oracle.getDecimals(intent.tokenFrom, intent.tokenTo);
    // Normalize price to 18 decimals
    uint256 normalizedPrice;
    if (decimals == 18) {
      normalizedPrice = rawPrice;
    } else if (decimals < 18) {
      normalizedPrice = rawPrice * (10 ** (18 - decimals));
    } else {
      normalizedPrice = rawPrice / (10 ** (decimals - 18));
    }
    
    // IMPORTANT: define intent.priceThreshold as 1e18-scaled price
    if (normalizedPrice < intent.priceThreshold) {
      revert IntentExecutor__PriceThresholdNotMet();
    }

    // Using Universal Router V4 https://docs.uniswap.org/contracts/v4/quickstart/swap#step-3-implementing-a-swapfunction
    // Load pool key
    bytes32 id = _pairId(intent.tokenFrom, intent.tokenTo);
    if (!poolKeysSet[id]) {
      revert IntentExecutor__PoolKeyNotSet();
    }
    PoolKey memory key = poolKeys[id];

    // Compute swap direction
    bool zeroForOne = intent.tokenFrom == Currency.unwrap(key.currency0);

    // Approve tokens for the permit2
    swapper.approveTokenWithPermit2(
      intent.tokenFrom,
      uint160(intent.amount),
      uint48(intent.expiration)
    );

    // Transfer input tokens to the swapper contract
    IERC20(intent.tokenFrom).transferFrom(intent.user, address(swapper), intent.amount);

    // [TODO] Calculate minimum output amount
    uint128 minAmountOut = 0;

    // Call swapper
    swapper.swapExactInputSingle(
      key,
      zeroForOne,
      uint128(intent.amount),
      minAmountOut,
      intent.user
    );

    // [TODO] Pay execution fee to the executor

    intentFactory.markExecuted(_intentId);
  }

  /**
   * @notice Update the execution fee 
   * @param _newFee The new execution fee
   * @dev Only callable by the contract owner
   */
  function updateExecutionFee(uint256 _newFee) external onlyOwner {
    executionFee = _newFee;
    emit ExecutionFeeUpdated(_newFee);
  }
}