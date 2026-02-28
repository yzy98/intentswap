// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IntentFactory
 * @author yzy98
 * @notice Factory contract for creating and managing swap intents
 * @dev Intents are stored in an array and never deleted, only status changes
 *      The contract owner (IntentExecutor) can mark intents as executed.
 */
contract IntentFactory is Ownable {
  /**
   * @notice Intent status enum
   * @dev Active(0) -> Executed(1) or Cancelled(2)
   */
  enum Status {
    Active,
    Executed,
    Cancelled
  }

  /**
   * @notice Intent struct containing all swap parameters
   * @param user Address of the intent creator
   * @param tokenFrom Token address to swap from
   * @param tokenTo Token address to swap to
   * @param amount Amount of tokenFrom to swap
   * @param priceThreshold Minimum price (1e18 scaled) required to execute
   * @param expiration Unix timestamp after which intent cannot be executed
   * @param status Current status of the intent
   */
  struct Intent {
    address user;
    address tokenFrom;
    address tokenTo;
    uint256 amount;
    uint256 priceThreshold;
    uint256 expiration;
    Status status;
  }

  uint256 public constant MAX_EXPIRATION_DURATION = 365 days;

  Intent[] public intents;
  mapping (address => uint256[]) public userIntentIds;

  event IntentCreated(
    uint256 indexed intentId,
    address indexed user,
    address tokenFrom,
    address tokenTo,
    uint256 amount,
    uint256 priceThreshold,
    uint256 expiration
  );
  event IntentCancelled(uint256 indexed intentId, address indexed user);
  event IntentExecuted(uint256 indexed intentId, address indexed user);
  event IntentUpdated(
    uint256 indexed intentId,
    address indexed user,
    uint256 oldPriceThreshold,
    uint256 newPriceThreshold
  );

  error IntentFactory__InvalidAddress();
  error IntentFactory__InvalidAmount();
  error IntentFactory__InvalidPriceThreshold();
  error IntentFactory__InvalidExpiration();
  error IntentFactory__InvalidStatus();
  error IntentFactory__InvalidIntentId();
  error IntentFactory__NotYourIntent();
  error IntentFactory__IntentExpired();

  /**
   * @dev Validates that the intent ID exists
   */
  modifier validIntentId(uint256 _intentId) {
    if (_intentId >= intents.length) {
      revert IntentFactory__InvalidIntentId();
    }
    _;
  }

  /**
   * @dev Validates that the caller owns the intent
   */
  modifier onlyIntentOwner(uint256 _intentId) {
    if (intents[_intentId].user != msg.sender) {
      revert IntentFactory__NotYourIntent();
    }
    _;
  }

  /**
   * @dev Validates that the intent is active
   */
  modifier onlyIntentActive(uint256 _intentId) {
    if (intents[_intentId].status != Status.Active) {
      revert IntentFactory__InvalidStatus();
    }
    _;
  }

  /**
   * @dev Validates that the intent has not expired
   */
  modifier intentNotExpired(uint256 _intentId) {
    if (intents[_intentId].expiration <= block.timestamp) {
      revert IntentFactory__IntentExpired();
    }
    _;
  }

  constructor() Ownable(msg.sender) {}

  /**
   * @notice Create a new swap intent
   * @param _tokenFrom Token address to swap from
   * @param _tokenTo Token address to swap to
   * @param _amount Amount of tokenFrom to swap (must be greater than 0)
   * @param _priceThreshold Minimum price to execute (1e18 scaled, must be > 0)
   * @param _expiration Unix timestamp for intent expiration
   * @return intentId The ID of the newly created intent
   * @dev User must approve IntentExecutor for tokenFrom before execution
   */
  function createIntent(
    address _tokenFrom,
    address _tokenTo,
    uint256 _amount,
    uint256 _priceThreshold,
    uint256 _expiration
  ) external returns (uint256 intentId) 
  {
    if (_tokenFrom == _tokenTo || _tokenFrom == address(0) || _tokenTo == address(0)) {
      revert IntentFactory__InvalidAddress();
    }
    if (_amount == 0) {
      revert IntentFactory__InvalidAmount();
    }
    if (_priceThreshold == 0) {
      revert IntentFactory__InvalidPriceThreshold();
    }
    if (
      _expiration <= block.timestamp ||
      _expiration > block.timestamp + MAX_EXPIRATION_DURATION
    ) {
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
    intentId = intents.length - 1;
    userIntentIds[msg.sender].push(intentId);

    emit IntentCreated(
      intentId,
      msg.sender,
      _tokenFrom,
      _tokenTo,
      _amount,
      _priceThreshold,
      _expiration
    );
  }

  /**
   * @notice Cancel an intent
   * @param _intentId The intent ID
   * @dev Only callable by the intent owner. Intent must be active.
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
   * @notice Mark an intent as executed
   * @param _intentId The intent ID
   * @dev Only callable by the contract owner (IntentExecutor)
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
   * @notice Update the price threshold for an active intent
   * @param _intentId The intent ID
   * @param _newPriceThreshold The new price threshold (1e18 scaled)
   * @dev Only callable by the intent owner. Intent must be active and ont expired.
   */
  function updateIntentCondition(uint256 _intentId, uint256 _newPriceThreshold) 
    external
    validIntentId(_intentId)
    onlyIntentOwner(_intentId)
    onlyIntentActive(_intentId)
    intentNotExpired(_intentId)
  {
    if (_newPriceThreshold == 0) {
      revert IntentFactory__InvalidPriceThreshold();
    }

    uint256 oldPriceThreshold = intents[_intentId].priceThreshold;
    intents[_intentId].priceThreshold = _newPriceThreshold;

    emit IntentUpdated(
      _intentId,
      msg.sender,
      oldPriceThreshold,
      _newPriceThreshold
    );
  }

  /**
   * @notice Get an intent by ID
   * @param _intentId The intent ID
   * @return The intent struct
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
   * @notice Get all intent IDs for a user
   * @param _user The user address
   * @return Array of intent IDs owned by the user
   */
  function getUserIntentIds(address _user) 
    external 
    view 
    returns (uint256[] memory)
  {
    return userIntentIds[_user];
  }
}