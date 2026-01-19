import {
  CalendarClockIcon,
  CircleArrowDownIcon,
  CircleArrowUpIcon,
  CircleDot,
  CoinsIcon,
  type LucideIcon,
  TrendingUpDownIcon,
} from "lucide-react";
import { useState } from "react";
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
import { DataTablePagination, type PaginationState } from "./table-pagination";
import { IntentsTableRow } from "./table-row";

interface Props {
  intentIds: readonly bigint[];
}

export function IntentsTable({ intentIds }: Props) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <IntentsTableHead
                description="Token from"
                icon={CircleArrowUpIcon}
              />
              <IntentsTableHead
                description="Token to"
                icon={CircleArrowDownIcon}
              />
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
              <IntentsTableHead className="w-12" description="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {intentIds
              .slice(
                pagination.pageIndex * pagination.pageSize,
                (pagination.pageIndex + 1) * pagination.pageSize
              )
              .map((intentId) => (
                <IntentsTableRow intentId={intentId} key={intentId} />
              ))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        pagination={pagination}
        rowCount={intentIds.length}
        setPagination={setPagination}
      />
    </div>
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
