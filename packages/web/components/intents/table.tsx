import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IntentsTableRow } from "./table-row";

interface Props {
  intentIds: readonly bigint[];
}

export function IntentsTable({ intentIds }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TokenFrom</TableHead>
          <TableHead>TokenTo</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>PriceThreshold</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Expiration</TableHead>
          <TableHead className="w-12" />
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
