// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IntentFactory} from "./IntentFactory.sol";
import {Oracle} from "./Oracle.sol";
import {UniswapV3Swapper} from "./UniswapV3Swapper.sol";

/**
 * @title IntentExecutor
 * @author yzy98
 * @notice Executes swap intents when price conditions are met
 * @dev Uses Chainlink Oracle for price feeds and Uniswap V3 for swaps.
 *      Implement slippage protection, reentrancy guard, and emergency pause.
 * 
 * Security features:
 * - ReentrancyGuard: Prevents reentrancy attacks during token transfers
 * - Pausable: Emergency stop mechanism for critical situations
 * - Slippage protection: Minimum output amount based on oracle price
 * - Fee cap: Maximum execution fee to protect users
 */
contract IntentExecutor is Ownable, Pausable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  /// @notice Maximum allowed total fee in basis points (protocol fee + executor reward) (5% = 500/10000)
  uint256 public constant MAX_TOTAL_FEE_BPS = 500;

  /// @notice Basis points denominator for fee calculations
  uint256 public constant FEE_DENOMINATOR = 10000;

  /// @notice Maximum allowed slippage tolerance in basis points (50% = 5000/10000)
  uint256 public constant MAX_SLIPPAGE_TOLERANCE_BPS = 5000;

  /// @notice Price normalization target (18 decimals)
  uint256 private constant PRICE_PRECISION = 1e18;

  IntentFactory public intentFactory;
  Oracle public oracle;
  UniswapV3Swapper public swapper;

  /// @notice Protocol fee in basis points (default 0.2% = 20/10000)
  uint256 public protocolFeeBps;

  /// @notice Executor reward in basis points (default 0.1% = 10/10000)
  uint256 public executorRewardBps;

  /// @notice Slippage tolerance in basis points (default 5% = 500/10000)
  uint256 public slippageToleranceBps;

  /// @notice Uniswap V3 pool fee tier (default 0.3% = 3000)
  uint24 public poolFee;

  /// @notice Whether to skip oracle price for minimum output calculation (testnet only)
  /// @dev Set at deployment time and cannot be changed. NEVER set to true on mainnet!
  bool public immutable skipOraclePrice;

  event IntentExecuted(
    uint256 indexed intentId,
    address indexed user,
    address indexed executor,
    uint256 amountOut,
    uint256 protocolFee,
    uint256 executorReward
  );
  event ProtocolFeeUpdated(uint256 oldFee,uint256 newFee);
  event ExecutorRewardUpdated(uint256 oldReward,uint256 newReward);
  event PoolFeeUpdated(uint24 oldFee, uint24 newFee);
  event SlippageToleranceUpdated(uint256 oldTolerance, uint256 newTolerance);
  event IntentFactoryUpdated(address oldFactory, address newFactory);
  event OracleUpdated(address oldOracle, address newOracle);
  event SwapperUpdated(address oldSwapper, address newSwapper);

  /// @notice Emitted when tokens are rescued from the contract
  /// @param token The token address
  /// @param to The recipient address
  /// @param amount The amount rescued
  event TokensRescued(address indexed token, address indexed to, uint256 amount);

  error IntentExecutor__IntentAlreadyExecuted();
  error IntentExecutor__IntentAlreadyCancelled();
  error IntentExecutor__IntentExpired();
  error IntentExecutor__PriceThresholdNotMet();
  error IntentExecutor__TotalFeeTooHigh();
  error IntentExecutor__InvalidSlippageTolerance();
  error IntentExecutor__ZeroAddress();
  error IntentExecutor__InsufficientOutputAmount();

  /// @dev Validates that an address is not zero
  modifier notZeroAddress(address _addr) {
    if (_addr == address(0)) {
      revert IntentExecutor__ZeroAddress();
    }
    _;
  }

  constructor(
    address _intentFactory,
    address _oracle,
    address _swapper,
    bool _skipOraclePrice
  )
    Ownable(msg.sender)
    notZeroAddress(_intentFactory)
    notZeroAddress(_oracle)
    notZeroAddress(_swapper)
  {
    intentFactory = IntentFactory(_intentFactory);
    oracle = Oracle(_oracle);
    swapper = UniswapV3Swapper(_swapper);

    protocolFeeBps = 20; // 20/10000 = 0.2%
    executorRewardBps = 10; // 10/10000 = 0.1%
    if (protocolFeeBps + executorRewardBps > MAX_TOTAL_FEE_BPS) {
      revert IntentExecutor__TotalFeeTooHigh();
    }
    slippageToleranceBps = 500; // 500/10000 = 5%
    if (slippageToleranceBps > MAX_SLIPPAGE_TOLERANCE_BPS) {
      revert IntentExecutor__InvalidSlippageTolerance();
    }
    poolFee = 3000; // 0.3% Uniswap pool

    skipOraclePrice = _skipOraclePrice;
  }

  /**
   * @dev Validate intent status and expiration
   * @param _intent The intent to validate
   */
  function _validateIntent(IntentFactory.Intent memory _intent) internal view {
    if (_intent.status == IntentFactory.Status.Executed) {
      revert IntentExecutor__IntentAlreadyExecuted();
    }
    if (_intent.status == IntentFactory.Status.Cancelled) {
      revert IntentExecutor__IntentAlreadyCancelled();
    }
    if (_intent.expiration <= block.timestamp) {
      revert IntentExecutor__IntentExpired();
    }
  }

  /**
   * @dev Get price from oracle, normalize to 18 decimals and validate threshold
   * @param _tokenFrom The token to swap from
   * @param _tokenTo The token to swap to
   * @param _priceThreshold User's minimum acceptable price (1e18 scaled)
   * @return normalizedPrice Price normalized to 18 decimals
   */
  function _getAndValidatePrice(
    address _tokenFrom,
    address _tokenTo,
    uint256 _priceThreshold
  ) internal view returns (uint256 normalizedPrice) {
    (uint256 rawPrice, uint8 decimals, ) = oracle.getSafePrice(_tokenFrom, _tokenTo);

    // Normalize price to 18 decimals for consistent comparison
    if (decimals == 18) {
      normalizedPrice = rawPrice;
    } else if (decimals < 18) {
      normalizedPrice = rawPrice * (10 ** (18 - decimals));
    } else {
      normalizedPrice = rawPrice / (10 ** (decimals - 18));
    }

    // Verify price meets user's threshold
    if (normalizedPrice < _priceThreshold) {
      revert IntentExecutor__PriceThresholdNotMet();
    }
  }

  /**
   * @dev Calculate minimum output amount with slippage protection
   * @param _amountIn Input amount
   * @param _normalizedPrice Oracle price (1e18 scaled)
   * @return Minimum acceptable output amount
   */
  function _calculateMinimumOutput(
    uint256 _amountIn,
    uint256 _normalizedPrice
  ) internal view returns (uint256) {
    // Testnet mode: skip oracle price check, accept any output
    if (skipOraclePrice) {
      return 0;
    }

    uint256 expectedOutput = (_amountIn * _normalizedPrice) / PRICE_PRECISION;
    uint256 minOutput = (expectedOutput * (FEE_DENOMINATOR - slippageToleranceBps)) / FEE_DENOMINATOR;
    return minOutput;
  }

  /**
   * @dev Execute swap via UniswapV3Swapper
   * @param _intent The intent being executed
   * @param _amountOutMinimum Minimum acceptable output amount
   * @return amountOut Actual output amount from swap
   */
  function _executeSwap(
    IntentFactory.Intent memory _intent,
    uint256 _amountOutMinimum
  ) internal returns (uint256 amountOut) {
    // Transfer input tokens from user to swapper contract
    // Note: User must have approved this contract beforehand
    IERC20(_intent.tokenFrom).safeTransferFrom(
      _intent.user,
      address(swapper),
      _intent.amount
    );

    // Execute swap, output goes to this contract first
    amountOut = swapper.swapExactInputSingle(
      _intent.tokenFrom,
      _intent.tokenTo,
      poolFee,
      _intent.amount,
      _amountOutMinimum,
      address(this)
    );

    // Belt and suspenders: verify output meets minimum
    // (Uniswap already checks, but we double-check for safety)
    if (amountOut < _amountOutMinimum) {
      revert IntentExecutor__InsufficientOutputAmount();
    }
  }

  /**
   * @dev Distribute output tokens: protocol fee to owner, executor reward to executor, remaining to user
   * @param _intent The intent being executed
   * @param _amountOut Total output from swap
   * @return protocolFee The protocol fee amount
   * @return executorReward The executor reward amount
   */
  function _distributeTokens(
    IntentFactory.Intent memory _intent,
    uint256 _amountOut
  ) internal returns (uint256 protocolFee, uint256 executorReward) {
    // Calculate protocol fee and executor reward
    protocolFee = (_amountOut * protocolFeeBps) / FEE_DENOMINATOR;
    executorReward = (_amountOut * executorRewardBps) / FEE_DENOMINATOR;

    // Transfer protocol fee to contract owner
    if (protocolFee > 0) {
      IERC20(_intent.tokenTo).safeTransfer(owner(), protocolFee);
    }

    // Transfer executor reward to executor
    if (executorReward > 0) {
      IERC20(_intent.tokenTo).safeTransfer(msg.sender, executorReward);
    }

    // Transfer remaining tokens to user
    IERC20(_intent.tokenTo).safeTransfer(_intent.user, _amountOut - protocolFee - executorReward);
  }

  /**
   * @notice Execute an intent
   * @param _intentId The intent ID
   */
  function executeIntent(uint256 _intentId) 
    external
    nonReentrant
    whenNotPaused
  {
    // Load intent data
    IntentFactory.Intent memory intent = intentFactory.getIntent(_intentId);

    // Validate intent status and expiration
    _validateIntent(intent);

    // Get normalized price and validate threshold
    uint256 normalizedPrice = _getAndValidatePrice(
      intent.tokenFrom,
      intent.tokenTo,
      intent.priceThreshold
    );

    // Calculate minimum output with slippage protection
    uint256 amountOutMinimum = _calculateMinimumOutput(intent.amount, normalizedPrice);

    // Execute the swap
    uint256 amountOut = _executeSwap(intent, amountOutMinimum);

    // Distribute tokens (protocol fee to owner, executor reward to executor, remaining to user)
    (uint256 protocolFee, uint256 executorReward) = _distributeTokens(intent, amountOut);

    // Mark intent as executed in factory
    intentFactory.markExecuted(_intentId);

    emit IntentExecuted(
      _intentId,
      intent.user,
      msg.sender,
      amountOut,
      protocolFee,
      executorReward
    );
  }

  /**
   * @notice Update the protocol fee
   * @param _newFee The new protocol fee in basis points (protocolFee + executorReward must <= MAX_TOTAL_FEE_BPS)
   * @dev Only callable by the contract owner
   */
  function updateProtocolFee(uint256 _newFee) external onlyOwner {
    if (_newFee + executorRewardBps > MAX_TOTAL_FEE_BPS) {
      revert IntentExecutor__TotalFeeTooHigh();
    }

    uint256 oldFee = protocolFeeBps;
    protocolFeeBps = _newFee;

    emit ProtocolFeeUpdated(oldFee, _newFee);
  }

  /**
   * @notice Update the executor reward
   * @param _newReward The new executor reward in basis points (protocolFee + executorReward must <= MAX_TOTAL_FEE_BPS)
   * @dev Only callable by the contract owner
   */
  function updateExecutorReward(uint256 _newReward) external onlyOwner {
    if (_newReward + protocolFeeBps > MAX_TOTAL_FEE_BPS) {
        revert IntentExecutor__TotalFeeTooHigh();
    }

    uint256 oldReward = executorRewardBps;
    executorRewardBps = _newReward;

    emit ExecutorRewardUpdated(oldReward, _newReward);
  }

  /**
   * @notice Update the Uniswap V3 pool fee tier
   * @param _newPoolFee New pool fee (100, 500, 3000, or 10000)
   * @dev Only callable by owner. Common values: 100=0.01%, 500=0.05%, 3000=0.3%, 10000=1%
   */
  function updatePoolFee(uint24 _newPoolFee) external onlyOwner {
    uint24 oldPoolFee = poolFee;
    poolFee = _newPoolFee;

    emit PoolFeeUpdated(oldPoolFee, _newPoolFee);
  }

  /**
   * @notice Update slippage tolerance
   * @param _newTolerance New tolerance in basis points (max 5000 = 50%)
   * @dev Only callable by owner
   */
  function updateSlippageTolerance(uint256 _newTolerance) external onlyOwner {
    if (_newTolerance > MAX_SLIPPAGE_TOLERANCE_BPS) {
      revert IntentExecutor__InvalidSlippageTolerance();
    }

    uint256 oldTolerance = slippageToleranceBps;
    slippageToleranceBps = _newTolerance;

    emit SlippageToleranceUpdated(oldTolerance, _newTolerance);
  }

  /**
   * @notice Update the IntentFactory contract address
   * @param _newFactory New factory address
   * @dev Only callable by owner
   */
  function updateIntentFactory(address _newFactory)
    external
    onlyOwner
    notZeroAddress(_newFactory) 
  {
    address oldFactory = address(intentFactory);
    intentFactory = IntentFactory(_newFactory);

    emit IntentFactoryUpdated(oldFactory, _newFactory);
  }

  /**
   * @notice Update the Oracle contract address
   * @param _newOracle New oracle address
   * @dev Only callable by owner
   */
  function updateOracle(address _newOracle)
    external
    onlyOwner
    notZeroAddress(_newOracle)
  {
    address oldOracle = address(oracle);
    oracle = Oracle(_newOracle);

    emit OracleUpdated(oldOracle, _newOracle);
  }


  /**
   * @notice Update the Swapper contract address
   * @param _newSwapper New swapper address
   * @dev Only callable by owner
   */
  function updateSwapper(address _newSwapper)
    external
    onlyOwner
    notZeroAddress(_newSwapper)
  {
    address oldSwapper = address(swapper);
    swapper = UniswapV3Swapper(_newSwapper);

    emit SwapperUpdated(oldSwapper, _newSwapper); 
  }

  /**
   * @notice Pause the contract
   * @dev Only callable by owner. Prevents executeIntent from being called.
   */
  function pause() external onlyOwner {
    _pause();
  }

  /**
   * @notice Unpause the contract
   * @dev Only callable by owner
   */
  function unpause() external onlyOwner {
    _unpause();
  }

  /**
   * @notice Rescue tokens accidentally sent to this contract
   * @param _token Token address to rescue
   * @param _to Recipient address
   * @param _amount Amount to rescue
   * @dev Only callable by owner. Use for emergency token recovery.
   */
  function rescueTokens(
      address _token,
      address _to,
      uint256 _amount
  )
      external
      onlyOwner
      notZeroAddress(_token)
      notZeroAddress(_to)
  {
      IERC20(_token).safeTransfer(_to, _amount);

      emit TokensRescued(_token, _to, _amount);
  }

  /**
   * @notice Get the contract configuration
   * @return _intentFactory The intent factory address
   * @return _oracle The oracle address
   * @return _swapper The swapper address
   * @return _protocolFeeBps The protocol fee in basis points
   * @return _executorRewardBps The executor reward in basis points
   * @return _slippageToleranceBps The slippage tolerance in basis points
   * @return _poolFee The pool fee
   * @return _skipOraclePrice Whether to skip oracle price for minimum output calculation (testnet only)
   */
  function getConfig()
    external
    view
    returns (
      address _intentFactory,
      address _oracle,
      address _swapper,
      uint256 _protocolFeeBps,
      uint256 _executorRewardBps,
      uint256 _slippageToleranceBps,
      uint24 _poolFee,
      bool _skipOraclePrice
    ) {
      return (
        address(intentFactory),
        address(oracle),
        address(swapper),
        protocolFeeBps,
        executorRewardBps,
        slippageToleranceBps,
        poolFee,
        skipOraclePrice
      );
    }
}