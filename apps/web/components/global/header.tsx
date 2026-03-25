"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useConnection, useReadContract } from "wagmi";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { oracleContract } from "@/lib/constants";
import { ModeToggle } from "./mode-toggle";

export function Header() {
  const { address } = useConnection();
  const { isAuthenticated, isAuthenticating, signIn, signOut } = useAuth();

  const { data: ownerAddress } = useReadContract({
    ...oracleContract,
    functionName: "owner",
  });

  const isOwner = address && ownerAddress && address === ownerAddress;

  return (
    <header className="sticky top-0 z-20 border-border/70 border-b bg-background/80 px-4 py-2.5 backdrop-blur supports-backdrop-filter:bg-background/55">
      <Link href="/">
        <div className="leading-none">
          <h1 className="font-semibold text-2xl tracking-tight">IntentSwap</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-70">
            Intent Execution Desk
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {isOwner && isAuthenticated && (
          <Link
            className="border border-border/70 px-2 py-1 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/admin"
          >
            Admin
          </Link>
        )}
        {address && !isAuthenticated && (
          <Button disabled={isAuthenticating} onClick={signIn}>
            {isAuthenticating ? "Signing in..." : "Sign in"}
          </Button>
        )}
        {address && isAuthenticated && (
          <Button onClick={signOut} variant="outline">
            <LogOutIcon />
            Sign Out
          </Button>
        )}
        <ConnectButton chainStatus="icon" showBalance={false} />
        <ModeToggle />
      </div>
    </header>
  );
}
