"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginFormData, loginSchema } from "@/app/(auth)/_components/schema";
import { handleLoginUser } from "@/lib/actions/auth-action";

const Mail = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7.5l8.5 5.5L20 7.5" />
    <path d="M21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75" />
  </svg>
);

const Lock = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const Zap = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await handleLoginUser(data);
        if (result.success) {
          router.push("/dashboard");
        } else {
          setError(result.message || "Login failed");
        }
      } catch (error: any) {
        setError(error?.message || "Login failed");
      }
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f3f3] flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,#efefef_0%,#f7f7f7_45%,#ececec_100%)]" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-2xl bg-white/30 backdrop-blur-sm shadow-inner border border-white/40" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner border border-white/30" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-extrabold text-[#B22222] tracking-tight">RunClash</h1>
          <p className="mt-2 text-sm tracking-[0.35em] text-[#8c6f67] font-semibold uppercase">Elite Territory Control</p>
        </div>

        <div className="bg-[#f8f7f7] border border-white/50 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
          <h2 className="text-5xl font-bold text-zinc-900">Welcome Back</h2>
          <p className="mt-3 text-lg text-zinc-600">Sync your biometric data and rejoin the fight.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
            {error && <div className="rounded-xl border border-[#f8d7da] bg-[#f8d7da] px-4 py-3 text-sm text-[#842029]">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-[#6d5550] mb-2 tracking-wide">Email Address</label>
              <div className="flex items-center gap-3 rounded-2xl bg-[#eceaea] px-5 py-4 border border-transparent focus-within:border-[#b22222] transition">
                <Mail className="w-5 h-5 text-[#8b6f68]" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="athlete@runclash.com"
                  className="w-full bg-transparent outline-none text-lg text-[#8b6f68] placeholder:text-[#9d8680]"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-[#842029]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6d5550] mb-2 tracking-wide">Password</label>
              <div className="flex items-center gap-3 rounded-2xl bg-[#eceaea] px-5 py-4 border border-transparent focus-within:border-[#b22222] transition">
                <Lock className="w-5 h-5 text-[#8b6f68]" />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••••"
                  className="w-full bg-transparent outline-none text-lg text-[#8b6f68] placeholder:text-[#9d8680]"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-[#842029]">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#6d5550]">
                <input type="checkbox" className="rounded border-zinc-300" />
                Remember Me
              </label>
              <Link href="/forgot-password" className="font-semibold text-[#b22222] hover:underline">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className="group relative mt-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-[#aa1f1f] to-[#cc3428] px-6 py-5 text-2xl font-bold text-white shadow-xl transition hover:scale-[1.02] disabled:opacity-60"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-3"> 
                <Zap className="w-6 h-6" />
                {isPending ? "Signing in..." : "Initialize Session"}
              </span>
            </button>

            <p className="pt-6 text-center text-lg text-[#6d5550]">
              New to the game?{" "}
              <Link href="/register" className="font-bold text-[#b22222] hover:underline">Join the Squad</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
