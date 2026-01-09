import {
  CalendarClockIcon,
  CircleArrowDownIcon,
  CircleArrowUpIcon,
  CircleDot,
  CoinsIcon,
  KeyIcon,
  type LucideIcon,
  TrendingUpDownIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IntentsTableRow } from "./table-row";

interface Props {
  intentIds: readonly bigint[];
}

export function IntentsTable({ intentIds }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <IntentsTableHead description="Token from" icon={CircleArrowUpIcon} />
          <IntentsTableHead description="Token to" icon={CircleArrowDownIcon} />
          <IntentsTableHead description="Amount" icon={CoinsIcon} />
          <IntentsTableHead
            description="Price threshold"
            icon={TrendingUpDownIcon}
          />
          <IntentsTableHead description="Status" icon={CircleDot} />
          <IntentsTableHead
            className="text-right"
            description="Expiration"
            icon={CalendarClockIcon}
          />
          <IntentsTableHead description="Pool key" icon={KeyIcon} />
          <IntentsTableHead className="w-12" description="Actions" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {intentIds.map((intentId) => (
          <IntentsTableRow intentId={intentId} key={intentId} />
        ))}
      </TableBody>
    </Table>
  );
}

interface IntentsTableHeadProps {
  className?: string;
  icon?: LucideIcon;
  description: string;
}

const IntentsTableHead = ({
  icon,
  description,
  className,
}: IntentsTableHeadProps) => {
  const Icon = icon;

  return (
    <TableHead className={className}>
      {Icon ? (
        <Tooltip>
          <TooltipTrigger>
            <Icon size={18} />
            <span className="sr-only">{description}</span>
          </TooltipTrigger>
          <TooltipContent>{description}</TooltipContent>
        </Tooltip>
      ) : (
        <span className="sr-only">{description}</span>
      )}
    </TableHead>
  );
};
