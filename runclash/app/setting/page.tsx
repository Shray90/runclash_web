"use client";

import Link from "next/link";

export default function SettingPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Settings & Profile</h1>
            <p className="mt-2 text-gray-600">Manage your profile, connected apps and preferences.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-sky-600 underline">Back to dashboard</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700">AR</div>
              <div>
                <p className="font-bold text-gray-900">Alex Rivers</p>
                <p className="text-sm text-gray-500">Elite Runner</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-gray-600">Personal Best</p>
                <p className="font-bold text-gray-900">26.2 mi</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-600">Pace</p>
                <p className="font-bold text-gray-900">5:12 / mi</p>
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Connected Apps</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">Strava</p>
                  <p className="text-sm text-gray-500">Connected</p>
                </div>
                <button className="rounded-full border px-3 py-1 text-sm">Disconnect</button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">Garmin</p>
                  <p className="text-sm text-gray-500">Not connected</p>
                </div>
                <button className="rounded-full bg-green-600 px-3 py-1 text-sm text-white">Connect</button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700">Account</h3>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-gray-500">alex@example.com</p>
                  </div>
                  <button className="rounded-full border px-3 py-1 text-sm">Edit</button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-semibold">Password</p>
                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                  </div>
                  <button className="rounded-full border px-3 py-1 text-sm">Change</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
