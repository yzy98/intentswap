"use client";

import type { Address } from "viem";
import { useChainId, useChains } from "wagmi";
import { Badge } from "@/components/ui/badge";
import { shortAddress } from "@/lib/utils";

interface TopSectionProps {
  address: Address;
}

export const TopSection = ({ address }: TopSectionProps) => {
  const chains = useChains();
  const chainId = useChainId();

  const chain = chains.find((c) => c.id === chainId);

  return (
    <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-xl tracking-tight sm:text-2xl">
            Dashboard
          </h2>
          <Badge className="hidden sm:inline-flex" variant="secondary">
            {chain?.name ?? "Unknown network"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Monitor, manage, and create intents in one place.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">{shortAddress(address)}</Badge>
        {!chain && <Badge variant="destructive">Wrong network</Badge>}
      </div>
    </section>
  );
};
