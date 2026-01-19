import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { network } from "hardhat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Initialize Viem
  const { viem, networkName } = await network.connect();
  console.log("Network name: ", networkName);

  // Get deployer account address
  const [deployer] = await viem.getWalletClients();
  console.log("Deployer account address: ", deployer.account.address);

  // Store the ABIs in the web/abis directory
  const abiDir = path.join(__dirname, "../../web/abis");
  fs.mkdirSync(abiDir, { recursive: true });

  // Deploy Oracle contract
  console.log("Deploying Oracle contract...");
  const oracle = await viem.deployContract("Oracle");
  console.log("Oracle contract deployed to: ", oracle.address);
  // Generate TypeScript file with as const for type inference
  fs.writeFileSync(
    path.join(abiDir, "oracle.ts"),
    `export const oracleAbi = ${JSON.stringify(oracle.abi, null, 2)} as const;`
  );

  // Uniswap V3 Contract Address in Sepolia (11155111)
  // SwapRouter02: 0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E

  // Deploy UniswapV3Swapper contract
  console.log("Deploying UniswapV3Swapper contract...");
  const swapper = await viem.deployContract("UniswapV3Swapper", [
    "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
  ]);
  console.log("UniswapV3Swapper contract deployed to: ", swapper.address);
  // Generate TypeScript file with as const for type inference
  fs.writeFileSync(
    path.join(abiDir, "swapper.ts"),
    `export const swapperAbi = ${JSON.stringify(swapper.abi, null, 2)} as const;`
  );

  // Deploy IntentFactory contract
  console.log("Deploying IntentFactory contract...");
  const intentFactory = await viem.deployContract("IntentFactory");
  console.log("IntentFactory contract deployed to: ", intentFactory.address);
  // Generate TypeScript file with as const for type inference
  fs.writeFileSync(
    path.join(abiDir, "intentFactory.ts"),
    `export const intentFactoryAbi = ${JSON.stringify(intentFactory.abi, null, 2)} as const;`
  );

  // Deploy IntentExecutor contract
  console.log("Deploying IntentExecutor contract...");
  const intentExecutor = await viem.deployContract("IntentExecutor", [
    intentFactory.address,
    oracle.address,
    swapper.address,
  ]);
  console.log("IntentExecutor contract deployed to: ", intentExecutor.address);
  // Generate TypeScript file with as const for type inference
  fs.writeFileSync(
    path.join(abiDir, "intentExecutor.ts"),
    `export const intentExecutorAbi = ${JSON.stringify(intentExecutor.abi, null, 2)} as const;`
  );

  // Transfer ownership of IntentFactory to IntentExecutor
  await intentFactory.write.transferOwnership([intentExecutor.address]);
  console.log("Ownership of IntentFactory transferred to IntentExecutor");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
