"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
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
          <h2 className="text-5xl font-bold text-zinc-900">Reset Password</h2>
          <p className="mt-3 text-lg text-zinc-600">Password reset coming soon.</p>

          <div className="mt-8 rounded-xl border border-[#f8d7da] bg-[#f8d7da] px-4 py-3 text-sm text-[#842029]">
            This feature is not yet implemented. Please contact support if you need help accessing your account.
          </div>

          <div className="mt-6">
            <Link
              href="/login"
              className="block w-full text-center rounded-full bg-gradient-to-r from-[#aa1f1f] to-[#cc3428] px-6 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-[1.02]"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}