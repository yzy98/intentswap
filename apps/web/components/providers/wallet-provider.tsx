"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  getDefaultConfig,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

const { wallets } = getDefaultWallets();

export const config = getDefaultConfig({
  appName: "IntentSwap",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? "",
  wallets: [...wallets],
  chains: [hardhat, sepolia],
  ssr: true,
});

export const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === "dark";

  const getTheme = () => {
    if (!mounted) {
      return;
    }
    return isDarkMode
      ? darkTheme({
          accentColor: "oklch(0.606 0.25 292.717)",
          accentColorForeground: "oklch(0.969 0.016 293.756)",
          borderRadius: "none",
          fontStack: "system",
        })
      : lightTheme({
          accentColor: "oklch(0.541 0.281 293.009)",
          accentColorForeground: "oklch(0.969 0.016 293.756)",
          borderRadius: "none",
          fontStack: "system",
        });
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={getTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
