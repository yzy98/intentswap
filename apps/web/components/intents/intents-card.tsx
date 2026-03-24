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
  const { refetchFresh } = useIntentsData();

  return (
    <Card className="w-full gap-0" variant="glass">
      <CardHeader>
        <CardTitle>My Intents</CardTitle>
        <CardAction>
          <CreateIntentDialog
            onIndexed={refetchFresh}
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
