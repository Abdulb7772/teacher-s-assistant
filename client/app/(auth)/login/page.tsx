"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/features/auth/AuthProvider";
import { loginSchema, type LoginFormValues } from "@/features/auth/schema";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { ApiErrorPayload } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { signin } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signin(values);
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err) {
      toast.error((err as ApiErrorPayload).message || "Sign in failed");
    }
  });

  return (
    <div className="glass-strong rounded-2xl p-8">
      <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
      <p className="mt-1.5 text-sm text-white/50">Sign in to your Teacher Assistant workspace</p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        <Input
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@school.edu"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-gold" {...register("rememberMe")} />
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
      </form>
    </div>
  );
}
