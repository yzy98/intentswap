"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import { CreateIntentDialog } from "../create-intent-dialog";
import { useIntentsData } from "../intents-data-provider";
import { DataTablePagination } from "./data-table-pagination";
import { StatusFilter } from "./status-filter";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const {
    totalRowCount,
    pagination,
    setPagination,
    refetch,
    isLoading,
    statusFilter,
    setStatusFilter,
  } = useIntentsData();

  const table = useReactTable({
    data,
    columns,
    rowCount: totalRowCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    meta: {
      refetchPage: refetch,
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
                      onIndexed={refetch}
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
