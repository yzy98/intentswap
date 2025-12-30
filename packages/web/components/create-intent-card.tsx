"use client";

import { toast } from "sonner";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { intentFactoryAbi } from "@/abis/intentFactory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEPOLIA_CONTRACT_INTENT_FACTORY_ADDRESS } from "@/lib/constants";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function CreateIntentCard() {
  const { mutateAsync, error } = useWriteContract();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const tokenFrom = formData.get("tokenFrom") as `0x${string}`;
    const tokenTo = formData.get("tokenTo") as `0x${string}`;
    const amount = parseEther(formData.get("amount") as string);
    const priceThreshold = parseEther(formData.get("priceThreshold") as string);
    const expiration = BigInt(
      Math.floor(
        new Date(formData.get("expiration") as string).getTime() / 1000
      )
    );

    console.log(tokenFrom, tokenTo, amount, priceThreshold, expiration);

    toast.promise(
      mutateAsync({
        abi: intentFactoryAbi,
        address: SEPOLIA_CONTRACT_INTENT_FACTORY_ADDRESS,
        functionName: "createIntent",
        args: [tokenFrom, tokenTo, amount, priceThreshold, expiration],
        gas: BigInt(300_000),
      }),
      {
        loading: "Creating intent...",
        success: `Intent created successfully for token pair: ${tokenFrom}/${tokenTo}`,
        error: error?.message || "Failed to create intent",
      }
    );
  };

  return (
    <Card className="w-2xl">
      <CardHeader>
        <CardTitle>Create Intent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="tokenFrom">Token From</Label>
              <Input
                id="tokenFrom"
                name="tokenFrom"
                placeholder="0x123..."
                required
                type="text"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tokenTo">Token To</Label>
              <Input
                id="tokenTo"
                name="tokenTo"
                placeholder="0x123..."
                required
                type="text"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                placeholder="100"
                required
                type="text"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priceThreshold">Price Threshold</Label>
              <Input
                id="priceThreshold"
                name="priceThreshold"
                placeholder="100"
                required
                type="text"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiration">expiration</Label>
              <Input
                id="expiration"
                name="expiration"
                placeholder="2025-01-01T12:00"
                required
                type="datetime-local"
              />
            </div>
            <Button className="w-full" type="submit">
              Create Intent
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
