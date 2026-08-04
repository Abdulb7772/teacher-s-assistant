"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import FAB from "@/components/ui/FAB";
import GradeBadge from "@/components/ui/GradeBadge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import ProgressBar from "@/components/ui/ProgressBar";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import useKeyShortcut from "@/hooks/useKeyShortcut";
import usePaginatedQuery from "@/hooks/usePaginatedQuery";
import type { StudentPerformance } from "@/types";
import * as studentService from "@/services/studentService";
import type { StudentPayload } from "@/services/studentService";
import { useClassesQuery, useSubjectsQuery } from "@/features/meta/useMetaQueries";
import { studentFormSchema, type StudentFormValues } from "@/features/forms/schemas";

export default function ManageStudentsPage() {
  const { data, pagination, loading, params, setFilter, refresh, searchInput, setSearchInput } =
    usePaginatedQuery<StudentPerformance>(["students"], studentService.getStudents, {
      initialParams: { page: 1, limit: 10 },
    });

  const classesQuery = useClassesQuery();
  const subjectsQuery = useSubjectsQuery();

  const classOptions = useMemo(
    () => [
      { value: "", label: "All Classes" },
      ...(classesQuery.data?.data ?? []).map((c) => ({ value: c.name, label: c.name })),
    ],
    [classesQuery.data]
  );
  const subjectOptions = useMemo(
    () => [
      { value: "", label: "All Subjects" },
      ...(subjectsQuery.data?.data ?? []).map((s) => ({ value: s.name, label: s.name })),
    ],
    [subjectsQuery.data]
  );
  const classFormOptions = useMemo(
    () => (classesQuery.data?.data ?? []).map((c) => ({ value: c.name, label: c.name })),
    [classesQuery.data]
  );
  const subjectFormOptions = useMemo(
    () => (subjectsQuery.data?.data ?? []).map((s) => ({ value: s.name, label: s.name })),
    [subjectsQuery.data]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentPerformance | null>(null);
  const [deleting, setDeleting] = useState<StudentPerformance | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { name: "", className: "", subjectName: "" },
  });

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    form.reset();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (student: StudentPerformance) => {
      setEditing(student);
      form.reset({ name: student.name, className: student.class ?? "", subjectName: student.subject ?? "" });
      setModalOpen(true);
    },
    [form]
  );

  useKeyShortcut("n", openCreate);
  useKeyShortcut("/", () => searchRef.current?.focus());

  const createMutation = useMutation({
    mutationFn: studentService.createStudent,
    onSuccess: () => {
      toast.success("Student added");
      closeModal();
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StudentPayload }) => studentService.updateStudent(id, payload),
    onSuccess: () => {
      toast.success("Student updated");
      closeModal();
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: studentService.deleteStudent,
    onSuccess: () => {
      toast.success("Student deleted");
      setDeleting(null);
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: StudentPayload = {
      name: values.name.trim(),
      class: values.className,
      subject: values.subjectName,
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

  const columns: ColumnDef<StudentPerformance>[] = [
    {
      accessorKey: "name",
      header: "Student",
      cell: (info) => {
        const s = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar name={s.name} size="sm" />
            <div>
              <p className="font-medium text-white">{s.name}</p>
            </div>
          </div>
        );
      },
    },
    { accessorKey: "class", header: "Class", cell: (info) => info.row.original.class || "—" },
    { accessorKey: "subject", header: "Subject", cell: (info) => info.row.original.subject || "—" },
    { accessorKey: "quizCount", header: "Quizzes" },
    { accessorKey: "average", header: "Average" },
    {
      accessorKey: "percentage",
      header: "Percentage",
      cell: (info) => {
        const s = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <ProgressBar value={s.percentage} color="gold" className="w-20" />
            <span className="font-semibold text-gold">{s.percentage}%</span>
          </div>
        );
      },
    },
    { accessorKey: "grade", header: "Grade", cell: (info) => <GradeBadge grade={info.row.original.grade} /> },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(row)} title="Edit student" />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => setDeleting(row)}
              className="text-red-400 hover:bg-danger/15"
              title="Delete student"
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Manage your enrolled students"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Students" }]}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 xl:flex-nowrap">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search students..."
          shortcut="/"
          inputRef={searchRef}
          className="w-full lg:w-64 xl:w-64"
        />
        <Select
          options={classOptions}
          value={String(params.class ?? "")}
          onChange={(e) => setFilter("class", e.target.value)}
          className="w-full lg:w-44 xl:w-44"
        />
        <Select
          options={subjectOptions}
          value={String(params.subject ?? "")}
          onChange={(e) => setFilter("subject", e.target.value)}
          className="w-full lg:w-44 xl:w-44"
        />
      </div>

      <Card className="p-0">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          highlight={searchInput || undefined}
          emptyState={{
            icon: Users,
            title: "No students found",
            description: "Try adjusting your filters or add a new student.",
          }}
        />
        <div className="border-t border-white/10 px-4">
          <Pagination pagination={pagination} onPageChange={(page) => setFilter("page", page)} />
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Student" : "Add Student"}
        subtitle={editing ? "Update the student's details" : "Enroll a new student"}
        size="md"
      >
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ali Raza"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Select
            label="Class"
            options={classFormOptions}
            error={form.formState.errors.className?.message}
            {...form.register("className")}
          />
          <Select
            label="Subject"
            options={subjectFormOptions}
            error={form.formState.errors.subjectName?.message}
            {...form.register("subjectName")}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save Changes" : "Add Student"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        title="Delete student"
        message={`Deleting "${deleting?.name}" will also remove all of their quiz records. This cannot be undone.`}
        loading={deleteMutation.isPending}
      />

      <FAB icon={Plus} label="Add Student" onClick={openCreate} shortcut="n" />
    </>
  );
}
