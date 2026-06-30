"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterFormData } from "@/app/(auth)/_components/schema";
import { handleRegisterUser } from "@/lib/actions/auth-action";

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await handleRegisterUser(data);
        if (result.success) {
          router.push("/login");
        } else {
          setError(result.message || "Registration failed");
        }
      } catch (error: any) {
        setError(error?.message || "Registration failed");
      }
    });
  };

  const fieldClass = "h-12 w-full rounded-xl bg-white px-4 text-lg text-[#3e3731] placeholder:text-[#b2a49c] outline-none ring-1 ring-gray-200 transition focus:border-red-600 focus:ring-red-200";
  const labelClass = "mb-2 block text-sm font-semibold uppercase tracking-[1.5px] text-[#5f4b44]";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f8f7f7]">
      <div className="hidden lg:flex flex-col justify-center bg-[#B3261E] px-16 text-white">
        <h1 className="text-6xl font-black leading-tight">RunClash</h1>
        <p className="mt-6 text-4xl font-bold">Run. Capture. Conquer.</p>
        <p className="mt-6 max-w-md text-lg text-white/90">
          Join elite athletes turning every run into territory control. Track, capture, and dominate your city.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-gray-900">Create your account</h2>
            <p className="mt-2 text-gray-600">Register quickly to jump back into the chase.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...register("email")} placeholder="athlete@runclash.com" className={fieldClass} />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>First Name</label>
                <input type="text" {...register("firstName")} placeholder="Jane" className={fieldClass} />
                {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" {...register("lastName")} placeholder="Doe" className={fieldClass} />
                {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Username</label>
              <input type="text" {...register("username")} placeholder="janedoe" className={fieldClass} />
              {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" {...register("password")} placeholder="••••••••" className={fieldClass} />
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" {...register("confirmPassword")} placeholder="••••••••" className={fieldClass} />
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className="w-full rounded-full bg-gradient-to-r from-red-700 to-red-500 px-6 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-[1.02] disabled:opacity-60"
            >
              {isPending ? "Creating account..." : "Register"}
            </button>

            <p className="pt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-red-700 hover:underline">Login here</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
