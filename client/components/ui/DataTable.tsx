"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Highlight from "./Highlight";
import { SkeletonRows } from "./Skeleton";
import EmptyState from "./EmptyState";

export interface EmptyStateConfig {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  highlight?: string;
  emptyState?: EmptyStateConfig;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  manualSorting?: boolean;
}

export default function DataTable<T = unknown>({
  columns,
  data,
  loading = false,
  highlight,
  emptyState = {},
  onRowClick,
  rowClassName,
  sorting,
  onSortingChange,
  manualSorting = true,
}: DataTableProps<T>) {
  const table = useReactTable<T>({
    data,
    columns,
    state: sorting ? { sorting } : undefined,
    onSortingChange: onSortingChange
      ? (updaterOrValue) => {
          const next =
            typeof updaterOrValue === "function" ? updaterOrValue(table.getState().sorting) : updaterOrValue;
          onSortingChange(next);
        }
      : undefined,
    manualSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const meta = header.column.columnDef.meta as { sortable?: boolean } | undefined;
                const sortable = Boolean(meta?.sortable) && Boolean(onSortingChange);
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    className="table-th sticky top-0 z-10 border-b border-white/10 bg-navy-deep/95 backdrop-blur-xl"
                  >
                    {sortable ? (
                      <button
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-gold"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === "asc" ? (
                          <ArrowUp size={13} />
                        ) : sorted === "desc" ? (
                          <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-4">
                <SkeletonRows rows={6} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  title={emptyState.title}
                  description={emptyState.description}
                  icon={emptyState.icon}
                  action={emptyState.action}
                />
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`group border-b border-white/[0.06] transition-colors last:border-0 hover:bg-white/[0.04] ${
                  onRowClick ? "cursor-pointer" : ""
                } ${rowClassName ? rowClassName(row.original) : ""}`}
              >
                {row.getVisibleCells().map((cell) => {
                  const value = cell.getValue();
                  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                  return (
                    <td key={cell.id} className="table-td">
                      {highlight && typeof value === "string" ? (
                        <Highlight text={highlight}>{value}</Highlight>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
