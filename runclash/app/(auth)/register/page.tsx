"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerAction } from "../../actions/authActions";
import type { RegisterFormValues } from "../../lib/validations/auth";

const initialForm: RegisterFormValues = {
  fullName: "",
  email: "",
  fitnessGoal: "stay",
  role: "client",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormValues>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(
    {}
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = <Key extends keyof RegisterFormValues>(
    key: Key,
    value: RegisterFormValues[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const result = await registerAction(form);

    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setMessage(result.message);
      return;
    }

    setFieldErrors({});
    setMessage("Account created. Taking you to login...");
    setForm(initialForm);
    window.setTimeout(() => router.push("/login"), 700);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT SIDE (RED HERO) */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-[#B3261E] text-white px-16 relative">
        <h1 className="text-6xl font-black leading-tight text-center">
          RunClash
        </h1>

        <p className="mt-6 text-4xl font-bold text-center">
          Run. Capture. Conquer.
        </p>

        <p className="mt-6 text-center text-white/80 max-w-md">
          Join elite athletes turning every run into territory control.
          Track, capture, and dominate your city.
        </p>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-16">
        <div className="w-full max-w-md">
          {/* HEADER */}
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-gray-900">
              Create Account
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your details to start your first clash.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FULL NAME */}
            <div>
              <div className="mb-1 text-xs font-semibold tracking-wide text-gray-600">
                Full Name
              </div>
              <input
                placeholder="Your full name"
                value={form.fullName}
                onChange={(e) => updateForm("fullName", e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-[#B3261E]"
              />
              {fieldErrors.fullName && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <div className="mb-1 text-xs font-semibold tracking-wide text-gray-600">
                Email
              </div>
              <input
                placeholder="you@domain.com"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-[#B3261E]"
              />
              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* FITNESS GOAL */}
            <div>
              <div className="mb-1 text-xs font-semibold tracking-wide text-gray-600">
                Fitness goal
              </div>
              <select
                value={form.fitnessGoal}
                onChange={(e) =>
                  updateForm("fitnessGoal", e.target.value as RegisterFormValues["fitnessGoal"])
                }
                className="w-full rounded-xl bg-white px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-[#B3261E]"
              >
                <option value="loose">Loose weight</option>
                <option value="stay">Stay fit</option>
                <option value="gain">Gain weight</option>
              </select>
              {fieldErrors.fitnessGoal && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.fitnessGoal}
                </p>
              )}
            </div>

            {/* ROLE */}
            <div>
              <div className="mb-1 text-xs font-semibold tracking-wide text-gray-600">
                Role
              </div>
              <select
                value={form.role}
                onChange={(e) =>
                  updateForm(
                    "role",
                    e.target.value as RegisterFormValues["role"]
                  )
                }
                className="w-full rounded-xl bg-white px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-[#B3261E]"
              >
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
              </select>
              {fieldErrors.role && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.role}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-1 text-xs font-semibold tracking-wide text-gray-600">
                Password
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-[#B3261E]"
              />
              {fieldErrors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.password}
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowPassword((c) => !c)}
                className="mt-2 text-xs font-semibold text-[#B3261E]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <div className="mb-1 text-xs font-semibold tracking-wide text-gray-600">
                Confirm Password
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-[#B3261E]"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowConfirm((c) => !c)}
                className="mt-2 text-xs font-semibold text-[#B3261E]"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>

            {/* TERMS */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={(e) => updateForm("acceptedTerms", e.target.checked)}
              />
              I agree to Terms & Privacy Policy
            </label>
            {fieldErrors.acceptedTerms && (
              <p className="text-sm text-red-600">{fieldErrors.acceptedTerms}</p>
            )}

            {message && (
              <p
                className={
                  Object.keys(fieldErrors).some((k) => fieldErrors[k])
                    ? "text-sm text-red-600"
                    : "text-sm text-emerald-700"
                }
              >
                {message}
              </p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#B3261E] py-3 font-bold text-white shadow-lg hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Account →"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#B3261E] font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

