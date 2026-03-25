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
    <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-2xl tracking-tight sm:text-3xl">
            Dashboard
          </h2>
          <Badge
            className="border-border/80 bg-background/80 sm:inline-flex"
            variant="secondary"
          >
            {chain?.name ?? "Unknown network"}
          </Badge>
        </div>
        <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
          Track intent lifecycle, inspect execution status, and dispatch new
          orders from one command surface.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge className="font-mono" variant="outline">
          {shortAddress(address)}
        </Badge>
        {!chain && <Badge variant="destructive">Wrong network</Badge>}
      </div>
    </section>
  );
};
