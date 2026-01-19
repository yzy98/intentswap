// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IntentFactory} from "./IntentFactory.sol";
import {Oracle} from "./Oracle.sol";
import {UniswapV3Swapper} from "./UniswapV3Swapper.sol";

/**
 * @title IntentExecutor
 * @author yzy98
 * @notice This contract is responsible for executing intents. It uses the Oracle contract to get the price of the tokens and the IntentFactory contract to get the intent details.
 * 
 */
contract IntentExecutor is Ownable {
  using SafeERC20 for IERC20;

  IntentFactory public intentFactory;
  Oracle public oracle;
  UniswapV3Swapper public swapper;

  uint256 public executionFee = 0.001 ether; // Service fee / Rewards for executing intents
  uint24 public constant poolFee = 3000; // 0.3% fee
  uint256 public constant amountOutMinimum = 0; // Minimum amount of tokens to receive

  event ExecutionFeeUpdated(uint256 newFee);

  error IntentExecutor__IntentAlreadyExecuted();
  error IntentExecutor__IntentAlreadyCancelled();
  error IntentExecutor__IntentExpired();
  error IntentExecutor__PriceThresholdNotMet();
  error IntentExecutor__PaymentFailed();

  constructor(address _intentFactory, address _oracle, address _swapper) Ownable(msg.sender) {
    intentFactory = IntentFactory(_intentFactory);
    oracle = Oracle(_oracle);
    swapper = UniswapV3Swapper(_swapper);
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

    // Using Universal V3
    // Step 1: Transfer input tokens from user to swapper contract
    // Note: User must have approved IntentExecutor contract beforehand
    IERC20(intent.tokenFrom).safeTransferFrom(intent.user, address(swapper), intent.amount);

    // Call swapper
    swapper.swapExactInputSingle(
      intent.tokenFrom,
      intent.tokenTo,
      poolFee,
      intent.amount,
      amountOutMinimum,
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