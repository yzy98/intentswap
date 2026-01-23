"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useConfig, useConnection, useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bySymbol, oracleContractSepolia } from "@/lib/constants";
import { SetFeedDialog } from "./set-feed-dialog";

export function OracleCard() {
  const [tokenA, setTokenA] = useState<`0x${string}` | undefined>();
  const [tokenB, setTokenB] = useState<`0x${string}` | undefined>();
  const [feedPrice, setFeedPrice] = useState<number | undefined>();

  const { address } = useConnection();
  const config = useConfig();

  const { data: ownerAddress } = useReadContract({
    ...oracleContractSepolia,
    functionName: "owner",
  });

  const isOwner = address && ownerAddress && address === ownerAddress;

  const handleGetPrice = async () => {
    if (!(tokenA && tokenB)) {
      toast.error("Please select both tokens");
      return;
    }

    // [TODO] Use readContracts instead
    const [price, decimals] = await Promise.all([
      await readContract(config, {
        ...oracleContractSepolia,
        functionName: "getPrice",
        args: [tokenA, tokenB],
      }),
      await readContract(config, {
        ...oracleContractSepolia,
        functionName: "getDecimals",
        args: [tokenA, tokenB],
      }),
    ]);

    setFeedPrice(Number(price) / 10 ** decimals);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Price Oracle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && <SetFeedDialog />}
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => setTokenA(value as `0x${string}`)}
            value={tokenA}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a token" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(bySymbol).map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <span>/</span>
          <Select
            onValueChange={(value) => setTokenB(value as `0x${string}`)}
            value={tokenB}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a token" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(bySymbol).map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={handleGetPrice}>Get Price</Button>
          <p>Price: {feedPrice?.toFixed(4)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
