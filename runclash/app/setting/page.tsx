"use client";

import Link from "next/link";

export default function SettingPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Settings & Profile</h1>
            <p className="mt-2 text-gray-600">Manage your profile, connected apps and preferences.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">Back to dashboard</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-1 card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {/* TODO: make avatar dynamic — upload via settings */}
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
                AR
              </div>
              <div>
                <p className="font-bold text-gray-900">Alex Rivers</p>
                <p className="text-sm text-gray-500">Elite Runner</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-lg bg-red-50 p-3 transition hover:bg-red-100">
                <p className="text-xs text-gray-600">Personal Best</p>
                <p className="font-bold text-gray-900">26.2 mi</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100">
                <p className="text-xs text-gray-600">Pace</p>
                <p className="font-bold text-gray-900">5:12 / mi</p>
              </div>
            </div>
          </div>

          <div className="col-span-2 card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Connected Apps</h2>
            {/* NOTE: integration status icons — replace with actual OAuth states */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition hover:border-gray-200 hover:shadow-sm">
                <div>
                  <p className="font-semibold text-gray-900">Strava</p>
                  <p className="text-sm text-green-600 font-medium">✓ Connected</p>
                </div>
                <button className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium transition hover:bg-gray-50">Disconnect</button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition hover:border-gray-200 hover:shadow-sm">
                <div>
                  <p className="font-semibold text-gray-900">Garmin</p>
                  <p className="text-sm text-gray-400">Not connected</p>
                </div>
                {/* FIXME: connect flow not implemented — redirect to OAuth */}
                <button className="rounded-full bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700">Connect</button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Account</h3>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition hover:border-gray-200 hover:shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">alex@example.com</p>
                  </div>
                  <button className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium transition hover:bg-gray-50">Edit</button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition hover:border-gray-200 hover:shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                  </div>
                  <button className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium transition hover:bg-gray-50">Change</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
