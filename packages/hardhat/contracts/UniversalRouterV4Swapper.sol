
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IUniversalRouter } from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import { Commands } from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import { IPoolManager } from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import { Currency } from "@uniswap/v4-core/src/types/Currency.sol";
import { IV4Router } from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import { Actions } from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import { IPermit2 } from "@uniswap/v4-periphery/lib/permit2/src/interfaces/IPermit2.sol";
import { StateLibrary } from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import { PoolKey } from "@uniswap/v4-core/src/types/PoolKey.sol";

contract UniversalRouterV4Swapper {
  using StateLibrary for IPoolManager;

  IUniversalRouter public immutable router;
  IPoolManager public immutable poolManager;
  IPermit2 public immutable permit2;

  constructor (address _router, address _poolManager, address _permit2) {
    router = IUniversalRouter(payable(_router));
    poolManager = IPoolManager(_poolManager);
    permit2 = IPermit2(_permit2);
  }

  function approveTokenWithPermit2(
    address token,
    uint160 amount,
    uint48 expiration
  ) external {
    IERC20(token).approve(address(permit2), type(uint256).max);
    permit2.approve(token, address(router), amount, expiration);
  }

  function swapExactInputSingle(
    PoolKey calldata key,
    bool zeroForOne,
    uint128 amountIn,
    uint128 minAmountOut,
    address recipient
  ) external returns (uint256 amountOut) {
    // Encode the Universal Router command
    bytes memory commands = abi.encodePacked(uint8(Commands.V4_SWAP));
    bytes[] memory inputs = new bytes[](1);

    // Encode V4Router actions
    bytes memory actions = abi.encodePacked(
      uint8(Actions.SWAP_EXACT_IN_SINGLE),
      uint8(Actions.SETTLE_ALL),
      uint8(Actions.TAKE_ALL)
    );

    Currency currencyIn = zeroForOne ? key.currency0 : key.currency1;
    Currency currencyOut = zeroForOne ? key.currency1 : key.currency0;

    // balance delta (avoid counting pre-existing balance)
    uint256 balanceBefore = currencyOut.balanceOf(address(this));

    // Prepare parameters for each action
    bytes[] memory params = new bytes[](3);
    PoolKey memory poolKey = key;
    params[0] = abi.encode(
        poolKey,
        zeroForOne,
        amountIn,
        minAmountOut,
        bytes("")
    );
    params[1] = abi.encode(currencyIn, amountIn);
    params[2] = abi.encode(currencyOut, minAmountOut);

    // Combine actions and params into inputs
    inputs[0] = abi.encode(actions, params);

    // Execute the swap
    uint256 deadline = block.timestamp + 20;
    router.execute(commands, inputs, deadline);

    // Verify and return the output amount
    amountOut = currencyOut.balanceOf(address(this)) - balanceBefore;
    require(amountOut >= minAmountOut, "Insufficient output amount");
    
    // Transfer output back to the user
    currencyOut.transfer(recipient, amountOut);
  }
}