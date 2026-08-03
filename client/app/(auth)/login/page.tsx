"use client";

import { useRouter } from "next/navigation";
import { Form, Formik, Field, type FieldInputProps, type FieldMetaProps } from "formik";
import * as Yup from "yup";
import { Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { ApiErrorPayload } from "@/services/api";

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
  rememberMe: Yup.boolean(),
});

export default function LoginPage() {
  const router = useRouter();
  const { signin } = useAuth();

  const onSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ): Promise<void> => {
    try {
      await signin(values);
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err) {
      toast.error((err as ApiErrorPayload).message || "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-8">
      <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
      <p className="mt-1.5 text-sm text-white/50">Sign in to your Teacher Assistant workspace</p>

      <Formik
        initialValues={{ email: "", password: "", rememberMe: false }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="mt-8 space-y-5">
            <Field name="email">
              {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                <Input
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="you@school.edu"
                  error={meta.touched && meta.error ? meta.error : undefined}
                  {...field}
                />
              )}
            </Field>

            <Field name="password">
              {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                <Input
                  label="Password"
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  error={meta.touched && meta.error ? meta.error : undefined}
                  {...field}
                />
              )}
            </Field>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <Field type="checkbox" name="rememberMe" className="h-4 w-4 accent-gold" />
                <span className="text-sm text-white/60">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => toast("Password reset coming soon", { icon: "🔐" })}
                className="text-sm text-gold transition-colors hover:text-gold-light"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
              Sign In
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
