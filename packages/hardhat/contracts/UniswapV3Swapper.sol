// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IUniswapV3SwapRouter} from "./interfaces/IUniswapV3SwapRouter.sol";

/**
 * @title UniswapV3Swapper
 * @author yzy98
 * @notice A secure wrapper for Uniswap V3 swaps with access control
 * @dev Only authorized executors can perform swaps. Includes emergency withdrawal functionality.
 */
contract UniswapV3Swapper is Ownable {
  using SafeERC20 for IERC20;

  IUniswapV3SwapRouter public immutable swapRouter;

  /// @notice Mapping of authorized executors
  mapping(address => bool) public authorizedExecutors;

  /// @notice Emitted when an executor is authorized
  event ExecutorAuthorized(address indexed executor);

  /// @notice Emitted when an executor authorization is revoked
  event ExecutorRevoked(address indexed executor);

  /// @notice Emitted when a swap is executed
  event SwapExecuted(
    address indexed tokenIn,
    address indexed tokenOut,
    uint256 amountIn,
    uint256 amountOut,
    address recipient
  );

  /// @notice Emitted when tokens are withdrawn in an emergency
  event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);

  error UniswapV3Swapper__Unauthorized();
  error UniswapV3Swapper__InvalidAddress();
  error UniswapV3Swapper__InvalidAmount();

  /// @notice Restricts function access to authorized executors only
  modifier onlyAuthorizedExecutor() {
    if (!authorizedExecutors[msg.sender]) {
      revert UniswapV3Swapper__Unauthorized();
    }
    _;
  }

  /**
   * @notice Initializes the UniswapV3Swapper contract
   * @param _swapRouter The address of the Uniswap V3 SwapRouter contract
   * @dev After deployment, call authorizeExecutor() to add the IntentExecutor
   */
  constructor(address _swapRouter) Ownable(msg.sender) {
    if (_swapRouter == address(0)) {
      revert UniswapV3Swapper__InvalidAddress();
    }

    swapRouter = IUniswapV3SwapRouter(_swapRouter);
  }

  /**
   * @notice Execute a single-hop exact input swap on Uniswap V3
   * @param _tokenIn The input token address
   * @param _tokenOut The output token address
   * @param _fee The pool fee tier (e.g., 500, 3000, 10000)
   * @param _amountIn The exact amount of input tokens
   * @param _amountOutMinimum The minimum acceptable output amount (slippage protection)
   * @param _recipient The address to receive the output tokens
   * @return amountOut The actual amount of output tokens received
   * @dev Only callable by authorized executors. Caller must transfer tokens to this contract first.
   */
  function swapExactInputSingle(
    address _tokenIn,
    address _tokenOut,
    uint24 _fee,
    uint256 _amountIn,
    uint256 _amountOutMinimum,
    address _recipient
  ) external onlyAuthorizedExecutor returns (uint256 amountOut) {
    // Validate inputs
    if (_tokenIn == address(0) || _tokenOut == address(0) || _recipient == address(0)) {
      revert UniswapV3Swapper__InvalidAddress();
    }
    if (_amountIn == 0) {
      revert UniswapV3Swapper__InvalidAmount();
    }

    // Approve router to spend tokens (using forceApprove to handle non-standard tokens)
    IERC20(_tokenIn).forceApprove(address(swapRouter), _amountIn);

    // Build swap params
    IUniswapV3SwapRouter.ExactInputSingleParams memory params =
      IUniswapV3SwapRouter.ExactInputSingleParams({
      tokenIn: _tokenIn,
      tokenOut: _tokenOut,
      fee: _fee,
      recipient: _recipient,
      amountIn: _amountIn,
      amountOutMinimum: _amountOutMinimum,
      sqrtPriceLimitX96: 0 // No price limit
    });

    // Execute swap
    amountOut = swapRouter.exactInputSingle(params);

    emit SwapExecuted(_tokenIn, _tokenOut, _amountIn, amountOut, _recipient);
  }

  /**
   * @notice Authorize a new executor
   * @param _executor The address to authorize
   * @dev Only callable by the contract owner
   */
  function authorizeExecutor(address _executor) external onlyOwner {
    if (_executor == address(0)) {
      revert UniswapV3Swapper__InvalidAddress();
    }

    authorizedExecutors[_executor] = true;
    emit ExecutorAuthorized(_executor);
  }

  /**
   * @notice Revoke an executor's authorization
   * @param _executor The address to revoke
   * @dev Only callable by the contract owner
   */
  function revokeExecutor(address _executor) external onlyOwner {
    if (_executor == address(0)) {
      revert UniswapV3Swapper__InvalidAddress();
    }

    authorizedExecutors[_executor] = false;
    emit ExecutorRevoked(_executor);
  }

  /**
   * @notice Emergency withdraw tokens stuck in this contract
   * @param _token The token address to withdraw
   * @param _to The recipient address
   * @param _amount The amount to withdraw
   * @dev Only callable by the contract owner. Use in case tokens are accidentally sent here.
   */
  function emergencyWithdraw(
    address _token,
    address _to,
    uint256 _amount
  ) external onlyOwner {
    if (_token == address(0) || _to == address(0)) {
      revert UniswapV3Swapper__InvalidAddress();
    }
    if (_amount == 0) {
      revert UniswapV3Swapper__InvalidAmount();
    }

    IERC20(_token).safeTransfer(_to, _amount);
    emit EmergencyWithdraw(_token, _to, _amount);
  }

  /**
   * @notice Check if an address is an authorized executor
   * @param _executor The address to check
   * @return True if authorized, false otherwise
   */
  function isAuthorizedExecutor(address _executor) external view returns (bool) {
    return authorizedExecutors[_executor];
  }
}