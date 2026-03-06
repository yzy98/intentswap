export const CONFIG = {
  batchSize: BigInt(500),
  confirmations: BigInt(3),
  pollInterval: 3000,
  startBlock: BigInt(38_250_728), // IntentFactory contract deployment block in Base Sepolia
} as const;
