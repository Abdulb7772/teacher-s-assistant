"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik, Field, type FieldInputProps, type FieldMetaProps } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { BookMarked, GraduationCap, Library, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import * as subjectService from "@/services/subjectService";
import * as classService from "@/services/classService";

interface NameFormValues {
  name: string;
}

const DEFAULT_VALUES: NameFormValues = { name: "" };

const nameValidation = Yup.object({
  name: Yup.string().required("Name is required").max(60, "Too long"),
});

function SubjectList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getSubjects,
  });
  const subjects = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: subjectService.createSubject,
    onSuccess: () => {
      toast.success("Subject added");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: subjectService.deleteSubject,
    onSuccess: () => {
      toast.success("Subject deleted");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = async (
    values: NameFormValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ): Promise<void> => {
    try {
      await createMutation.mutateAsync({ name: values.name.trim() });
      resetForm();
    } catch {
      /* toast shown by mutation onError */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <BookMarked size={18} />
        </span>
        <div>
          <h2 className="font-semibold text-white">Subjects</h2>
          <p className="text-xs text-white/45">Quizzes and outline topics are filed under a subject</p>
        </div>
      </div>

      <Formik initialValues={DEFAULT_VALUES} validationSchema={nameValidation} onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate className="mb-5 flex items-start gap-3">
            <Field name="name">
              {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                <Input
                  label="New Subject"
                  placeholder="e.g. Mathematics"
                  className="flex-1"
                  error={meta.touched && meta.error ? meta.error : undefined}
                  {...field}
                />
              )}
            </Field>
            <Button type="submit" loading={isSubmitting} icon={Plus} className="mt-6">
              Add
            </Button>
          </Form>
        )}
      </Formik>

      <ul className="space-y-2">
        {isLoading && <li className="text-sm text-white/40">Loading subjects...</li>}
        {!isLoading && subjects.length === 0 && (
          <li className="text-sm text-white/40">No subjects yet — add your first subject above.</li>
        )}
        {subjects.map((subject) => (
          <li
            key={subject._id}
            className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-2.5"
          >
            <span className="text-sm font-medium text-white">{subject.name}</span>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => deleteMutation.mutate(subject._id)}
              className="text-red-400 hover:bg-danger/15"
              title="Delete subject"
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ClassList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: classService.getClasses,
  });
  const classes = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: classService.createClass,
    onSuccess: () => {
      toast.success("Class added");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: classService.deleteClass,
    onSuccess: () => {
      toast.success("Class deleted");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = async (
    values: NameFormValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ): Promise<void> => {
    try {
      await createMutation.mutateAsync({ name: values.name.trim() });
      resetForm();
    } catch {
      /* toast shown by mutation onError */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <GraduationCap size={18} />
        </span>
        <div>
          <h2 className="font-semibold text-white">Classes</h2>
          <p className="text-xs text-white/45">Students and quizzes are grouped by class</p>
        </div>
      </div>

      <Formik initialValues={DEFAULT_VALUES} validationSchema={nameValidation} onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate className="mb-5 flex items-start gap-3">
            <Field name="name">
              {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                <Input
                  label="New Class"
                  placeholder="e.g. 8th"
                  className="flex-1"
                  error={meta.touched && meta.error ? meta.error : undefined}
                  {...field}
                />
              )}
            </Field>
            <Button type="submit" loading={isSubmitting} icon={Plus} className="mt-6">
              Add
            </Button>
          </Form>
        )}
      </Formik>

      <ul className="space-y-2">
        {isLoading && <li className="text-sm text-white/40">Loading classes...</li>}
        {!isLoading && classes.length === 0 && (
          <li className="text-sm text-white/40">No classes yet — add your first class above.</li>
        )}
        {classes.map((cls) => (
          <li key={cls._id} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-2.5">
            <span className="text-sm font-medium text-white">{cls.name}</span>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => deleteMutation.mutate(cls._id)}
              className="text-red-400 hover:bg-danger/15"
              title="Delete class"
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function ManageSubjectsPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (user?.role !== "admin") return null;

  return (
    <>
      <PageHeader
        title="Subjects & Classes"
        subtitle="Add the subjects and classes your portal manages — quiz marks and outline topics are filed under them"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Subjects & Classes" }]}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SubjectList />
        <ClassList />
      </div>
    </>
  );
}
