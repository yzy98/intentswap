"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateIntentDialog } from "./create-intent-dialog";
import { useIntentsData } from "./intents-data-provider";
import { IntentsTable } from "./table";

export function IntentsCard() {
  const { refetch } = useIntentsData();

  return (
    <Card className="w-full" variant="glass">
      <CardHeader>
        <CardTitle>My Intents</CardTitle>
        <CardAction>
          <CreateIntentDialog
            onIndexed={refetch}
            triggerButton={
              <Button>
                <PlusIcon />
              </Button>
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <IntentsTable />
      </CardContent>
    </Card>
  );
}
