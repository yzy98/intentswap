"use client";

import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntentsTable } from "./table";

export function Intents() {
  const { intentIds } = useIntentIds();

  return (
    <Card className="w-2xl">
      <CardHeader>
        <CardTitle>My Intents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-col gap-4">
          {intentIds && intentIds.length > 0 ? (
            <IntentsTable intentIds={intentIds} />
          ) : (
            <div className="text-center">No intents found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
