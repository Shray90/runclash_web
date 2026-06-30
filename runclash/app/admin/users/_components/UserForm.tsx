"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterFormData } from "@/app/(auth)/_components/schema";
import { handleCreateUser } from "@/lib/actions/admin/user-action";

export default function UserForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await handleCreateUser(data);
        if (result.success) {
          router.push("/admin/users");
        } else {
          setError(result.message || "User creation failed");
        }
      } catch (error: any) {
        setError(error?.message || "User creation failed");
      }
    });
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/users" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
          Back
        </Link>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && <div className="rounded-xl border border-[#f8d7da] bg-[#f8d7da] px-4 py-3 text-sm text-[#842029]">{error}</div>}
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-[1.5px] text-body">Email</label>
          <input type="email" {...register("email")} placeholder="you@example.com" className="h-12 w-full border bg-surface-card px-4" />
          {errors.email && <p className="mt-2 text-sm text-[#842029]">{errors.email.message}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-[1.5px] text-body">First Name</label>
            <input type="text" {...register("firstName")} placeholder="Jane" className="h-12 w-full border bg-surface-card px-4" />
            {errors.firstName && <p className="mt-2 text-sm text-[#842029]">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-[1.5px] text-body">Last Name</label>
            <input type="text" {...register("lastName")} placeholder="Doe" className="h-12 w-full border bg-surface-card px-4" />
            {errors.lastName && <p className="mt-2 text-sm text-[#842029]">{errors.lastName.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-[1.5px] text-body">Username</label>
          <input type="text" {...register("username")} placeholder="janedoe" className="h-12 w-full border bg-surface-card px-4" />
          {errors.username && <p className="mt-2 text-sm text-[#842029]">{errors.username.message}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-[1.5px] text-body">Password</label>
            <input type="password" {...register("password")} placeholder="••••••••" className="h-12 w-full border bg-surface-card px-4" />
            {errors.password && <p className="mt-2 text-sm text-[#842029]">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-[1.5px] text-body">Confirm Password</label>
            <input type="password" {...register("confirmPassword")} placeholder="••••••••" className="h-12 w-full border bg-surface-card px-4" />
            {errors.confirmPassword && <p className="mt-2 text-sm text-[#842029]">{errors.confirmPassword.message}</p>}
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting || isPending} className="h-12 rounded bg-on-dark px-6 text-white">
            {isPending ? "Creating..." : "Create user"}
          </button>
        </div>
      </form>
    </div>
  );
}
