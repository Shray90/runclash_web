"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAction } from "../../actions/authActions";
import { saveAuthSession } from "../../lib/cookies/authCookies";
import type { LoginFormValues } from "../../lib/validations/auth";

const initialForm: LoginFormValues = {
  email: "",
  password: "",
  remember: true,
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<LoginFormValues>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = <Key extends keyof LoginFormValues>(
    key: Key,
    value: LoginFormValues[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage("");

    const result = await loginAction(form);

    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setMessage(result.message);
      return;
    }

    saveAuthSession(result.data.token, result.data.user, form.remember);

    setFieldErrors({});
    setMessage("Login successful. Opening your dashboard...");

    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f4f3] px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-50">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <polygon points="0,0 50,0 100,50 100,100" fill="#efefef" />
            <polygon points="0,50 50,100 100,85 100,100 0,100" fill="#f0f0f0" />
          </svg>
        </div>
      </div>

      {/* Decorative Cards */}
      <div className="absolute right-8 top-8 hidden h-52 w-52 rounded-2xl bg-white/50 shadow-md backdrop-blur-sm lg:block" />

      <div className="absolute bottom-8 left-8 hidden h-52 w-52 rounded-2xl bg-white/50 shadow-md backdrop-blur-sm lg:block" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
          Elite Territory Control
        </p>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <h2 className="text-4xl font-black text-gray-900">
            Welcome Back
          </h2>

          <p className="mt-3 text-gray-600">
            Sync your biometric data and rejoin the fight.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
            noValidate
          >
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ✉
                </span>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateForm("email", event.target.value)
                  }
                  placeholder="athlete@runclash.com"
                  className="w-full rounded-xl bg-[#f4f4f4] py-4 pl-12 pr-4 text-gray-700 outline-none transition focus:ring-2 focus:ring-[#B3261E]"
                />
              </div>

              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    updateForm("password", event.target.value)
                  }
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-[#f4f4f4] py-4 pl-12 pr-12 text-gray-700 outline-none transition focus:ring-2 focus:ring-[#B3261E]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              {fieldErrors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) =>
                    updateForm("remember", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-[#B3261E]"
                />
                Remember Me
              </label>

              <Link
                href="#"
                className="text-sm font-semibold text-[#B3261E]"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Messages */}
            {message && (
              <p
                className={`text-sm ${
                  Object.keys(fieldErrors).some(
                    (key) => fieldErrors[key]
                  )
                    ? "text-red-600"
                    : "text-green-700"
                }`}
              >
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center rounded-full bg-[#B3261E] py-4 text-xl font-bold text-white shadow-lg transition hover:bg-[#9f211a] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? "Initializing..."
                : "⚡ Initialize Session"}
            </button>
          </form>
        </div>

        {/* Bottom Link */}
        <p className="mt-10 text-center text-gray-600">
          New to the game?{" "}
          <Link
            href="/register"
            className="font-bold text-[#B3261E] hover:underline"
          >
            Join the Squad
          </Link>
        </p>
      </div>
    </div>
  );
}