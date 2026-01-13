"use client";

import { IntentIdsProvider } from "./intent-ids-provider";
import { ThemeProvider } from "./theme-provider";
import { WalletProvider } from "./wallet-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <WalletProvider>
        <IntentIdsProvider>{children}</IntentIdsProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
