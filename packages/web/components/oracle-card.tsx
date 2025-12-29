"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useConfig, useConnection, useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { oracleAbi } from "@/abis/oracle";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SEPOLIA_BTC_TOKEN_ADDRESS,
  SEPOLIA_CONTRACT_ORACLE_ADDRESS,
  SEPOLIA_ETH_TOKEN_ADDRESS,
  SEPOLIA_LINK_TOKEN_ADDRESS,
} from "@/lib/constants";
import { SetFeedDialog } from "./set-feed-dialog";
import { Button } from "./ui/button";

export function OracleCard() {
  const [tokenA, setTokenA] = useState<`0x${string}` | undefined>();
  const [tokenB, setTokenB] = useState<`0x${string}` | undefined>();
  const [feedPrice, setFeedPrice] = useState<number | undefined>();

  const { address } = useConnection();
  const config = useConfig();

  const { data: ownerAddress } = useReadContract({
    abi: oracleAbi,
    address: SEPOLIA_CONTRACT_ORACLE_ADDRESS,
    functionName: "owner",
  });

  const isOwner = address && ownerAddress && address === ownerAddress;

  const handleGetPrice = async () => {
    if (!(tokenA && tokenB)) {
      toast.error("Please select both tokens");
      return;
    }

    const [price, decimals] = await Promise.all([
      await readContract(config, {
        abi: oracleAbi,
        address: SEPOLIA_CONTRACT_ORACLE_ADDRESS,
        functionName: "getPrice",
        args: [tokenA, tokenB],
      }),
      await readContract(config, {
        abi: oracleAbi,
        address: SEPOLIA_CONTRACT_ORACLE_ADDRESS,
        functionName: "getDecimals",
        args: [tokenA, tokenB],
      }),
    ]);

    setFeedPrice(Number(price) / 10 ** decimals);
  };

  return (
    <Card className="w-2xl">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
                <SelectItem value={SEPOLIA_LINK_TOKEN_ADDRESS}>LINK</SelectItem>
                <SelectItem value={SEPOLIA_BTC_TOKEN_ADDRESS}>BTC</SelectItem>
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
                <SelectItem value={SEPOLIA_ETH_TOKEN_ADDRESS}>ETH</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={handleGetPrice}>Get Price</Button>
          <p>Price: {feedPrice?.toFixed(4)}</p>
        </div>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}
