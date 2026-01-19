// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IUniswapV3SwapRouter} from "./interfaces/IUniswapV3SwapRouter.sol";

contract UniswapV3Swapper {
  using SafeERC20 for IERC20;

  IUniswapV3SwapRouter public immutable swapRouter;

  constructor(address _swapRouter) {
    swapRouter = IUniswapV3SwapRouter(_swapRouter);
  }

  function swapExactInputSingle(
    address tokenIn,
    address tokenOut,
    uint24 fee,
    uint256 amountIn,
    uint256 amountOutMinimum,
    address recipient
  ) external returns (uint256 amountOut) {
    // Swapper must already hold `amountIn` of tokenIn (IntentExecutor transfers it here).
    IERC20(tokenIn).forceApprove(address(swapRouter), amountIn);

    IUniswapV3SwapRouter.ExactInputSingleParams memory params =
      IUniswapV3SwapRouter.ExactInputSingleParams({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      fee: fee,
      recipient: recipient,
      amountIn: amountIn,
      amountOutMinimum: amountOutMinimum,
      sqrtPriceLimitX96: 0
    });

    amountOut = swapRouter.exactInputSingle(params);
  }
}