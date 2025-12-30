"use client";

import { useConnection, useReadContract } from "wagmi";
import { intentFactoryAbi } from "@/abis/intentFactory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEPOLIA_CONTRACT_INTENT_FACTORY_ADDRESS } from "@/lib/constants";
import { IntentDetail } from "./intent-detail";

export function GetIntentsCard() {
  const { address } = useConnection();

  const { data: intentIds } = useReadContract({
    abi: intentFactoryAbi,
    address: SEPOLIA_CONTRACT_INTENT_FACTORY_ADDRESS,
    functionName: "getUserIntentIds",
    args: [address as `0x${string}`],
  });

  return (
    <Card className="w-2xl">
      <CardHeader>
        <CardTitle>Get Intents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {address && (
          <div className="flex flex-col gap-4">
            <span>Address: {address}</span>
            {intentIds?.map((id) => (
              <IntentDetail intentId={id} key={id.toString()} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
