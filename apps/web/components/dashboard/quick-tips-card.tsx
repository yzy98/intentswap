import { BotIcon, CalendarClockIcon, CoinsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
} from "@/components/ui/item";

const quickTips = [
  {
    icon: BotIcon,
    description: "Use Bot Auto-Exec to automatically execute intents.",
  },
  {
    icon: CalendarClockIcon,
    description: "Set expiration to reduce stale intents.",
  },
  {
    icon: CoinsIcon,
    description: "Ensure allowance & balance to be executable.",
  },
];

export const QuickTipsCard = () => {
  return (
    <Card className="border-border/70 bg-card/80" variant="glass">
      <CardHeader>
        <CardTitle>Quick tips</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        <ItemGroup className="gap-1">
          {quickTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <Item
                className="border border-border/60 bg-background/60 px-2 py-1"
                key={tip.description}
              >
                <ItemMedia variant="icon">
                  <Icon />
                </ItemMedia>
                <ItemContent>
                  <ItemDescription>{tip.description}</ItemDescription>
                </ItemContent>
              </Item>
            );
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  );
};
