import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { ENV } from "@/env";

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(ENV.RPC_URL),
});
