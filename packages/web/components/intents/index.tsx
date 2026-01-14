"use client";

import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntentsTable } from "./table";

export function Intents() {
  const { intentIds } = useIntentIds();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My Intents</CardTitle>
      </CardHeader>
      <CardContent>
        {intentIds && intentIds.length > 0 ? (
          <IntentsTable intentIds={intentIds} />
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No intents found. Create your first intent above.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
