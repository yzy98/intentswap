export const swapperAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
      {
        internalType: "address",
        name: "_poolManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "_permit2",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint160",
        name: "amount",
        type: "uint160",
      },
      {
        internalType: "uint48",
        name: "expiration",
        type: "uint48",
      },
    ],
    name: "approveTokenWithPermit2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "permit2",
    outputs: [
      {
        internalType: "contract IPermit2",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolManager",
    outputs: [
      {
        internalType: "contract IPoolManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "contract IUniversalRouter",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
      },
      {
        internalType: "bool",
        name: "zeroForOne",
        type: "bool",
      },
      {
        internalType: "uint128",
        name: "amountIn",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "minAmountOut",
        type: "uint128",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "swapExactInputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
