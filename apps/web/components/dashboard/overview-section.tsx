import { useIntentsCount } from "@/components/dashboard/intents-count-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const OverviewSection = () => {
  const { data, isFetching: isLoading } = useIntentsCount();

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <OverviewSectionCard
        isLoading={isLoading}
        title="Total intents"
        value={data?.total ?? 0}
      />
      <OverviewSectionCard
        isLoading={isLoading}
        title="Active"
        value={data?.active ?? 0}
      />
      <OverviewSectionCard
        isLoading={isLoading}
        title="Executed"
        value={data?.executed ?? 0}
      />
      <OverviewSectionCard
        isLoading={isLoading}
        title="Cancelled"
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
