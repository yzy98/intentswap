"use client";

import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBotSubscriptionCount } from "@/lib/api/bot";

export const OverviewSection = () => {
  const chainId = useChainId();
  const { intentIds, isLoadingIntentIds } = useIntentIds();

  const {
    data: botAutoExecutionCount,
    isLoading: isLoadingBotAutoExecutionCount,
  } = useQuery({
    queryKey: ["bot-subscription-count", intentIds?.length, chainId],
    queryFn: () => fetchBotSubscriptionCount(intentIds ?? [], chainId),
    enabled: !!intentIds && intentIds.length > 0,
  });

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <OverviewSectionCard
        isLoading={isLoadingIntentIds || intentIds === undefined}
        title="Total intents"
        value={intentIds?.length ?? 0}
      />
      <OverviewSectionCard
        isLoading={isLoadingBotAutoExecutionCount}
        title="Bot Auto-Execution"
        value={botAutoExecutionCount ?? 0}
      />
    </section>
  );
};

const OverviewSectionCard = ({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: number;
  isLoading: boolean;
}) => {
  return (
    <Card size="sm" variant="glass">
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground text-xs">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mt-2 font-semibold text-lg tabular-nums">
          {isLoading ? <Skeleton className="h-6 w-16" /> : value}
        </div>
      </CardContent>
    </Card>
  );
};
