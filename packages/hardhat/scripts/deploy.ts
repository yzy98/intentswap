import { network } from "hardhat";

async function main() {
  // Initialize Viem
  const { viem, networkName } = await network.connect();
  console.log("Network name: ", networkName);

  // Get deployer account address
  const [deployer] = await viem.getWalletClients();
  console.log("Deployer account address: ", deployer.account.address);

  // Deploy Oracle contract
  console.log("Deploying Oracle contract...");
  const oracle = await viem.deployContract("Oracle");
  console.log("Oracle contract deployed to: ", oracle.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
