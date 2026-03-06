import { OverviewSection } from "@/components/dashboard/overview-section";
import { QuickTipsCard } from "@/components/dashboard/quick-tips-card";
import { StatusLegendCard } from "@/components/dashboard/status-legend-card";
import { TopSection } from "@/components/dashboard/top-section";
import { IntentsCard } from "@/components/intents/intents-card";

export default function Page() {
  return (
    <div className="space-y-6">
      <TopSection />
      <OverviewSection />

      {/* Main Section */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <IntentsCard />
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <QuickTipsCard />
          <StatusLegendCard />
        </aside>
      </section>
    </div>
  );
}
