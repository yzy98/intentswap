"use client";

import { AuthProvider } from "./auth-provider";
import { IntentIdsProvider } from "./intent-ids-provider";
import { ThemeProvider } from "./theme-provider";
import { UrqlProvider } from "./urql-provider";
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
        <AuthProvider>
          <UrqlProvider>
            <IntentIdsProvider>{children}</IntentIdsProvider>
          </UrqlProvider>
        </AuthProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
