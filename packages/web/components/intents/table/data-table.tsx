"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IntentStatusType } from "@/hooks/user-intents-query";
import { CreateIntentDialog } from "../create-intent-dialog";
import { DataTablePagination } from "./data-table-pagination";
import { StatusFilter } from "./status-filter";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount: number;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  statusFilter: IntentStatusType | undefined;
  setStatusFilter: Dispatch<SetStateAction<IntentStatusType | undefined>>;
  isLoading?: boolean;
  refetchPage: () => Promise<unknown>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
  pagination,
  setPagination,
  statusFilter,
  setStatusFilter,
  isLoading = false,
  refetchPage,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    rowCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    meta: {
      refetchPage,
    },
  });

  return (
    <div>
      <StatusFilter
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              if (isLoading) {
                return (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center"
                      colSpan={columns.length}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Spinner />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }

              const rows = table.getRowModel().rows;
              if (rows?.length) {
                return rows.map((row) => (
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ));
              }

              return (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={columns.length}
                  >
                    No intents found.{" "}
                    <CreateIntentDialog
                      triggerButton={
                        <Button className="px-0" variant="link">
                          Create
                        </Button>
                      }
                    />{" "}
                    your first intent.
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
