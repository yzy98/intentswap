import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { network } from "hardhat";
import { sepolia } from "viem/chains";

interface DeploymentRecord {
  chainId: number;
  networkName: string;
  contracts: {
    oracle: string;
    swapper: string;
    intentFactory: string;
    intentExecutor: string;
  };
}

type DeploymentsJson = Record<string, DeploymentRecord>;

// Sepolia (11155111)
const SWAP_ROUTER_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedDir = path.join(
  __dirname,
  "../../contract-deployments/src/generated"
);
const abiDir = path.join(generatedDir, "abis");
const abiJsonDir = path.join(generatedDir, "abis-json");
const deploymentsJsonPath = path.join(generatedDir, "deployments.json");
const deploymentsTsPath = path.join(generatedDir, "deployments.ts");

function ensureGeneratedDirs() {
  fs.mkdirSync(abiDir, { recursive: true });
  fs.mkdirSync(abiJsonDir, { recursive: true });
}

function writeAbiTs(fileName: string, exportName: string, abi: unknown) {
  fs.writeFileSync(
    path.join(abiDir, fileName),
    `export const ${exportName} = ${JSON.stringify(abi, null, 2)} as const;\n`
  );
}

function writeAbiJson(fileName: string, abi: unknown) {
  fs.writeFileSync(
    path.join(abiJsonDir, fileName),
    `${JSON.stringify(abi, null, 2)}\n`
  );
}

function loadDeploymentsJson(): DeploymentsJson {
  if (!fs.existsSync(deploymentsJsonPath)) {
    return {};
  }

  const raw = fs.readFileSync(deploymentsJsonPath, "utf8").trim();
  if (!raw) {
    return {};
  }
  return JSON.parse(raw) as DeploymentsJson;
}

function writeDeploymentsJson(data: DeploymentsJson) {
  fs.writeFileSync(deploymentsJsonPath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeDeploymentsTs(data: DeploymentsJson) {
  const entries = Object.entries(data)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([chainId, dep]) => {
      return `  ${chainId}: {
    chainId: ${dep.chainId},
    networkName: ${JSON.stringify(dep.networkName)},
    contracts: {
      oracle: ${JSON.stringify(dep.contracts.oracle)} as Address,
      swapper: ${JSON.stringify(dep.contracts.swapper)} as Address,
      intentFactory: ${JSON.stringify(dep.contracts.intentFactory)} as Address,
      intentExecutor: ${JSON.stringify(dep.contracts.intentExecutor)} as Address,
    },
  }`;
    })
    .join(",\n");

  const source = `// GENERATED FILE. DO NOT EDIT.

import type { Address } from "viem";

export const deployments = {
${entries}
} as const;

export type SupportedChainId = keyof typeof deployments;
export type Deployment = (typeof deployments)[SupportedChainId];

export function getDeployment(chainId: number): Deployment {
  const d = (deployments as Record<number, Deployment>)[chainId];
  if (!d) {
    throw new Error(\`Unsupported chainId: \${chainId}\`);
  }
  return d;
}
`;

  fs.writeFileSync(deploymentsTsPath, source);
}

async function main() {
  // Initialize Viem
  const { viem, networkName } = await network.connect();
  console.log("Network name: ", networkName);

  // Get deployer account address
  const [deployer] = await viem.getWalletClients();
  console.log("Deployer account address: ", deployer.account.address);

  const publicClient = await viem.getPublicClient();
  const chainId = publicClient.chain.id;

  const isSepolia = chainId === sepolia.id;

  // Ensure generated directories exist
  ensureGeneratedDirs();

  // Deploy Oracle
  console.log("Deploying Oracle contract...");
  const oracle = await viem.deployContract("Oracle", [isSepolia]);
  console.log(
    `Oracle deployed (skipStaleCheck=${isSepolia}): `,
    oracle.address
  );
  writeAbiTs("oracle.ts", "oracleAbi", oracle.abi);
  writeAbiJson("oracle.json", oracle.abi);

  // Deploy UniswapV3Swapper
  console.log("Deploying UniswapV3Swapper contract...");
  const swapper = await viem.deployContract("UniswapV3Swapper", [
    SWAP_ROUTER_ADDRESS,
  ]);
  console.log("UniswapV3Swapper deployed: ", swapper.address);
  writeAbiTs("swapper.ts", "swapperAbi", swapper.abi);
  writeAbiJson("swapper.json", swapper.abi);

  // Deploy IntentFactory
  console.log("Deploying IntentFactory contract...");
  const intentFactory = await viem.deployContract("IntentFactory");
  console.log("IntentFactory deployed: ", intentFactory.address);
  writeAbiTs("intentFactory.ts", "intentFactoryAbi", intentFactory.abi);
  writeAbiJson("intentFactory.json", intentFactory.abi);

  // Deploy IntentExecutor
  console.log("Deploying IntentExecutor contract...");
  const intentExecutor = await viem.deployContract("IntentExecutor", [
    intentFactory.address,
    oracle.address,
    swapper.address,
    isSepolia,
  ]);
  console.log(
    `IntentExecutor deployed (skipOraclePrice=${isSepolia}): `,
    intentExecutor.address
  );
  writeAbiTs("intentExecutor.ts", "intentExecutorAbi", intentExecutor.abi);
  writeAbiJson("intentExecutor.json", intentExecutor.abi);

  // Post-deploy actions
  // Transfer ownership of IntentFactory to IntentExecutor
  const txHash = await intentFactory.write.transferOwnership([
    intentExecutor.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log("Transferred IntentFactory ownership to IntentExecutor");

  // Authorize IntentExecutor as Swapper executor
  const txHash1 = await swapper.write.authorizeExecutor([
    intentExecutor.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: txHash1 });
  console.log("Authorized IntentExecutor on Swapper");

  // Merge/update deployments by chainId
  const deployments = loadDeploymentsJson();
  deployments[String(chainId)] = {
    chainId,
    networkName,
    contracts: {
      oracle: oracle.address,
      swapper: swapper.address,
      intentFactory: intentFactory.address,
      intentExecutor: intentExecutor.address,
    },
  };

  writeDeploymentsJson(deployments);
  writeDeploymentsTs(deployments);

  console.log(
    `Updated deployments: chainId=${chainId} -> ${path.relative(
      process.cwd(),
      deploymentsTsPath
    )}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
