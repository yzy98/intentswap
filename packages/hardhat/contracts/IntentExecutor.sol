// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IntentFactory} from "./IntentFactory.sol";
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

  uint256 public executionFee = 0.001 ether; // Service fee / Rewards for executing intents

  event ExecutionFeeUpdated(uint256 newFee);

  error IntentExecutor__IntentAlreadyExecuted();
  error IntentExecutor__IntentAlreadyCancelled();
  error IntentExecutor__IntentExpired();
  error IntentExecutor__PriceThresholdNotMet();
  error IntentExecutor__PaymentFailed();

  constructor(address _intentFactory, address _oracle) Ownable(msg.sender) {
    intentFactory = IntentFactory(_intentFactory);
    oracle = Oracle(_oracle);
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

    uint256 currentPrice = oracle.getPrice(intent.tokenFrom, intent.tokenTo);
    if (currentPrice < intent.priceThreshold) {
      revert IntentExecutor__PriceThresholdNotMet();
    }

    // [TODO] Using Universal Router V4 https://docs.uniswap.org/contracts/v4/quickstart/swap#step-3-implementing-a-swapfunction
    // For now, justing transfer tokens
    IERC20(intent.tokenFrom).transferFrom(intent.user, msg.sender, intent.amount);
    IERC20(intent.tokenTo).transfer(intent.user, intent.amount);

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