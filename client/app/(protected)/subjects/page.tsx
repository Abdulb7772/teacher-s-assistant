"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BookMarked, GraduationCap, Pencil, Plus, Trash2, Upload, X, type LucideIcon } from "lucide-react";
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
  onUpdate,
  onDelete,
  importOptions,
  onImport,
}: {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  placeholder: string;
  items: { _id: string; name: string }[];
  loading: boolean;
  queryKeys: string[];
  onCreate: (name: string) => Promise<unknown>;
  onUpdate: (id: string, name: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  importOptions?: { _id: string; name: string }[];
  onImport?: (id: string, sourceClasses: string[]) => Promise<unknown>;
}) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importSources, setImportSources] = useState<string[]>([]);
  const [newItemImportSources, setNewItemImportSources] = useState<string[]>([]);
  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: { name: "" },
  });

  const createMutation = useMutation({
    mutationFn: onCreate,
    onSuccess: async (data) => {
      toast.success(`${title.replace(/s$/, "")} added`);
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      const createdId = (data as { data?: { _id?: string } })?.data?._id;
      if (createdId && onImport && newItemImportSources.length) {
        await onImport(createdId, newItemImportSources);
        queryClient.invalidateQueries({ queryKey: ["students"] });
        toast.success("Students imported");
      }
      form.reset();
      setNewItemImportSources([]);
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

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => onUpdate(id, name),
    onSuccess: () => {
      toast.success(`${title.replace(/s$/, "")} updated`);
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const importMutation = useMutation({
    mutationFn: ({ id, sourceClasses }: { id: string; sourceClasses: string[] }) =>
      onImport ? onImport(id, sourceClasses) : Promise.resolve(),
    onSuccess: () => {
      toast.success("Students imported");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setImportingId(null);
      setImportSources([]);
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
      {onImport && importOptions && (
        <div className="mb-5 -mt-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60" htmlFor={`new-${title.toLowerCase()}-sources`}>
            Import students into this new {title.replace(/s$/, "").toLowerCase()} (optional)
          </label>
          <select
            id={`new-${title.toLowerCase()}-sources`}
            multiple
            value={newItemImportSources}
            onChange={(event) => setNewItemImportSources(Array.from(event.target.selectedOptions, (option) => option.value))}
            className="input-field min-h-20 w-full"
          >
            {importOptions.map((option) => <option key={option._id} value={option.name}>{option.name}</option>)}
          </select>
        </div>
      )}

      <ul className="space-y-2">
        {loading && <li className="text-sm text-white/40">Loading {title.toLowerCase()}...</li>}
        {!loading && items.length === 0 && (
          <li className="text-sm text-white/40">No {title.toLowerCase()} yet — add your first above.</li>
        )}
        {items.map((item) => (
          <li key={item._id} className="rounded-xl border border-white/10 px-4 py-2.5">
            {editingId === item._id ? (
              <form
                className="flex items-start gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  const name = String(formData.get("name") ?? "").trim();
                  if (name) updateMutation.mutate({ id: item._id, name });
                }}
              >
                <Input name="name" defaultValue={item.name} aria-label={`Edit ${title.replace(/s$/, "").toLowerCase()} name`} className="flex-1" autoFocus />
                <Button type="submit" size="sm" loading={updateMutation.isPending}>Save</Button>
                <Button type="button" variant="ghost" size="sm" icon={X} onClick={() => setEditingId(null)} title="Cancel edit" />
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">{item.name}</span>
                <div className="flex items-center gap-1">
                  {onImport && importOptions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Upload}
                      onClick={() => {
                        setImportingId(importingId === item._id ? null : item._id);
                        setImportSources([]);
                      }}
                      title="Import students from existing classes"
                    />
                  )}
                  <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setEditingId(item._id)} title={`Edit ${title.replace(/s$/, "").toLowerCase()}`} />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => deleteMutation.mutate(item._id)}
                    className="text-red-400 hover:bg-danger/15"
                    title={`Delete ${title.replace(/s$/, "").toLowerCase()}`}
                  />
                </div>
              </div>
            )}
            {importingId === item._id && onImport && importOptions && (
              <form
                className="mt-3 border-t border-white/10 pt-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (importSources.length) importMutation.mutate({ id: item._id, sourceClasses: importSources });
                }}
              >
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60" htmlFor={`import-${item._id}`}>
                  Import students from
                </label>
                <select
                  id={`import-${item._id}`}
                  multiple
                  value={importSources}
                  onChange={(event) => setImportSources(Array.from(event.target.selectedOptions, (option) => option.value))}
                  className="input-field min-h-24 w-full"
                >
                  {importOptions.filter((option) => option._id !== item._id).map((option) => <option key={option._id} value={option.name}>{option.name}</option>)}
                </select>
                <div className="mt-2 flex justify-end">
                  <Button type="submit" size="sm" icon={Upload} loading={importMutation.isPending} disabled={!importSources.length}>Import students</Button>
                </div>
              </form>
            )}
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
          onUpdate={(id, name) => subjectService.updateSubject(id, { name })}
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
          onUpdate={(id, name) => classService.updateClass(id, { name })}
          onDelete={(id) => classService.deleteClass(id)}
          importOptions={classesQuery.data?.data ?? []}
          onImport={(id, sourceClasses) => classService.importStudents(id, sourceClasses)}
        />
      </div>
    </>
  );
}
