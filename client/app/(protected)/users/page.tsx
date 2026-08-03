"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik, Field, type FieldInputProps, type FieldMetaProps } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/lib/types";
import * as userService from "@/services/userService";
import type { ColumnDef } from "@tanstack/react-table";

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const DEFAULT_VALUES: FormValues = { name: "", email: "", password: "", confirmPassword: "" };

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required").min(3, "Name is too short"),
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "One uppercase letter")
    .matches(/[a-z]/, "One lowercase letter")
    .matches(/\d/, "One number")
    .matches(/[^A-Za-z0-9]/, "One special character"),
  confirmPassword: Yup.string()
    .required("Please confirm the password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

export default function ManageUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.role && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success("Employee account created");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (user?.role !== "admin") return null;

  const onSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ): Promise<void> => {
    try {
      await createMutation.mutateAsync({ ...values, name: values.name.trim(), email: values.email.trim() });
      resetForm();
    } catch {
      /* toast shown by mutation onError */
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <Avatar name={info.row.original.name} size="sm" />
          <div>
            <p className="font-medium text-white">{info.row.original.name}</p>
            <p className="text-xs text-white/40">{info.row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => {
        const isAdmin = info.row.original.role === "admin";
        return (
          <Badge variant={isAdmin ? "gold" : "blue"}>
            <ShieldCheck size={12} /> {isAdmin ? "Admin" : "Employee"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: (info) => (
        <span className="text-white/60">
          {new Date(info.row.original.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Manage Users"
        subtitle="Create employee accounts — employees get the same access except user management"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Users" }]}
      />

      <Card className="mb-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <UserPlus size={18} />
          </span>
          <div>
            <h2 className="font-semibold text-white">Add Employee</h2>
            <p className="text-xs text-white/45">New accounts are created with the employee role</p>
          </div>
        </div>

        <Formik initialValues={DEFAULT_VALUES} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ isSubmitting }) => (
            <Form noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field name="name">
                {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                  <Input
                    label="Full Name"
                    placeholder="e.g. Sarah Khan"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    {...field}
                  />
                )}
              </Field>
              <Field name="email">
                {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                  <Input
                    label="Email"
                    icon={Mail}
                    type="email"
                    placeholder="employee@school.edu"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    {...field}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                  <Input
                    label="Temporary Password"
                    type="password"
                    placeholder="••••••••"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    {...field}
                  />
                )}
              </Field>
              <Field name="confirmPassword">
                {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    {...field}
                  />
                )}
              </Field>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" loading={isSubmitting} icon={UserPlus}>
                  Create Employee Account
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>

      <Card className="p-0">
        <DataTable
          columns={columns}
          data={users}
          loading={isLoading}
          emptyState={{
            icon: Users,
            title: "No users yet",
            description: "Create your first employee account above.",
          }}
        />
      </Card>
    </>
  );
}
