"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnection } from "wagmi";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardGate() {
  const { address } = useConnection();
  const { openConnectModal } = useConnectModal();
  const { isAuthenticated, isAuthenticating, signIn } = useAuth();

  if (!address) {
    return (
      <GateCard
        action={<Button onClick={openConnectModal}>Connect Wallet</Button>}
        description="Connect a wallet to access your IntentSwap dashboard."
        title="Connect your wallet"
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <GateCard
        action={
          <Button disabled={isAuthenticating} onClick={signIn}>
            {isAuthenticating ? "Signing in..." : "Sign In"}
          </Button>
        }
        description="Sign a SIWE message to access your intents and dashboard data."
        title="Sign in with Ethereum"
      />
    );
  }

  return <DashboardContent />;
}

function GateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">{action}</CardContent>
      </Card>
    </div>
  );
}
