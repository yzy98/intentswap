import { formatEther, type ReadContractReturnType } from "viem";
import { useReadContract } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { intentFactoryContractSepolia } from "@/lib/contracts";
import type { IntentStatusNumber } from "@/lib/types";
import { getIntentStatusFromEnum, getTokenByAddress } from "@/lib/utils";
import { IntentActionDropdownMenu } from "./action-dropdown-menu";

interface IntentsTableRowProps {
  intentId: bigint;
}

export type Intent = ReadContractReturnType<
  typeof intentFactoryContractSepolia.abi,
  "getIntent",
  readonly [bigint]
>;

interface IntentsTableRowDetailsProps {
  intent: Intent;
  intentId: bigint;
}

export const IntentsTableRow = ({ intentId }: IntentsTableRowProps) => {
  const { data: intent } = useReadContract({
    ...intentFactoryContractSepolia,
    functionName: "getIntent",
    args: [intentId],
  });

  if (!intent) {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      </TableRow>
    );
  }

  return <IntentsTableRowDetails intent={intent} intentId={intentId} />;
};

const IntentsTableRowDetails = ({
  intent,
  intentId,
}: IntentsTableRowDetailsProps) => {
  return (
    <TableRow>
      <TableCell>{getTokenByAddress(intent.tokenFrom)?.symbol}</TableCell>
      <TableCell>{getTokenByAddress(intent.tokenTo)?.symbol}</TableCell>
      <TableCell>{formatEther(intent.amount)}</TableCell>
      <TableCell>{formatEther(intent.priceThreshold)}</TableCell>
      <TableCell>
        {getIntentStatusFromEnum(intent.status as IntentStatusNumber)}
      </TableCell>
      <TableCell className="text-right">
        {new Date(Number(intent.expiration) * 1000).toLocaleString()}
      </TableCell>
      <TableCell>
        <IntentActionDropdownMenu intent={intent} intentId={intentId} />
      </TableCell>
    </TableRow>
  );
};
