import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface DataTablePaginationProps {
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  rowCount: number;
}

export const DataTablePagination = ({
  pagination,
  setPagination,
  rowCount,
}: DataTablePaginationProps) => {
  const pageCount = Math.ceil(rowCount / pagination.pageSize);

  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = pagination.pageIndex < pageCount - 1;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm">Rows per page</p>
        <Select
          onValueChange={(value) => {
            setPagination({
              pageIndex: 0,
              pageSize: Number(value),
            });
          }}
          value={`${pagination.pageSize}`}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[5, 10, 15, 20, 25].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-[100px] items-center justify-center font-medium text-sm">
        Page {pagination.pageIndex + 1} of {pageCount}
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="hidden size-8 lg:flex"
          disabled={!canPreviousPage}
          onClick={() => setPagination({ ...pagination, pageIndex: 0 })}
          size="icon"
          variant="outline"
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft />
        </Button>
        <Button
          className="size-8"
          disabled={!canPreviousPage}
          onClick={() =>
            setPagination({
              ...pagination,
              pageIndex: pagination.pageIndex - 1,
            })
          }
          size="icon"
          variant="outline"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Button>
        <Button
          className="size-8"
          disabled={!canNextPage}
          onClick={() =>
            setPagination({
              ...pagination,
              pageIndex: pagination.pageIndex + 1,
            })
          }
          size="icon"
          variant="outline"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Button>
        <Button
          className="hidden size-8 lg:flex"
          disabled={!canNextPage}
          onClick={() =>
            setPagination({
              ...pagination,
              pageIndex: pageCount - 1,
            })
          }
          size="icon"
          variant="outline"
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
};
