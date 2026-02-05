import { CreateIntentCard } from "@/components/intents/create-intent-card";
import { IntentsCard } from "@/components/intents/intents-card";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <CreateIntentCard />
      <IntentsCard />
    </div>
  );
}
