"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock, SearchX } from "lucide-react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import * as publicService from "@/services/publicService";
import usePaginatedQuery from "@/hooks/usePaginatedQuery";
import useKeyShortcut from "@/hooks/useKeyShortcut";
import PageHeader from "@/components/ui/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import Alert from "@/components/ui/Alert";
import { MONTH_OPTIONS, WEEK_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/formatters";
import type { Course } from "@/types";
import { useSubjectsQuery, useClassesQuery } from "@/features/meta/useMetaQueries";

export default function CourseOutlinePage() {
  const searchRef = useRef<HTMLInputElement>(null);
  useKeyShortcut("/", () => searchRef.current?.focus());

  const [sorting, setSorting] = useState<SortingState>([]);

  const subjectsQuery = useSubjectsQuery();
  const classesQuery = useClassesQuery();

  const subjectOptions = useMemo(
    () => [
      { value: "", label: "All Subjects" },
      ...(subjectsQuery.data?.data ?? []).map((s) => ({ value: s.name, label: s.name })),
    ],
    [subjectsQuery.data]
  );
   const classOptions = useMemo(
    () => [
      { value: "", label: "All Classes" },
      ...(classesQuery.data?.data ?? []).map((s) => ({ value: s.name, label: s.name })),
    ],
    [classesQuery.data]
  );

  const { data, pagination, loading, error, params, setFilter, refresh, searchInput, setSearchInput } =
    usePaginatedQuery<Course>(["public-outline"], publicService.getPublicCourseOutline, {
      initialParams: { page: 1, limit: 10 },
    });

  const highlight = useCallback(
    (text: string): React.ReactNode =>
      searchInput && text.toLowerCase().includes(searchInput.toLowerCase()) ? (
        <mark className="rounded bg-gold/30 px-0.5 text-gold-light">{text}</mark>
      ) : (
        text
      ),
    [searchInput]
  );

  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      {
        accessorKey: "lectureNumber",
        header: "Lecture",
        meta: { sortable: true },
        cell: ({ getValue }) => <span className="font-semibold text-white/80">#{String(getValue())}</span>,
      },
      {
        accessorKey: "title",
        header: "Topic",
        cell: ({ row, getValue }) => (
          <div className="max-w-xs">
            <p className="truncate font-medium text-white">{highlight(String(getValue()))}</p>
            <p className="truncate text-xs text-white/40">{row.original.description}</p>
          </div>
        ),
      },
      {
        id: "subjectClass",
        header: "Subject / Class",
        cell: ({ row }) => (
          <span className="text-white/70">
            {[row.original.subject, row.original.class].filter(Boolean).join(" · ") || "—"}
          </span>
        ),
      },
      { accessorKey: "month", header: "Month", meta: { sortable: true } },
      {
        accessorKey: "week",
        header: "Week",
        meta: { sortable: true },
        cell: ({ getValue }) => <span className="text-white/70">Week {String(getValue())}</span>,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ getValue }) => <span className="text-white/70">{String(getValue())}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) =>
          getValue() === "completed" ? (
            <Badge variant="success">
              <CheckCircle2 size={12} /> Completed
            </Badge>
          ) : (
            <Badge variant="neutral">
              <Clock size={12} /> Pending
            </Badge>
          ),
      },
      {
        accessorKey: "completionDate",
        header: "Completion Date",
        cell: ({ getValue }) => (
          <span className="text-white/45">{formatDate(getValue() as string | null)}</span>
        ),
      },
    ],
    [highlight]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Course Outline"
        subtitle="Read-only view — sign in to manage"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Course Outline" }]}
      />

      {error && (
        <Alert variant="error" className="mb-4">
          <div className="flex w-full items-center justify-between gap-4">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3 xl:flex-nowrap">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search topics..."
          shortcut="/"
          className="w-full sm:w-64 xl:w-64"
          inputRef={searchRef}
        />
        <Select
          aria-label="Filter by subject"
          options={subjectOptions}
          value={String(params.subject ?? "")}
          onChange={(e) => setFilter("subject", e.target.value)}
          className="w-full sm:w-40 xl:w-40"
        />
        <Select
          aria-label="Filter by class"
          options={classOptions}
          value={String(params.class ?? "")}
          onChange={(e) => setFilter("class", e.target.value)}
          className="w-full sm:w-40 xl:w-40"
        />
        <Select
          aria-label="Filter by month"
          options={MONTH_OPTIONS}
          value={String(params.month ?? "")}
          onChange={(e) => setFilter("month", e.target.value)}
          className="w-full sm:w-40 xl:w-40"
        />
        <Select
          aria-label="Filter by week"
          options={WEEK_OPTIONS}
          value={String(params.week ?? "")}
          onChange={(e) => setFilter("week", e.target.value)}
          className="w-full sm:w-40 xl:w-40"
        />
        <Select
          aria-label="Filter by status"
          options={STATUS_OPTIONS}
          value={String(params.status ?? "")}
          onChange={(e) => setFilter("status", e.target.value)}
          className="w-full sm:w-40 xl:w-40"
        />
      </div>

      <div className="glass rounded-2xl p-2">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          sorting={sorting}
          onSortingChange={setSorting}
          manualSorting={false}
          emptyState={{
            icon: SearchX,
            title: "No topics found",
            description: "Try adjusting your filters",
          }}
        />
      </div>

      {/* ponytail: hook's setFilter forces page:1, so page buttons refetch page 1 until setPage is added to usePaginatedQuery */}
      <Pagination pagination={pagination} onPageChange={(page) => setFilter("page", page)} />
    </div>
  );
}
