"use client";

import { toast } from "sonner";
import { useWriteContract } from "wagmi";
import { oracleAbi } from "@/abis/oracle";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { SEPOLIA_CONTRACT_ORACLE_ADDRESS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function SetFeedDialog() {
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline">Set Feed</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Set Feed</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Set the feed for a token pair
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <SetFeedForm />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function SetFeedForm({ className }: React.ComponentProps<"form">) {
  const { mutateAsync, error } = useWriteContract();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const tokenA = formData.get("tokenA") as `0x${string}`;
    const tokenB = formData.get("tokenB") as `0x${string}`;
    const feed = formData.get("feed") as `0x${string}`;

    toast.promise(
      mutateAsync({
        abi: oracleAbi,
        address: SEPOLIA_CONTRACT_ORACLE_ADDRESS,
        functionName: "setFeed",
        args: [tokenA, tokenB, feed],
      }),
      {
        loading: "Setting feed...",
        success: `Feed set successfully for token pair: ${tokenA}/${tokenB}`,
        error: error?.message || "Failed to set feed",
      }
    );
  };

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3">
        <Label htmlFor="tokenA">Token A</Label>
        <Input
          id="tokenA"
          name="tokenA"
          placeholder="0x123..."
          required
          type="text"
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="tokenB">Token B</Label>
        <Input
          id="tokenB"
          name="tokenB"
          placeholder="0x123..."
          required
          type="text"
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="feed">Feed</Label>
        <Input
          id="feed"
          name="feed"
          placeholder="0x123..."
          required
          type="text"
        />
      </div>
      <Button type="submit">Set Feed</Button>
    </form>
  );
}
