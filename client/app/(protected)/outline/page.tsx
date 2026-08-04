"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { Check, CheckCircle2, Clock, FileDown, Pencil, Plus, RotateCcw, SearchX, Trash2, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import FAB from "@/components/ui/FAB";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import useKeyShortcut from "@/hooks/useKeyShortcut";
import usePaginatedQuery from "@/hooks/usePaginatedQuery";
import { MONTH_OPTIONS, STATUS_OPTIONS, WEEK_OPTIONS } from "@/lib/constants";
import { exportPDF, type ExportColumn } from "@/lib/exportUtils";
import { formatDate } from "@/lib/formatters";
import type { Course, CourseStatus } from "@/types";
import * as courseService from "@/services/courseService";
import type { CoursePayload } from "@/services/courseService";
import { useSubjectsQuery, useClassesQuery } from "@/features/meta/useMetaQueries";
import {
  outlineFormSchema,
  MONTH_FORM_OPTIONS,
  WEEK_FORM_OPTIONS,
  type OutlineFormValues,
} from "@/features/course-outline/schema";

const EXPORT_COLUMNS: ExportColumn<Course>[] = [
  { header: "Lecture", accessor: (r) => r.lectureNumber },
  { header: "Subject", accessor: (r) => r.subject ?? "" },
  { header: "Class", accessor: (r) => r.class ?? "" },
  { header: "Topic", accessor: (r) => r.title },
  { header: "Month", accessor: (r) => r.month },
  { header: "Week", accessor: (r) => `Week ${r.week}` },
  { header: "Status", accessor: (r) => r.status },
  { header: "Completion Date", accessor: (r) => (r.completionDate ? formatDate(r.completionDate) : "") },
  { header: "Duration", accessor: (r) => r.duration },
];

export default function OutlinePage() {
  const { data, pagination, loading, params, setFilter, refresh, searchInput, setSearchInput, search } =
    usePaginatedQuery<Course>(["courses"], courseService.getCourses, {
      initialParams: { page: 1, limit: 10, sortBy: "lectureNumber", sortOrder: "asc" },
    });

  const [sorting, setSorting] = useState<SortingState>([{ id: "lectureNumber", desc: false }]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const searchRef = useRef<HTMLInputElement>(null);

  const subjectsQuery = useSubjectsQuery();
  const classesQuery = useClassesQuery();

  const subjectOptions = useMemo(
    () => [{ value: "", label: "All Subjects" }, ...(subjectsQuery.data?.data ?? []).map((s) => ({ value: s.name, label: s.name }))],
    [subjectsQuery.data]
  );
  const subjectFormOptions = useMemo(
    () => (subjectsQuery.data?.data ?? []).map((s) => ({ value: s.name, label: s.name })),
    [subjectsQuery.data]
  );
  const classOptions = useMemo(
    () => [{ value: "", label: "All Classes" }, ...(classesQuery.data?.data ?? []).map((c) => ({ value: c.name, label: c.name }))],
    [classesQuery.data]
  );
  const classFormOptions = useMemo(
    () => (classesQuery.data?.data ?? []).map((c) => ({ value: c.name, label: c.name })),
    [classesQuery.data]
  );

  const form = useForm<OutlineFormValues>({
    resolver: zodResolver(outlineFormSchema),
    defaultValues: {
      subject: "",
      className: "",
      month: "January",
      week: "1",
      lectureNumber: "",
      title: "",
      description: "",
      duration: "",
      notes: "",
    },
  });

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setOutcomes([""]);
    form.reset();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (course: Course) => {
      setEditing(course);
      setOutcomes(course.learningOutcomes.length ? [...course.learningOutcomes] : [""]);
      form.reset({
        subject: course.subject ?? "",
        className: course.class ?? "",
        month: course.month,
        week: String(course.week),
        lectureNumber: String(course.lectureNumber),
        title: course.title,
        description: course.description,
        duration: course.duration,
        notes: course.notes,
      });
      setModalOpen(true);
    },
    [form]
  );

  useKeyShortcut("n", openCreate);
  useKeyShortcut("/", () => searchRef.current?.focus());

  const handleSortingChange = (next: SortingState): void => {
    setSorting(next);
    const col = next[0];
    setFilter("sortBy", col?.id ?? "lectureNumber");
    setFilter("sortOrder", col?.desc ? "desc" : "asc");
  };

  const updateOutcome = (index: number, value: string): void => {
    setOutcomes((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const removeOutcome = (index: number): void => {
    setOutcomes((prev) => prev.filter((_, i) => i !== index));
  };

  const createMutation = useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => {
      toast.success("Topic created");
      closeModal();
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CoursePayload }) => courseService.updateCourse(id, payload),
    onSuccess: () => {
      toast.success("Topic updated");
      closeModal();
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CourseStatus }) => courseService.updateCourseStatus(id, status),
    onSuccess: (_res, vars) => {
      toast.success(vars.status === "completed" ? "Topic marked as completed" : "Topic reverted to pending");
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      toast.success("Topic deleted");
      setDeleting(null);
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const [exporting, setExporting] = useState(false);

  // Exports ALL topics matching the current filters (subject/class/month/week/status/search), not just the visible page.
  const exportAllPDF = useCallback(async (): Promise<void> => {
    setExporting(true);
    try {
      const res = await courseService.getCourses({
        page: 1,
        limit: 1000,
        search,
        subject: params.subject as string,
        class: params.class as string,
        month: params.month as string,
        week: params.week as string,
        status: params.status as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc",
      });
      await exportPDF("Course Outline", EXPORT_COLUMNS, res.data, "course-outline");
    } catch (err) {
      toast.error((err as { message?: string })?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  }, [search, params.subject, params.class, params.month, params.week, params.status, params.sortBy, params.sortOrder]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: CoursePayload = {
      subject: values.subject,
      class: values.className,
      month: values.month,
      week: Number(values.week),
      lectureNumber: Number(values.lectureNumber),
      title: values.title.trim(),
      description: values.description.trim(),
      duration: values.duration.trim(),
      notes: values.notes.trim(),
      learningOutcomes: outcomes.map((o) => o.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch {
      /* toast shown by mutation onError */
    }
  });

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "lectureNumber",
      header: "Lecture",
      meta: { sortable: true },
      cell: (info) => (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-xs font-bold text-gold">
          {info.row.original.lectureNumber}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Topic",
      cell: (info) => (
        <div className="min-w-0">
          <p className="font-medium text-white">{info.row.original.title}</p>
          {info.row.original.description && (
            <p className="mt-0.5 max-w-xs truncate text-xs text-white/40">{info.row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      id: "subjectClass",
      header: "Subject / Class",
      cell: (info) => {
        const { subject, class: cls } = info.row.original;
        return <span className="text-white/70">{[subject, cls].filter(Boolean).join(" · ") || "—"}</span>;
      },
    },
    { accessorKey: "month", header: "Month", meta: { sortable: true } },
    {
      accessorKey: "week",
      header: "Week",
      meta: { sortable: true },
      cell: (info) => `Week ${info.row.original.week}`,
    },
    { accessorKey: "duration", header: "Duration" },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const row = info.row.original;
        const completed = row.status === "completed";
        return (
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 py-1 ${completed ? "text-success" : "text-white/60"}`}
            onClick={() => statusMutation.mutate({ id: row._id, status: completed ? "pending" : "completed" })}
            title={completed ? "Click to revert to pending" : "Click to mark as completed"}
            loading={statusMutation.isPending && statusMutation.variables?.id === row._id}
          >
            {completed ? (
              <Badge variant="success">
                <CheckCircle2 size={12} /> Completed
              </Badge>
            ) : (
              <Badge variant="neutral">
                <Clock size={12} /> Pending
              </Badge>
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "completionDate",
      header: "Completion Date",
      cell: (info) => formatDate(info.row.original.completionDate),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-1">
            {row.status === "pending" ? (
              <Button
                variant="ghost"
                size="sm"
                icon={Check}
                onClick={() => statusMutation.mutate({ id: row._id, status: "completed" })}
                title="Mark as completed"
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={() => statusMutation.mutate({ id: row._id, status: "pending" })}
                title="Revert to pending"
              />
            )}
            <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(row)} title="Edit topic" />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => setDeleting(row)}
              className="text-red-400 hover:bg-danger/15"
              title="Delete topic"
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Course Outline"
        subtitle="Plan your semester, topic by topic"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Course Outline" }]}
        actions={
          <Button
            variant="outline"
            icon={FileDown}
            onClick={exportAllPDF}
            loading={exporting}
            title="Download all topics matching the current filters"
          >
            Export PDF
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 xl:flex-nowrap">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search topics..."
          shortcut="/"
          inputRef={searchRef}
          className="w-full lg:w-64 xl:w-64"
        />
        <Select
          options={subjectOptions}
          value={String(params.subject ?? "")}
          onChange={(e) => setFilter("subject", e.target.value)}
          className="w-full lg:w-44 xl:w-44"
        />
        <Select
          options={classOptions}
          value={String(params.class ?? "")}
          onChange={(e) => setFilter("class", e.target.value)}
          className="w-full lg:w-40 xl:w-40"
        />
        <Select
          options={MONTH_OPTIONS}
          value={String(params.month ?? "")}
          onChange={(e) => setFilter("month", e.target.value)}
          className="w-full lg:w-40 xl:w-40"
        />
        <Select
          options={WEEK_OPTIONS}
          value={String(params.week ?? "")}
          onChange={(e) => setFilter("week", e.target.value)}
          className="w-full lg:w-44 xl:w-44"
        />
        <Select
          options={STATUS_OPTIONS}
          value={String(params.status ?? "")}
          onChange={(e) => setFilter("status", e.target.value)}
          className="w-full lg:w-44 xl:w-44"
        />
      </div>

      <Card className="p-0">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          highlight={searchInput || undefined}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          emptyState={{
            icon: SearchX,
            title: "No topics found",
            description: "Try adjusting your filters or add a new topic.",
          }}
          rowClassName={(row) =>
            row.status === "completed"
              ? "bg-success/[0.04] border-l-2 border-l-success"
              : "opacity-90"
          }
        />
        <div className="border-t border-white/10 px-4">
          <Pagination pagination={pagination} onPageChange={(page) => setFilter("page", page)} />
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Topic" : "New Topic"}
        subtitle={editing ? "Update the topic details below" : "Add a topic to your semester outline"}
        size="lg"
      >
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Subject"
              options={subjectFormOptions}
              error={form.formState.errors.subject?.message}
              {...form.register("subject")}
            />
            <Select
              label="Class"
              options={classFormOptions}
              error={form.formState.errors.className?.message}
              {...form.register("className")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Month"
              options={MONTH_FORM_OPTIONS}
              error={form.formState.errors.month?.message}
              {...form.register("month")}
            />
            <Select
              label="Week"
              options={WEEK_FORM_OPTIONS}
              error={form.formState.errors.week?.message}
              {...form.register("week")}
            />
            <Input
              label="Lecture Number"
              type="number"
              min={1}
              placeholder="1"
              error={form.formState.errors.lectureNumber?.message}
              {...form.register("lectureNumber")}
            />
          </div>
          <Input
            label="Topic Title"
            placeholder="e.g. Introduction to Data Structures"
            error={form.formState.errors.title?.message}
            {...form.register("title")}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the topic"
            rows={3}
            error={form.formState.errors.description?.message}
            {...form.register("description")}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Duration"
              placeholder="e.g. 2 hours"
              error={form.formState.errors.duration?.message}
              {...form.register("duration")}
            />
            <Textarea
              label="Notes"
              placeholder="Preparation notes (optional)"
              rows={2}
              error={form.formState.errors.notes?.message}
              {...form.register("notes")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Learning Outcomes
            </label>
            <div className="space-y-2">
              {outcomes.map((outcome, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => updateOutcome(i, e.target.value)}
                    placeholder={`Outcome ${i + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => removeOutcome(i)}
                    className="h-9 w-9 shrink-0 px-0"
                    aria-label={`Remove outcome ${i + 1}`}
                  />
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => setOutcomes([...outcomes, ""])} className="mt-2 text-gold">
              Add outcome
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save Changes" : "Create Topic"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        title="Delete topic"
        message={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
        loading={deleteMutation.isPending}
      />

      <FAB icon={Plus} label="New Topic" onClick={openCreate} shortcut="n" />
    </>
  );
}
