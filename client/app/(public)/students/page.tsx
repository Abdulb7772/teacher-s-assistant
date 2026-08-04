"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import * as publicService from "@/services/publicService";
import usePaginatedQuery from "@/hooks/usePaginatedQuery";
import PageHeader from "@/components/ui/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import DataTable from "@/components/ui/DataTable";
import Avatar from "@/components/ui/Avatar";
import GradeBadge from "@/components/ui/GradeBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import Alert from "@/components/ui/Alert";
import type { StudentPerformance } from "@/types";
import { useClassesQuery } from "@/features/meta/useMetaQueries";

export default function StudentsPage() {
  const router = useRouter();

  const classesQuery = useClassesQuery();

  const classOptions = useMemo(
    () => [
      { value: "", label: "All Classes" },
      ...(classesQuery.data?.data ?? []).map((c) => ({ value: c.name, label: c.name })),
    ],
    [classesQuery.data]
  );

  const { data, pagination, loading, error, params, setFilter, refresh, searchInput, setSearchInput } =
    usePaginatedQuery<StudentPerformance>(["public-students"], publicService.getPublicStudents, {
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

  const columns = useMemo<ColumnDef<StudentPerformance>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Student",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.name} size="sm" />
            <div>
              <p className="font-medium text-white">{highlight(row.original.name)}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "class",
        header: "Class",
        cell: ({ getValue }) => <span className="text-white/70">{String(getValue() ?? "—")}</span>,
      },
      {
        accessorKey: "quizCount",
        header: "Quizzes",
        cell: ({ getValue }) => <span className="font-semibold text-white/80">{String(getValue())}</span>,
      },
      {
        accessorKey: "average",
        header: "Average",
        cell: ({ getValue }) => <span className="text-white/70">{String(getValue())}</span>,
      },
      {
        accessorKey: "percentage",
        header: "Percentage",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-gold">{row.original.percentage}%</p>
            <div className="mt-1.5 w-20">
              <ProgressBar value={row.original.percentage} />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "grade",
        header: "Grade",
        cell: ({ getValue }) => <GradeBadge grade={String(getValue())} />,
      },
    ],
    [highlight]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Student Marks"
        subtitle="Browse student quiz performance — read only"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Student Marks" }]}
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
          placeholder="Search students..."
          className="w-full sm:w-64 xl:w-64"
        />
        <Select
          aria-label="Filter by class"
          options={classOptions}
          value={String(params.class ?? "")}
          onChange={(e) => setFilter("class", e.target.value)}
          className="w-full sm:w-44 xl:w-44"
        />
      </div>

      <div className="glass rounded-2xl p-2">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          onRowClick={(row) => router.push(`/students/${row._id}`)}
          emptyState={{
            icon: SearchX,
            title: "No students found",
            description: "Try adjusting your filters",
          }}
        />
      </div>

      {/* ponytail: hook's setFilter forces page:1, so page buttons refetch page 1 until setPage is added to usePaginatedQuery */}
      <Pagination pagination={pagination} onPageChange={(page) => setFilter("page", page)} />
    </div>
  );
}
