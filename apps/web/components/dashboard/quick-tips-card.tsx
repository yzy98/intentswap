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
    <Card className="lg:h-full lg:flex-1" variant="glass">
      <CardHeader>
        <CardTitle>Quick tips</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        <ItemGroup className="gap-0">
          {quickTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <Item key={tip.description}>
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
