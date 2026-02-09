"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useConnection, useReadContract } from "wagmi";
import { oracleContract } from "@/lib/constants";
import { ModeToggle } from "./mode-toggle";

export function Header() {
  const { address } = useConnection();

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
        <ConnectButton chainStatus="icon" showBalance={false} />
        <ModeToggle />
      </div>
    </header>
  );
}
