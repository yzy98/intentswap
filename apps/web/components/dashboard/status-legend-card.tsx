import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StatusLegendCard = () => {
  return (
    <Card className="border-border/70 bg-card/80" variant="glass">
      <CardHeader>
        <CardTitle>Status legend</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge variant="default">Active</Badge>
        <Badge variant="active">Executed</Badge>
        <Badge variant="cancelled">Cancelled</Badge>
        <Badge variant="destructive">Expired</Badge>
      </CardContent>
    </Card>
  );
};
