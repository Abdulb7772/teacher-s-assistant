"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import { Form, Formik, Field, type FieldInputProps, type FieldMetaProps } from "formik";
import * as Yup from "yup";
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
import type { StudentPerformance } from "@/lib/types";
import * as studentService from "@/services/studentService";
import type { StudentPayload } from "@/services/studentService";
import * as classService from "@/services/classService";

interface FormValues {
  name: string;
  className: string;
}

const DEFAULT_VALUES: FormValues = {
  name: "",
  className: "",
};

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  className: Yup.string(),
});

export default function ManageStudentsPage() {
  const { data, pagination, loading, params, setFilter, refresh, searchInput, setSearchInput } =
    usePaginatedQuery<StudentPerformance>(studentService.getStudents, { initialParams: { page: 1, limit: 10 } });

  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: classService.getClasses });
  const classes = classesQuery.data?.data ?? [];

  const classOptions = useMemo(
    () => [{ value: "", label: "All Classes" }, ...classes.map((c) => ({ value: c.name, label: c.name }))],
    [classes]
  );
  const classFormOptions = useMemo(() => classes.map((c) => ({ value: c.name, label: c.name })), [classes]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentPerformance | null>(null);
  const [deleting, setDeleting] = useState<StudentPerformance | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((student: StudentPerformance) => {
    setEditing(student);
    setModalOpen(true);
  }, []);

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

  const onSubmit = async (
    values: FormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ): Promise<void> => {
    const payload: StudentPayload = {
      name: values.name.trim(),
      class: values.className,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch {
      /* toast shown by mutation onError */
    } finally {
      setSubmitting(false);
    }
  };

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

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search students..."
          shortcut="/"
          inputRef={searchRef}
          className="w-full lg:w-64"
        />
        <Select
          options={classOptions}
          value={String(params.class ?? "")}
          onChange={(e) => setFilter("class", e.target.value)}
          className="w-full lg:w-44"
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
        <Formik
          initialValues={
            editing
              ? {
                  name: editing.name,
                  className: editing.class ?? "",
                }
              : DEFAULT_VALUES
          }
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {() => (
            <Form noValidate className="space-y-4">
              <Field name="name">
                {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                  <Input
                    label="Full Name"
                    placeholder="e.g. Ali Raza"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    {...field}
                  />
                )}
              </Field>
              <Field name="className">
                {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                  <Select
                    label="Class"
                    options={classFormOptions}
                    error={meta.touched && meta.error ? meta.error : undefined}
                    {...field}
                  />
                )}
              </Field>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {editing ? "Save Changes" : "Add Student"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
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
