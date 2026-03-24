/** biome-ignore-all lint/suspicious/noBitwiseOperators: false positive */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: script logic */
/** biome-ignore-all lint/style/noNestedTernary: readability in script */
import { network } from "hardhat";
import { type Address, parseEther, zeroAddress } from "viem";

/**
 * Create + initialize a Uniswap v3 pool using ONLY UniswapV3Factory + the pool contract.
 *
 * Notes:
 * - UniswapV3Factory can only create pools. Initialization must be done by calling `initialize` on the pool.
 * - Token ordering matters: UniswapV3Factory expects token0 < token1 (by address).
 *
 * Defaults reference the official Sepolia deployments:
 * https://docs.uniswap.org/contracts/v3/reference/deployments/ethereum-deployments
 */

// Defaults (override via env)
const DEFAULT_FACTORY = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c" as const;
const DEFAULT_WETH = "0xfff9976782d46cc05630d1f6ebab18b2324d6b14" as const;
const DEFAULT_LINK = "0x779877A7B0D9E8603169DdbD7836e478b4624789" as const;
const DEFAULT_NFPM = "0x1238536071E1c677A632429e3655c799b22cDA52" as const;

const factoryAbi = [
  {
    type: "function",
    name: "getPool",
    stateMutability: "view",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
  {
    type: "function",
    name: "createPool",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
] as const;

const poolAbi = [
  {
    type: "function",
    name: "initialize",
    stateMutability: "nonpayable",
    inputs: [{ name: "sqrtPriceX96", type: "uint160" }],
    outputs: [],
  },
  {
    type: "function",
    name: "slot0",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "tickSpacing",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "int24" }],
  },
] as const;

const wethAbi = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
] as const;

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const nonfungiblePositionManagerAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "token0", type: "address" },
          { name: "token1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickLower", type: "int24" },
          { name: "tickUpper", type: "int24" },
          { name: "amount0Desired", type: "uint256" },
          { name: "amount1Desired", type: "uint256" },
          { name: "amount0Min", type: "uint256" },
          { name: "amount1Min", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
        ],
      },
    ],
    outputs: [
      { name: "tokenId", type: "uint256" },
      { name: "liquidity", type: "uint128" },
      { name: "amount0", type: "uint256" },
      { name: "amount1", type: "uint256" },
    ],
  },
] as const;

function sortTokens(a: Address, b: Address): [Address, Address] {
  return a.toLowerCase() < b.toLowerCase() ? [a, b] : [b, a];
}

function sqrt(value: bigint): bigint {
  if (value < BigInt(2)) {
    return value;
  }
  let x0 = value;
  let x1 = (x0 + BigInt(1)) >> BigInt(1);
  while (x1 < x0) {
    x0 = x1;
    x1 = (x1 + value / x1) >> BigInt(1);
  }
  return x0;
}

// sqrtPriceX96 = sqrt(price(token1/token0)) * 2^96
// integer form: sqrtPriceX96 = sqrt((amount1 << 192) / amount0)
function encodeSqrtPriceX96(amount1: bigint, amount0: bigint): bigint {
  if (amount0 === BigInt(0)) {
    throw new Error("amount0 is zero");
  }
  const ratioX192 = (amount1 << BigInt(192)) / amount0;
  return sqrt(ratioX192);
}

function fullRangeTicks(tickSpacing: number): {
  tickLower: number;
  tickUpper: number;
} {
  const MIN_TICK = -887_272;
  const MAX_TICK = 887_272;
  const tickLower = Math.ceil(MIN_TICK / tickSpacing) * tickSpacing;
  const tickUpper = Math.floor(MAX_TICK / tickSpacing) * tickSpacing;
  return { tickLower, tickUpper };
}

async function main() {
  const { viem, networkName } = await network.connect();
  console.log("Network:", networkName);

  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();
  const me = walletClient.account.address as Address;
  console.log("Sender:", me);

  const FACTORY =
    (process.env.UNIV3_FACTORY_ADDRESS as Address | undefined) ??
    DEFAULT_FACTORY;
  const TOKEN_A = (process.env.TOKEN_A as Address | undefined) ?? DEFAULT_LINK;
  const TOKEN_B = (process.env.TOKEN_B as Address | undefined) ?? DEFAULT_WETH;
  const FEE = Number(process.env.POOL_FEE ?? "3000");
  const NFPM =
    (process.env.UNIV3_NFPM_ADDRESS as Address | undefined) ?? DEFAULT_NFPM;
  const WETH =
    (process.env.WETH_ADDRESS as Address | undefined) ?? DEFAULT_WETH;
  const SEED_LIQUIDITY = process.env.SEED_LIQUIDITY === "true";

  // Default initial price: 1 WETH = 1000 LINK
  // You can override by setting PRICE_NUM / PRICE_DEN such that price = token1/token0 = PRICE_NUM/PRICE_DEN.
  const PRICE_NUM = BigInt(process.env.PRICE_NUM ?? "1");
  const PRICE_DEN = BigInt(process.env.PRICE_DEN ?? "1000");

  const [token0, token1] = sortTokens(TOKEN_A, TOKEN_B);
  console.log("Factory:", FACTORY);
  console.log("token0:", token0);
  console.log("token1:", token1);
  console.log("fee:", FEE);

  const poolBefore = await publicClient.readContract({
    address: FACTORY,
    abi: factoryAbi,
    functionName: "getPool",
    args: [token0, token1, FEE],
  });

  let pool = poolBefore;
  if (pool === zeroAddress) {
    console.log("Pool not found; creating...");
    const tx = await walletClient.writeContract({
      address: FACTORY,
      abi: factoryAbi,
      functionName: "createPool",
      args: [token0, token1, FEE],
    });
    await publicClient.waitForTransactionReceipt({ hash: tx });

    pool = await publicClient.readContract({
      address: FACTORY,
      abi: factoryAbi,
      functionName: "getPool",
      args: [token0, token1, FEE],
    });

    if (pool === zeroAddress) {
      throw new Error("createPool succeeded but getPool still returned zero");
    }
  } else {
    console.log("Pool already exists.");
  }

  console.log("Pool:", pool);

  // Check whether initialized (slot0.sqrtPriceX96 == 0 means uninitialized)
  const slot0 = await publicClient.readContract({
    address: pool,
    abi: poolAbi,
    functionName: "slot0",
  });
  const currentSqrtPriceX96 = slot0[0];

  if (currentSqrtPriceX96 === 0n) {
    const sqrtPriceX96 = encodeSqrtPriceX96(PRICE_NUM, PRICE_DEN);
    console.log(
      "Initializing pool with sqrtPriceX96:",
      sqrtPriceX96.toString()
    );
    const initTx = await walletClient.writeContract({
      address: pool,
      abi: poolAbi,
      functionName: "initialize",
      args: [sqrtPriceX96],
    });
    await publicClient.waitForTransactionReceipt({ hash: initTx });
    console.log("Initialized. Tx:", initTx);
  } else {
    console.log(
      "Pool already initialized. sqrtPriceX96:",
      currentSqrtPriceX96.toString()
    );
  }

  console.log("Done.");
  if (!SEED_LIQUIDITY) {
    console.log(
      "Next: add liquidity via NonfungiblePositionManager.mint (set SEED_LIQUIDITY=true to do it in this script)."
    );
    return;
  }

  // --- seed liquidity via NFPM ---
  // Defaults are tuned for LINK/WETH. Override with AMOUNT0_DESIRED / AMOUNT1_DESIRED (raw wei).
  const amount0Desired = BigInt(
    process.env.AMOUNT0_DESIRED ??
      (token0 === DEFAULT_LINK
        ? parseEther("10").toString()
        : parseEther("0.01").toString())
  );
  const amount1Desired = BigInt(
    process.env.AMOUNT1_DESIRED ??
      (token1 === DEFAULT_WETH
        ? parseEther("0.01").toString()
        : parseEther("10").toString())
  );

  console.log("Seeding liquidity via NFPM:", NFPM);
  console.log("amount0Desired:", amount0Desired.toString());
  console.log("amount1Desired:", amount1Desired.toString());

  // If token0 or token1 is WETH, wrap enough ETH to cover the desired WETH amount.
  const wethNeeded =
    token0 === WETH ? amount0Desired : token1 === WETH ? amount1Desired : 0n;
  if (wethNeeded > 0n) {
    console.log(
      "Wrapping ETH -> WETH:",
      WETH,
      "amount:",
      wethNeeded.toString()
    );
    const wrapTx = await walletClient.writeContract({
      address: WETH,
      abi: wethAbi,
      functionName: "deposit",
      value: wethNeeded,
    });
    await publicClient.waitForTransactionReceipt({ hash: wrapTx });
    console.log("WETH deposit tx:", wrapTx);
  }

  // Approve NFPM to pull token0/token1 from EOA
  const approve0 = await walletClient.writeContract({
    address: token0,
    abi: erc20Abi,
    functionName: "approve",
    args: [NFPM, amount0Desired],
  });
  const approve1 = await walletClient.writeContract({
    address: token1,
    abi: erc20Abi,
    functionName: "approve",
    args: [NFPM, amount1Desired],
  });
  await publicClient.waitForTransactionReceipt({ hash: approve0 });
  await publicClient.waitForTransactionReceipt({ hash: approve1 });
  console.log("approve token0 tx:", approve0);
  console.log("approve token1 tx:", approve1);

  const tickSpacing = await publicClient.readContract({
    address: pool,
    abi: poolAbi,
    functionName: "tickSpacing",
  });
  const { tickLower, tickUpper } = fullRangeTicks(Number(tickSpacing));
  console.log("tickSpacing:", tickSpacing);
  console.log("tickLower:", tickLower, "tickUpper:", tickUpper);

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10);
  const mintTx = await walletClient.writeContract({
    address: NFPM,
    abi: nonfungiblePositionManagerAbi,
    functionName: "mint",
    args: [
      {
        token0,
        token1,
        fee: FEE,
        tickLower,
        tickUpper,
        amount0Desired,
        amount1Desired,
        amount0Min: 0n,
        amount1Min: 0n,
        recipient: me,
        deadline,
      },
    ],
    value: 0n,
  });
  const mintReceipt = await publicClient.waitForTransactionReceipt({
    hash: mintTx,
  });
  console.log("mint tx:", mintReceipt.transactionHash);
  console.log("Liquidity seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
