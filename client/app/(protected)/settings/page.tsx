"use client";

import { Form, Formik, Field, type FieldInputProps, type FieldMetaProps } from "formik";
import * as Yup from "yup";
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
import { useAuth } from "@/contexts/AuthContext";
import type { ApiErrorPayload } from "@/services/api";

interface ProfileValues {
  name: string;
  email: string;
}

interface SecurityValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const profileValidation = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
});

const securityValidation = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .matches(PASSWORD_RULES, "Must be 8+ characters with upper, lower, number and special character"),
  confirmPassword: Yup.string()
    .required("Please confirm your new password")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});

function errorMessage(err: unknown): string {
  return (err as ApiErrorPayload).message || "Something went wrong";
}

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();

  const onProfile = async (
    values: ProfileValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ): Promise<void> => {
    try {
      await updateProfile({ name: values.name.trim(), email: values.email.trim() });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onSecurity = async (
    values: SecurityValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ): Promise<void> => {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success("Password changed successfully");
      resetForm();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

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
          <Formik
            initialValues={{ name: user?.name ?? "", email: user?.email ?? "" }}
            validationSchema={profileValidation}
            onSubmit={onProfile}
          >
            {({ isSubmitting }) => (
              <Form noValidate className="space-y-4">
                <Field name="name">
                  {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                    <Input
                      label="Full Name"
                      placeholder="Your name"
                      error={meta.touched && meta.error ? meta.error : undefined}
                      {...field}
                    />
                  )}
                </Field>
                <Field name="email">
                  {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                    <Input
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      error={meta.touched && meta.error ? meta.error : undefined}
                      {...field}
                    />
                  )}
                </Field>
                <Button type="submit" loading={isSubmitting} className="w-full">
                  Save Changes
                </Button>
              </Form>
            )}
          </Formik>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Lock size={17} />
            </span>
            <h3 className="font-display font-semibold text-white">Security</h3>
          </div>
          <Formik
            initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
            validationSchema={securityValidation}
            onSubmit={onSecurity}
          >
            {({ isSubmitting }) => (
              <Form noValidate className="space-y-4">
                <Field name="currentPassword">
                  {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                      error={meta.touched && meta.error ? meta.error : undefined}
                      {...field}
                    />
                  )}
                </Field>
                <Field name="newPassword">
                  {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      hint="At least 8 characters with one uppercase, one lowercase, one number and one special character."
                      error={meta.touched && meta.error ? meta.error : undefined}
                      {...field}
                    />
                  )}
                </Field>
                <Field name="confirmPassword">
                  {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                      error={meta.touched && meta.error ? meta.error : undefined}
                      {...field}
                    />
                  )}
                </Field>
                <Button type="submit" loading={isSubmitting} className="w-full">
                  Save Changes
                </Button>
              </Form>
            )}
          </Formik>
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
              <p className="text-xs text-white/45">v1.0.0</p>
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
