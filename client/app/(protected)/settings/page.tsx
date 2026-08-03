"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Lock, Sparkles, User } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/features/auth/AuthProvider";
import { PROFILE_SCHEMA, SECURITY_SCHEMA, type ProfileFormValues, type SecurityFormValues } from "@/features/forms/schemas";
import type { ApiErrorPayload } from "@/services/api";

function errorMessage(err: unknown): string {
  return (err as ApiErrorPayload).message || "Something went wrong";
}

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(PROFILE_SCHEMA),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(SECURITY_SCHEMA),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onProfile = profileForm.handleSubmit(async (values) => {
    try {
      await updateProfile({ name: values.name.trim(), email: values.email.trim() });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  const onSecurity = securityForm.handleSubmit(async (values) => {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success("Password changed successfully");
      securityForm.reset();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <User size={17} />
            </span>
            <h3 className="font-display font-semibold text-white">Profile</h3>
          </div>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={user?.name} size="lg" />
            <div>
              <p className="font-display text-lg font-bold text-white">{user?.name}</p>
              <Badge variant="gold" className="mt-1">
                {user?.role}
              </Badge>
              <p className="mt-1 text-xs text-white/45">{user?.email}</p>
            </div>
          </div>
          <form noValidate onSubmit={onProfile} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your name"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register("email")}
            />
            <Button type="submit" loading={profileForm.formState.isSubmitting} className="w-full">
              Save Changes
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Lock size={17} />
            </span>
            <h3 className="font-display font-semibold text-white">Security</h3>
          </div>
          <form noValidate onSubmit={onSecurity} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={securityForm.formState.errors.currentPassword?.message}
              {...securityForm.register("currentPassword")}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              hint="At least 8 characters with one uppercase, one lowercase, one number and one special character."
              error={securityForm.formState.errors.newPassword?.message}
              {...securityForm.register("newPassword")}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={securityForm.formState.errors.confirmPassword?.message}
              {...securityForm.register("confirmPassword")}
            />
            <Button type="submit" loading={securityForm.formState.isSubmitting} className="w-full">
              Save Changes
            </Button>
          </form>
        </Card>

        <Card className="md:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Sparkles size={17} />
            </span>
            <h3 className="font-display font-semibold text-white">About</h3>
          </div>
          <div className="mb-4 flex items-center gap-3">
            <Logo compact />
            <div>
              <p className="font-display font-bold text-white">Teacher Assistant</p>
              <p className="text-xs text-white/45">v2.0.0</p>
            </div>
          </div>
          <p className="text-sm text-white/60">
            A premium course management portal built for teachers to plan topics, track students and analyze quiz
            performance.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="gold">Next.js</Badge>
            <Badge variant="gold">TypeScript</Badge>
            <Badge variant="gold">Tailwind</Badge>
            <Badge variant="gold">MongoDB</Badge>
          </div>
          <Alert variant="info" className="mt-6">
            Auto logout activates when your session expires.
          </Alert>
        </Card>
      </div>
    </>
  );
}
