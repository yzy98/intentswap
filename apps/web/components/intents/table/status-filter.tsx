import type { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IntentStatusType } from "@/hooks/user-intents-query";

interface StatusFilterProps {
  statusFilter: IntentStatusType | undefined;
  setStatusFilter: Dispatch<SetStateAction<IntentStatusType | undefined>>;
}

export function StatusFilter({
  statusFilter,
  setStatusFilter,
}: StatusFilterProps) {
  return (
    <div className="flex items-center py-4">
      <Select
        onValueChange={(value) =>
          setStatusFilter(
            value === "ALL" ? undefined : (value as IntentStatusType)
          )
        }
        value={statusFilter ?? "ALL"}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="EXECUTED">Executed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
