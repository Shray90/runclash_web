import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-0px)] bg-zinc-50 dark:bg-black flex items-center justify-center px-4 py-10">
      <main className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Login
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Enter your email and password to continue.
              </p>
            </div>
          </div>

          <form className="mt-6" action="#" method="post">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-200/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-200/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/30 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Login
            </button>

            <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

