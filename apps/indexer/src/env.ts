import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  RPC_URL: z.url(),
  INTENT_FACTORY_ADDRESS: z.string().startsWith("0x").length(42),
});

export const ENV = envSchema.parse(process.env);
