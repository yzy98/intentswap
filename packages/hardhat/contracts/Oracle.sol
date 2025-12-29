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
  // feeds[tokenA][tokenB] = ChainLink Aggregator address for tokenA/tokenB price
  mapping (address => mapping (address => address)) public feeds;

  event FeedSet(address indexed tokenA, address indexed tokenB, address feed);

  error Oracle__InvalidAddress();
  error Oracle__InvalidPrice();
  error Oracle__PriceFeedNotSet();
  error Oracle__PriceFeedNotUpdated();

  constructor() Ownable(msg.sender) {}

  /**
   * @notice Set a new feed for a token pair, must be set by the contract owner before using price feeds
   * @param _tokenA The token to set the feed for
   * @param _tokenB The token to set the feed for
   * @param _feed The ChainLink Aggregator address
   */
  function setFeed(address _tokenA, address _tokenB, address _feed) external onlyOwner {
    if (_tokenA == _tokenB || _feed == address(0)) {
      revert Oracle__InvalidAddress();
    }

    feeds[_tokenA][_tokenB] = _feed;
    emit FeedSet(_tokenA, _tokenB, _feed);
  }

  /**
   * @notice Get the price for a token pair
   * @param _tokenA The token to get the price for
   * @param _tokenB The token to get the price for
   * @return The price
   */
  function getPrice(address _tokenA, address _tokenB) external view returns (uint256) {
    if (_tokenA == _tokenB) {
      revert Oracle__InvalidAddress();
    }

    address feed = feeds[_tokenA][_tokenB];
    if (feed == address(0)) {
      revert Oracle__PriceFeedNotSet();
    }

    (, int256 answer, , uint256 updatedAt, ) = AggregatorV3Interface(feed).latestRoundData();
    if (answer <= 0) {
      revert Oracle__InvalidPrice();
    }
    if (updatedAt == 0) {
      revert Oracle__PriceFeedNotUpdated();
    }

    return uint256(answer);
  }

  /**
   * @notice Get the decimals for a token pair
   * @param _tokenA The token to get the decimals for
   * @param _tokenB The token to get the decimals for
   * @return The decimals
   */
  function getDecimals(address _tokenA, address _tokenB) external view returns (uint8) {
    if (_tokenA == _tokenB) {
      revert Oracle__InvalidAddress();
    }

    address feed = feeds[_tokenA][_tokenB];
    if (feed == address(0)) {
      revert Oracle__PriceFeedNotSet();
    }

    return AggregatorV3Interface(feed).decimals();
  }
}