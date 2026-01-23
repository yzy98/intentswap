"use client";

import { useConnection } from "wagmi";
import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntentsTable } from "./table";

export function IntentsCard() {
  const { intentIds, isLoadingIntentIds } = useIntentIds();
  const { address } = useConnection();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My Intents</CardTitle>
      </CardHeader>
      <CardContent>
        {address ? (
          <IntentsTable
            intentIds={intentIds ?? []}
            isLoadingIntentIds={isLoadingIntentIds}
          />
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Connect your wallet to view intents.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
