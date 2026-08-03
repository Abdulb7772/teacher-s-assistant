"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, GraduationCap, Percent, Target } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import * as publicService from "@/services/publicService";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import StatCard from "@/components/ui/StatCard";
import GradeBadge from "@/components/ui/GradeBadge";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import Alert from "@/components/ui/Alert";
import Skeleton, { SkeletonRows } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/formatters";
import { percentageOf } from "@/lib/grades";
import type { Quiz } from "@/lib/types";

const QUIZ_COLUMNS: ColumnDef<Quiz>[] = [
  {
    accessorKey: "quizName",
    header: "Quiz Name",
    cell: ({ getValue }) => <span className="font-medium text-white">{String(getValue())}</span>,
  },
  {
    accessorKey: "totalMarks",
    header: "Total Marks",
    cell: ({ getValue }) => <span className="text-white/70">{String(getValue())}</span>,
  },
  {
    accessorKey: "obtainedMarks",
    header: "Obtained Marks",
    cell: ({ getValue }) => <span className="text-white/70">{String(getValue())}</span>,
  },
  {
    accessorKey: "obtainedMarks",
    header: "Percentage",
    cell: ({ row }) => (
      <span className="font-semibold text-gold">
        {percentageOf(row.original.obtainedMarks, row.original.totalMarks)}%
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => <span className="text-white/45">{formatDate(getValue() as string)}</span>,
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ getValue }) => (
      <span className="block max-w-[180px] truncate text-white/45">{String(getValue() ?? "—")}</span>
    ),
  },
];

export default function PublicStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["public-student", id],
    queryFn: () => publicService.getPublicStudent(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-24" />
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <div className="glass rounded-2xl">
          <div className="border-b border-white/10 px-5 py-4">
            <Skeleton className="h-5 w-32" />
          </div>
          <SkeletonRows rows={4} />
        </div>
      </div>
    );
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : ((error as { message?: string } | null)?.message ?? "Failed to load student details.");

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <Alert variant="error">
          <div className="flex w-full flex-col gap-3">
            <span>{errorMessage}</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="self-start">
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const { student, quizzes, stats } = data.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={student.name} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{student.name}</h1>
            {student.class && (
              <div className="mt-2">
                <Badge variant="gold">{student.class}</Badge>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Target} label="Average Marks" value={stats?.average ?? "—"} accent="gold" />
        <StatCard
          icon={Percent}
          label="Percentage"
          value={stats?.percentage ? `${stats.percentage}%` : "—"}
          accent="green"
        />
        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
            <GraduationCap size={20} />
          </span>
          <div>
            <p className="font-display text-2xl font-bold text-white">
              <GradeBadge grade={stats?.grade ?? "—"} />
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/45">Overall Grade</p>
          </div>
        </Card>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-white">Quiz History</h2>
        </div>
        <DataTable
          columns={QUIZ_COLUMNS}
          data={quizzes}
          emptyState={{
            icon: ClipboardList,
            title: "No quizzes recorded",
            description: "This student doesn't have any quiz attempts yet.",
          }}
        />
      </div>

      <Alert variant="info">This is a read-only public view. Sign in to manage student records.</Alert>
    </div>
  );
}
