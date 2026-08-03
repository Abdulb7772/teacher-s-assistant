"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BookMarked, GraduationCap, Plus, Trash2, type LucideIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/features/auth/AuthProvider";
import { useSubjectsQuery, useClassesQuery } from "@/features/meta/useMetaQueries";
import { nameFormSchema, type NameFormValues } from "@/features/forms/schemas";
import * as subjectService from "@/services/subjectService";
import * as classService from "@/services/classService";

function NameList({
  title,
  subtitle,
  Icon,
  placeholder,
  items,
  loading,
  queryKeys,
  onCreate,
  onDelete,
}: {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  placeholder: string;
  items: { _id: string; name: string }[];
  loading: boolean;
  queryKeys: string[];
  onCreate: (name: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const queryClient = useQueryClient();
  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: { name: "" },
  });

  const createMutation = useMutation({
    mutationFn: onCreate,
    onSuccess: () => {
      toast.success(`${title.replace(/s$/, "")} added`);
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      form.reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: onDelete,
    onSuccess: () => {
      toast.success(`${title.replace(/s$/, "")} deleted`);
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values.name.trim());
    } catch {
      /* toast shown by mutation onError */
    }
  });

  return (
    <Card className="mb-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
          {<Icon size={18} />}
        </span>
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="text-xs text-white/45">{subtitle}</p>
        </div>
      </div>

      <form noValidate onSubmit={onSubmit} className="mb-5 flex items-start gap-3">
        <Input
          label={`New ${title.replace(/s$/, "")}`}
          placeholder={placeholder}
          className="flex-1"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Button type="submit" loading={createMutation.isPending} icon={Plus} className="mt-6">
          Add
        </Button>
      </form>

      <ul className="space-y-2">
        {loading && <li className="text-sm text-white/40">Loading {title.toLowerCase()}...</li>}
        {!loading && items.length === 0 && (
          <li className="text-sm text-white/40">No {title.toLowerCase()} yet — add your first above.</li>
        )}
        {items.map((item) => (
          <li
            key={item._id}
            className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-2.5"
          >
            <span className="text-sm font-medium text-white">{item.name}</span>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => deleteMutation.mutate(item._id)}
              className="text-red-400 hover:bg-danger/15"
              title={`Delete ${title.replace(/s$/, "").toLowerCase()}`}
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

  const subjectsQuery = useSubjectsQuery();
  const classesQuery = useClassesQuery();

  if (user?.role !== "admin") return null;

  return (
    <>
      <PageHeader
        title="Subjects & Classes"
        subtitle="Add the subjects and classes your portal manages — quiz marks and outline topics are filed under them"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Subjects & Classes" }]}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <NameList
          title="Subjects"
          subtitle="Quizzes and outline topics are filed under a subject"
          Icon={BookMarked}
          placeholder="e.g. Mathematics"
          items={subjectsQuery.data?.data ?? []}
          loading={subjectsQuery.isPending}
          queryKeys={["subjects"]}
          onCreate={(name) => subjectService.createSubject({ name })}
          onDelete={(id) => subjectService.deleteSubject(id)}
        />
        <NameList
          title="Classes"
          subtitle="Students and quizzes are grouped by class"
          Icon={GraduationCap}
          placeholder="e.g. 8th"
          items={classesQuery.data?.data ?? []}
          loading={classesQuery.isPending}
          queryKeys={["classes"]}
          onCreate={(name) => classService.createClass({ name })}
          onDelete={(id) => classService.deleteClass(id)}
        />
      </div>
    </>
  );
}
