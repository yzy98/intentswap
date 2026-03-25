import {
  CheckCircle2Icon,
  CircleIcon,
  Clock3Icon,
  Layers3Icon,
  type LucideIcon,
} from "lucide-react";
import { useIntentsCount } from "@/components/dashboard/intents-count-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const OverviewSection = () => {
  const { data, isLoading } = useIntentsCount();

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <OverviewSectionCard
        icon={Layers3Icon}
        isLoading={isLoading}
        title="Total intents"
        tone="neutral"
        value={data?.total ?? 0}
      />
      <OverviewSectionCard
        icon={CircleIcon}
        isLoading={isLoading}
        title="Active"
        tone="active"
        value={data?.active ?? 0}
      />
      <OverviewSectionCard
        icon={CheckCircle2Icon}
        isLoading={isLoading}
        title="Executed"
        tone="executed"
        value={data?.executed ?? 0}
      />
      <OverviewSectionCard
        icon={Clock3Icon}
        isLoading={isLoading}
        title="Cancelled"
        tone="cancelled"
        value={data?.cancelled ?? 0}
      />
      {/* [TODO] Add bot auto-execution count */}
      {/* <OverviewSectionCard
        isLoading={isLoadingBotAutoExecutionCount}
        title="Bot Auto-Execution"
        value={botAutoExecutionCount ?? 0}
      /> */}
    </section>
  );
};

const OverviewSectionCard = ({
  icon,
  title,
  value,
  isLoading,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  value: number;
  isLoading: boolean;
  tone: "neutral" | "active" | "executed" | "cancelled";
}) => {
  const Icon = icon;
  const toneClassMap = {
    neutral: "text-foreground/70",
    active: "text-primary",
    executed: "text-green-500 dark:text-green-700",
    cancelled: "text-amber-600 dark:text-amber-300",
  } as const;

  return (
    <Card className="border-border/70 bg-card/75" size="sm" variant="glass">
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground text-xs">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mt-2 flex items-center gap-1.5">
          <Icon className={cn("size-3.5", toneClassMap[tone])} />
          <div className="font-semibold text-lg tabular-nums">
            {isLoading ? <Skeleton className="h-6 w-16" /> : value}
          </div>
        </div>
        <div className="mt-1 h-px w-full bg-linear-to-r from-border to-transparent" />
        <div className="pt-1 text-[10px] uppercase tracking-[0.16em] opacity-70">
          Live Metric
        </div>
      </CardContent>
    </Card>
  );
};
