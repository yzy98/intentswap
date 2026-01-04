"use client";

import { useConnection, useReadContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { intentFactoryContractSepolia } from "@/lib/contracts";
import { IntentsTable } from "./table";

export function Intents() {
  const { address } = useConnection();

  const { data: intentIds } = useReadContract({
    ...intentFactoryContractSepolia,
    functionName: "getUserIntentIds",
    args: [address as `0x${string}`],
  });

  return (
    <Card className="w-2xl">
      <CardHeader>
        <CardTitle>My Intents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {address && (
          <div className="flex flex-col gap-4">
            {intentIds && intentIds.length > 0 ? (
              <IntentsTable intentIds={intentIds} />
            ) : (
              <div className="text-center">No intents found</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
