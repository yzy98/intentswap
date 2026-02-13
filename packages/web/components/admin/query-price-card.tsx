"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { useConfig } from "wagmi";
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
import { Spinner } from "@/components/ui/spinner";
import { bySymbol, oracleContract } from "@/lib/constants";

export const QueryPriceCard = () => {
  const [tokenFrom, setTokenFrom] = useState<Address | undefined>();
  const [tokenTo, setTokenTo] = useState<Address | undefined>();
  const [result, setResult] = useState<
    | {
        price: number;
        hasFeed: boolean;
      }
    | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const config = useConfig();

  const handleQuery = async () => {
    if (!(tokenFrom && tokenTo)) {
      toast.error("Please select both tokens");
      return;
    }

    setIsLoading(true);
    try {
      // Check if the feed is set already
      const hasFeed = await readContract(config, {
        ...oracleContract,
        functionName: "hasFeed",
        args: [tokenFrom, tokenTo],
      });

      if (!hasFeed) {
        setResult({
          price: 0,
          hasFeed: false,
        });
        return;
      }

      // Get the price
      const [price, decimals] = await readContract(config, {
        ...oracleContract,
        functionName: "getSafePrice",
        args: [tokenFrom, tokenTo],
      });

      setResult({
        price: Number(price) / 10 ** decimals,
        hasFeed: true,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to query price"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full" variant="glass">
      <CardHeader>
        <CardTitle>Query Price Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(v) => setTokenFrom(v as Address)}
            value={tokenFrom}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Token A" />
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
            onValueChange={(v) => setTokenTo(v as Address)}
            value={tokenTo}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Token B" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(bySymbol)
                  .filter((token) => token.address !== tokenFrom)
                  .map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.symbol}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button disabled={isLoading} onClick={handleQuery}>
            {isLoading && <Spinner data-icon="inline-start" />}
            Query
          </Button>
        </div>

        {result && (
          <div>
            {result.hasFeed ? (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Current Price</p>
                <p className="font-bold text-2xl">{result.price.toFixed(8)}</p>
              </div>
            ) : (
              <p className="text-destructive">
                No price feed configured for this token pair
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
