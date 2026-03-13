import { createAuthClient } from "@packages/auth/client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const authClient = createAuthClient(API_BASE_URL);

export const { useSession } = authClient;
