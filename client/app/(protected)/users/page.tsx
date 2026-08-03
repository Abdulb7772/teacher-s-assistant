"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/features/auth/AuthProvider";
import type { User } from "@/types";
import * as userService from "@/services/userService";
import { userFormSchema, type UserFormValues } from "@/features/forms/schemas";

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
    staleTime: 2 * 60 * 1000,
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success("Employee account created");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset();
    },
    onError: (err) => toast.error(err.message),
  });

  if (user?.role !== "admin") return null;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({ ...values, name: values.name.trim(), email: values.email.trim() });
    } catch {
      /* toast shown by mutation onError */
    }
  });

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

        <form noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="e.g. Sarah Khan"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Input
            label="Email"
            icon={Mail}
            type="email"
            placeholder="employee@school.edu"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <Input
            label="Temporary Password"
            type="password"
            placeholder="••••••••"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={form.formState.errors.confirmPassword?.message}
            {...form.register("confirmPassword")}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={createMutation.isPending} icon={UserPlus}>
              Create Employee Account
            </Button>
          </div>
        </form>
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
