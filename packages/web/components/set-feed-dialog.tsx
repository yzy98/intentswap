"use client";

import { toast } from "sonner";
import type { Address } from "viem";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { oracleContractSepolia } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
    const tokenA = formData.get("tokenA") as Address;
    const tokenB = formData.get("tokenB") as Address;
    const feed = formData.get("feed") as Address;

    toast.promise(
      mutateAsync({
        ...oracleContractSepolia,
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
