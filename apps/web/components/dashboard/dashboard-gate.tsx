"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ArrowRightIcon, ShieldCheckIcon, WalletIcon } from "lucide-react";
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

  return <DashboardContent address={address} />;
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
    <div className="flex min-h-[72svh] items-center justify-center py-6">
      <Card className="relative w-full max-w-2xl border-border/70 bg-card/80 text-center backdrop-blur">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(420px_circle_at_8%_0%,--theme(--color-amber-400/.23),transparent_60%),radial-gradient(500px_circle_at_100%_110%,--theme(--color-blue-500/.2),transparent_64%)]"
        />
        <CardHeader className="space-y-3 pt-7">
          <div className="mx-auto mb-1 inline-flex w-fit items-center gap-1.5 border border-border/80 bg-background/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
            Access Required
          </div>
          <CardTitle className="text-3xl">{title}</CardTitle>
          <CardDescription className="mx-auto max-w-md text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-7">
          <div className="mx-auto grid max-w-lg gap-2 text-left sm:grid-cols-3">
            <Step icon={<WalletIcon className="size-3.5" />} label="Connect" />
            <Step
              icon={<ShieldCheckIcon className="size-3.5" />}
              label="Verify"
            />
            <Step
              icon={<ArrowRightIcon className="size-3.5" />}
              label="Manage"
            />
          </div>
          <div className="flex justify-center">{action}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function Step({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 border border-border/70 bg-background/70 px-2.5 py-2 font-medium text-xs">
      <span className="text-primary">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
