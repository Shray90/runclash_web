"use client";

import Link from "next/link";

export default function RuntrackerPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">
          Runtracker
        </h1>
        <p className="mt-3 text-gray-600">
          Placeholder page. Add your run tracking UI here.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-sky-600 underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

