"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogOutIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useConnection, useReadContract } from "wagmi";
import { CreateIntentDialog } from "@/components/intents/create-intent-dialog";
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
    <header className="flex items-center justify-between border-b px-4 py-2">
      <Link href="/">
        <h1 className="font-bold text-2xl">IntentSwap</h1>
      </Link>
      <div className="flex items-center gap-2">
        {isOwner && (
          <Link
            className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/admin"
          >
            Admin
          </Link>
        )}
        {address && isAuthenticated && (
          <CreateIntentDialog
            triggerButton={
              <Button>
                <PlusIcon />
                Create Intent
              </Button>
            }
          />
        )}
        {address && !isAuthenticated && (
          <Button disabled={isAuthenticating} onClick={signIn}>
            {isAuthenticating ? "Signing in..." : "Sign in"}
          </Button>
        )}
        {address && isAuthenticated && (
          <Button onClick={signOut}>
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
