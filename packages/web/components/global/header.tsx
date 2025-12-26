"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ModeToggle } from "./mode-toggle";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-2">
      <h1 className="font-bold text-2xl">IntentSwap</h1>
      <div className="flex items-center gap-2">
        <ConnectButton chainStatus="icon" showBalance={false} />
        <ModeToggle />
      </div>
    </header>
  );
}
