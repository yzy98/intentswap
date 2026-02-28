import "dotenv/config";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

export const ENV = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  RPC_URL: requireEnv("RPC_URL"),
  INTENT_FACTORY_ADDRESS: requireEnv("INTENT_FACTORY_ADDRESS"),
} as const;
