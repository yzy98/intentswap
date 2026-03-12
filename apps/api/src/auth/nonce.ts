import { generateSiweNonce } from "viem/siwe";
import type { Env } from "@/env";

export const handleGetNonce = async (
  _req: Request,
  env: Env
): Promise<Response> => {
  const nonce = generateSiweNonce();
  await env.INTENTSWAP_AUTH_NONCE.put(nonce, "1", {
    expirationTtl: 300, // 5 minutes
  });
  return Response.json({ nonce });
};
