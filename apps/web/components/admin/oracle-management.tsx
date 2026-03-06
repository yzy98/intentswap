import { QueryPriceCard } from "./query-price-card";
import { SetFeedCard } from "./set-feed-card";

export const OracleManagement = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SetFeedCard />
      <QueryPriceCard />
    </div>
  );
};
