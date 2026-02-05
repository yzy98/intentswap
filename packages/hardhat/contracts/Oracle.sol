// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title Oracle
 * @author yzy98
 * @notice This contract is responsible for getting the price of tokens from ChainLink. It is owned by the contract owner and can be used to set the price feeds for token pairs and get the price for a token pair.
 */
contract Oracle is Ownable {
  uint256 public constant PRICE_STALENESS_THRESHOLD = 1 hours;
  
  mapping (address => mapping (address => address)) public feeds;

  error Oracle__InvalidAddress();
  error Oracle__InvalidPrice();
  error Oracle__PriceFeedNotSet();
  error Oracle__PriceFeedNotUpdated();
  error Oracle__PriceFeedStale();
  error Oracle__ArrayLengthMismatch();

  event FeedSet(address indexed tokenA, address indexed tokenB, address feed);
  event FeedRemoved(address indexed tokenA, address indexed tokenB);

  constructor() Ownable(msg.sender) {}

  /**
   * @dev Validate a token pair addresses are valid
   */
  function _validateTokenPair(address _tokenA, address _tokenB) internal pure {
    if (_tokenA == _tokenB || _tokenA == address(0) || _tokenB == address(0)) {
      revert Oracle__InvalidAddress();
    }
  }

  /**
   * @dev Validate a feed address is valid
   */
  function _validateFeedAddress(address _feed) internal pure {
    if (_feed == address(0)) {
      revert Oracle__InvalidAddress();
    }
  }

  /**
   * @dev Gets and validates price data from Chainlink feed
   */
  function _getValidatedPriceData(address _feed)
    internal
    view
    returns (uint256 price, uint256 updatedAt) 
  {
    (, int256 answer, , uint256 _updatedAt, ) = AggregatorV3Interface(_feed).latestRoundData();
    if (answer <= 0) {
      revert Oracle__InvalidPrice();
    }
    if (_updatedAt == 0) {
      revert Oracle__PriceFeedNotUpdated();
    }
    if (block.timestamp - _updatedAt > PRICE_STALENESS_THRESHOLD) {
      revert Oracle__PriceFeedStale();
    }

    price = uint256(answer);
    updatedAt = _updatedAt;
  }

  /**
   * @dev Gets feed address and validates it exists
   */
  function _getFeedOrRevert(address _tokenA, address _tokenB) internal view returns (address feed) {
    feed = feeds[_tokenA][_tokenB];
    if (feed == address(0)) {
      revert Oracle__PriceFeedNotSet();
    }
  }

  /**
   * @notice Set a new feed for a token pair, must be set by the contract owner before using price feeds
   * @param _tokenA The token to set the feed for
   * @param _tokenB The token to set the feed for
   * @param _feed The ChainLink Aggregator address
   */
  function setFeed(address _tokenA, address _tokenB, address _feed) external onlyOwner {
    _validateTokenPair(_tokenA, _tokenB);
    _validateFeedAddress(_feed);

    feeds[_tokenA][_tokenB] = _feed;
    emit FeedSet(_tokenA, _tokenB, _feed);
  }

  /**
   * @notice Set multiple feeds in a single transaction (gas efficient)
   * @param _tokenAs Array of first tokens
   * @param _tokenBs Array of second tokens
   * @param _feeds Array of ChainLink Aggregator addresses
   * @dev Arrays must have the same length. Only callable by the contract owner.
   */
  function setFeeds(
    address[] calldata _tokenAs,
    address[] calldata _tokenBs,
    address[] calldata _feeds
  ) external onlyOwner {
    if (_tokenAs.length != _tokenBs.length || _tokenAs.length != _feeds.length) {
      revert Oracle__ArrayLengthMismatch();
    }

    for (uint256 i = 0; i < _tokenAs.length; i++) {
      _validateTokenPair(_tokenAs[i], _tokenBs[i]);
      _validateFeedAddress(_feeds[i]);

      feeds[_tokenAs[i]][_tokenBs[i]] = _feeds[i];
      emit FeedSet(_tokenAs[i], _tokenBs[i], _feeds[i]);
    }
  }

  /**
   * @notice Remove a feed for a token pair
   * @param _tokenA The first token in the pair
   * @param _tokenB The second token in the pair
   * @dev Only callable by the contract owner. Useful for deprecating feeds.
   */
  function removeFeed(address _tokenA, address _tokenB) external onlyOwner {
    _validateTokenPair(_tokenA, _tokenB);
    feeds[_tokenA][_tokenB] = address(0);
    emit FeedRemoved(_tokenA, _tokenB);
  }

  /**
   * @notice Check if a feed is set for a token pair
   * @param _tokenA The token from the pair
   * @param _tokenB The token to the pair
   * @return True if the feed is set, false otherwise
   */
  function hasFeed(address _tokenA, address _tokenB) external view returns (bool) {
    return feeds[_tokenA][_tokenB] != address(0);
  }

  /**
   * @notice Get the feed aggregator address for a token pair
   * @param _tokenA The first token in the pair
   * @param _tokenB The second token in the pair
   * @return The Chainlink aggregator address (returns address(0) if no feed is set)
   */
  function getFeed(address _tokenA, address _tokenB) external view returns (address) {
    return feeds[_tokenA][_tokenB];
  }

  /**
   * @notice Get the price for a token pair with staleness check
   * @param _tokenA The first token in the pair
   * @param _tokenB The second token in the pair
   * @return The price from Chainlink
   * @dev Reverts if price is stale, invalid, or feed not set
   */
  function getPrice(address _tokenA, address _tokenB) external view returns (uint256) {
    _validateTokenPair(_tokenA, _tokenB);

    address feed = _getFeedOrRevert(_tokenA, _tokenB);
    (uint256 price,) = _getValidatedPriceData(feed);

    return price;
  }

  /**
   * @notice Get the decimals for a token pair
   * @param _tokenA The first token in the pair
   * @param _tokenB The second token in the pair
   * @return The decimals of the price feed
   */
  function getDecimals(address _tokenA, address _tokenB) external view returns (uint8) {
    _validateTokenPair(_tokenA, _tokenB);

    address feed = _getFeedOrRevert(_tokenA, _tokenB);
    return AggregatorV3Interface(feed).decimals();
  }

  /**
   * @notice Get safe price with full metadata
   * @param _tokenA The first token in the pair
   * @param _tokenB The second token in the pair
   * @return price The price from Chainlink
   * @return decimals The decimals of the price feed
   * @return updatedAt The timestamp of last price update
   * @dev Useful for frontend to display more information
   */
  function getSafePrice(address _tokenA, address _tokenB)
    external
    view
    returns (
      uint256 price,
      uint8 decimals,
      uint256 updatedAt
    )
  {
    _validateTokenPair(_tokenA, _tokenB);

    address feed = _getFeedOrRevert(_tokenA, _tokenB);
    (price, updatedAt) = _getValidatedPriceData(feed);
    decimals = AggregatorV3Interface(feed).decimals();
  }
}