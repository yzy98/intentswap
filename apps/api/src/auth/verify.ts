import { SignJWT } from "jose";
import type { VerifySiweMessageParameters } from "viem/siwe";
import { parseSiweMessage } from "viem/siwe";
import type { Env } from "@/env";
import type { Services } from "@/services";

export const handleVerify = async (
  req: Request,
  env: Env,
  services: Services
): Promise<Response> => {
  const { message, signature } = await req.json<VerifySiweMessageParameters>();

  // Parse SIWE message
  const { nonce, address } = parseSiweMessage(message);
  if (!(nonce && address)) {
    return Response.json(
      {
        error: "Invalid SIWE message",
      },
      { status: 400 }
    );
  }

  // Check if nonce exists in KV
  const storedNonce = await env.INTENTSWAP_AUTH_NONCE.get(nonce);
  if (!storedNonce) {
    return Response.json(
      {
        error: "Invalid or expired nonce",
      },
      { status: 401 }
    );
  }

  // Verify SIWE message
  const isValid = await services.publicClient.verifySiweMessage({
    message,
    signature,
  });
  if (!isValid) {
    return Response.json(
      {
        error: "Invalid signature",
      },
      { status: 401 }
    );
  }

  // Delete nonce from KV
  await env.INTENTSWAP_AUTH_NONCE.delete(nonce);

  // Sign JWT
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const jwt = await new SignJWT({ address: address.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return Response.json({ token: jwt });
};
