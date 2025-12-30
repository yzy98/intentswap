// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IntentFactory
 * @author yzy98
 * @notice This contract is responsible for creating, getting, canceling and marking intents as executed. It is owned by the IntentExecutor contract and can be used to create, get, cancel and mark intents as executed.
 */
contract IntentFactory is Ownable {
  enum Status {
    Active,
    Executed,
    Cancelled
  }
  struct Intent {
    address user;               // User who created the intent
    address tokenFrom;          // Token to swap
    address tokenTo;            // Token to receive
    uint256 amount;             // Amount of tokens to swap
    uint256 priceThreshold;     // Price threshold for the swap
    uint256 expiration;         // Expiration time stamp for the intent
    Status status;              // Status of the intent
  }

  Intent[] public intents;
  mapping (address => uint256[]) public userIntentIds;

  event IntentCreated(uint256 indexed intentId, address indexed user);
  event IntentCancelled(uint256 indexed intentId, address indexed user);
  event IntentExecuted(uint256 indexed intentId, address indexed user);
  event IntentUpdated(uint256 indexed intentId, address indexed user, uint256 newPriceThreshold);

  error IntentFactory__InvalidAddress();
  error IntentFactory__InvalidAmount();
  error IntentFactory__InvalidPriceThreshold();
  error IntentFactory__InvalidExpiration();
  error IntentFactory__InvalidStatus();
  error IntentFactory__InvalidIntentId();
  error IntentFactory__NotYourIntent();
  error IntentFactory__IntentExpired();

  modifier validIntentId(uint256 intentId) {
    if (intentId >= intents.length) {
      revert IntentFactory__InvalidIntentId();
    }
    _;
  }

  modifier onlyIntentOwner(uint256 intentId) {
    if (intents[intentId].user != msg.sender) {
      revert IntentFactory__NotYourIntent();
    }
    _;
  }

  modifier onlyIntentActive(uint256 intentId) {
    if (intents[intentId].status != Status.Active) {
      revert IntentFactory__InvalidStatus();
    }
    _;
  }

  modifier notIntentExpired(uint256 intentId) {
    if (intents[intentId].expiration <= block.timestamp) {
      revert IntentFactory__IntentExpired();
    }
    _;
  }

  constructor() Ownable(msg.sender) {}

/**
 * @notice Create a new swap intent
 * @param _tokenFrom The token to swap from
 * @param _tokenTo The token to swap to
 * @param _amount Amount of tokens to swap
 * @param _priceThreshold Price threshold for the swap
 * @param _expiration Expiration time stamp for the intent
 * @return The intent ID
 */
  function createIntent(
    address _tokenFrom,
    address _tokenTo,
    uint256 _amount,
    uint256 _priceThreshold,
    uint256 _expiration
  ) external returns (uint256) {
    if (_tokenFrom == _tokenTo) {
      revert IntentFactory__InvalidAddress();
    }
    if (_amount == 0) {
      revert IntentFactory__InvalidAmount();
    }
    if (_priceThreshold == 0) {
      revert IntentFactory__InvalidPriceThreshold();
    }
    if (_expiration <= block.timestamp) {
      revert IntentFactory__InvalidExpiration();
    }

    Intent memory newIntent = Intent({
      user: msg.sender,
      tokenFrom: _tokenFrom,
      tokenTo: _tokenTo,
      amount: _amount,
      priceThreshold: _priceThreshold,
      expiration: _expiration,
      status: Status.Active
    });

    intents.push(newIntent);
    uint256 intentId = intents.length - 1;
    userIntentIds[msg.sender].push(intentId);

    emit IntentCreated(intentId, msg.sender);
    return intentId;
  }

/**
 * @notice Get the intent IDs for a user
 * @param _user The user address
 * @return All intent IDs for the user
 */
  function getUserIntentIds(address _user) external view returns (uint256[] memory) {
    return userIntentIds[_user];
  }

  /**
   * @notice Get an intent by intent ID
   * @param _intentId The intent ID
   * @return The intent
   */
  function getIntent(uint256 _intentId) 
    external 
    view 
    validIntentId(_intentId)
    returns (Intent memory) 
  {
    return intents[_intentId];
  }

  /**
   * @notice Cancel an intent
   * @param _intentId The intent ID
   */
  function cancelIntent(uint256 _intentId) 
    external
    validIntentId(_intentId) 
    onlyIntentOwner(_intentId)
    onlyIntentActive(_intentId)
  {
    intents[_intentId].status = Status.Cancelled;
    emit IntentCancelled(_intentId, msg.sender);
  }

  /**
   * @notice Mark an intent as executed, only callable by the owner (IntentExecutor)
   * @param _intentId The intent ID
   */
  function markExecuted(uint256 _intentId)
    external
    onlyOwner
    validIntentId(_intentId)
    onlyIntentActive(_intentId)
  {
    intents[_intentId].status = Status.Executed;
    emit IntentExecuted(_intentId, intents[_intentId].user);
  }

  /**
   * @notice Update the price threshold for an intent
   * @param _intentId The intent ID
   * @param _newPriceThreshold The new price threshold
   */
  function updateIntentCondition(uint256 _intentId, uint256 _newPriceThreshold) 
    external
    validIntentId(_intentId)
    onlyIntentOwner(_intentId)
    onlyIntentActive(_intentId)
    notIntentExpired(_intentId)
  {
    if (_newPriceThreshold == 0) {
      revert IntentFactory__InvalidPriceThreshold();
    }

    intents[_intentId].priceThreshold = _newPriceThreshold;
    emit IntentUpdated(_intentId, msg.sender, _newPriceThreshold);
  }
}