"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PlusIcon } from "lucide-react";
import { useConnection } from "wagmi";
import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateIntentDialog } from "./create-intent-dialog";
import { IntentsTable } from "./table";

export function IntentsCard() {
  const { intentIds, isLoadingIntentIds } = useIntentIds();
  const { address } = useConnection();
  const { openConnectModal } = useConnectModal();

  return (
    <Card className="w-full" variant="glass">
      <CardHeader>
        <CardTitle>My Intents</CardTitle>
        {address && (
          <CardAction>
            <CreateIntentDialog
              triggerButton={
                <Button>
                  <PlusIcon />
                </Button>
              }
            />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {address ? (
          <IntentsTable
            intentIds={intentIds ?? []}
            isLoadingIntentIds={isLoadingIntentIds}
          />
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Button
              className="px-0"
              onClick={openConnectModal}
              type="button"
              variant="link"
            >
              Connect
            </Button>{" "}
            your wallet to view intents.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
