import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORTAL_URL: z.url(),
  CHAIN_ID: z.coerce.number().int().positive(),
});

export const ENV = envSchema.parse(process.env);
