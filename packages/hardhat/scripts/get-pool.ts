/** biome-ignore-all lint/suspicious/noBitwiseOperators: false positive */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: script logic */
/** biome-ignore-all lint/style/noNestedTernary: readability in script */
import { network } from "hardhat";
import type { Address } from "viem";

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

// Sepolia
const DEFAULT_FACTORY = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c" as const;
const DEFAULT_WETH = "0xfff9976782d46cc05630d1f6ebab18b2324d6b14" as const;
const DEFAULT_LINK = "0x779877A7B0D9E8603169DdbD7836e478b4624789" as const;

// // Base Sepolia
// const DEFAULT_FACTORY = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24" as const;
// const DEFAULT_WETH = "0x4200000000000000000000000000000000000006" as const;
// const DEFAULT_LINK = "0xE4aB69C077896252FAFBD49EFD26B5D171A32410" as const;

// Base
// const DEFAULT_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD" as const;
// const DEFAULT_WETH = "0x4200000000000000000000000000000000000006" as const;
// const DEFAULT_LINK = "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196" as const;

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

function sortTokens(a: Address, b: Address): [Address, Address] {
  return a.toLowerCase() < b.toLowerCase() ? [a, b] : [b, a];
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

  const [token0, token1] = sortTokens(TOKEN_A, TOKEN_B);
  console.log("Factory:", FACTORY);
  console.log("token0:", token0);
  console.log("token1:", token1);

  for (const fee of [500, 3000, 10_000]) {
    const pool = await publicClient.readContract({
      address: FACTORY,
      abi: factoryAbi,
      functionName: "getPool",
      args: [token0, token1, fee],
    });

    console.log("Pool:", pool);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
