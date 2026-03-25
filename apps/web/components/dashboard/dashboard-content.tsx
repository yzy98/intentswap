import type { Address } from "viem";
import { IntentsCountProvider } from "@/components/dashboard/intents-count-provider";
import { OverviewSection } from "@/components/dashboard/overview-section";
import { QuickTipsCard } from "@/components/dashboard/quick-tips-card";
import { StatusLegendCard } from "@/components/dashboard/status-legend-card";
import { TopSection } from "@/components/dashboard/top-section";
import { IntentsCard } from "@/components/intents/intents-card";
import { IntentsDataProvider } from "@/components/intents/intents-data-provider";

interface DashboardContentProps {
  address: Address;
}

export function DashboardContent({ address }: DashboardContentProps) {
  return (
    <IntentsCountProvider address={address}>
      <div className="space-y-5 sm:space-y-6">
        <TopSection address={address} />
        <OverviewSection />

        {/* Main Section */}
        <section className="grid gap-4 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <IntentsDataProvider address={address}>
              <IntentsCard />
            </IntentsDataProvider>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:col-span-4 lg:self-start">
            <QuickTipsCard />
            <StatusLegendCard />
          </aside>
        </section>
      </div>
    </IntentsCountProvider>
  );
}
