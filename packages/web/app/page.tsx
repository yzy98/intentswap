import { CreateIntentCard } from "@/components/create-intent-card";
import { Intents } from "@/components/intents";
import { OracleCard } from "@/components/oracle-card";

export default function Page() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <OracleCard />
      <CreateIntentCard />
      <Intents />
    </div>
  );
}
