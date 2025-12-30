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

  // Uniswap Universal V4 Contract Addresses in Sepolia (11155111)
  // PoolManager 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543
  // Universal Router 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b
  // Permit2 0x000000000022D473030F116dDEE9F6B43aC78BA3

  // Deploy UniversalRouterV4Swapper contract
  console.log("Deploying UniversalRouterV4Swapper contract...");
  const swapper = await viem.deployContract("UniversalRouterV4Swapper", [
    "0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b",
    "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
    "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  ]);
  console.log(
    "UniversalRouterV4Swapper contract deployed to: ",
    swapper.address
  );
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
