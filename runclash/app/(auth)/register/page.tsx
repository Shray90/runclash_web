import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4] flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex relative w-1/2 overflow-hidden bg-gradient-to-br from-[#8B0000] via-[#B31217] to-[#D32F2F] items-center justify-center px-16">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1400&auto=format&fit=crop')",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-red-900/50" />

        {/* Decorative Circles */}
        <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full border border-white/20" />
        <div className="absolute top-[-80px] left-[-80px] h-52 w-52 rounded-full border border-white/10" />

        {/* Content */}
        <div className="relative z-10 max-w-md text-center text-white">
          <h1 className="text-6xl font-extrabold leading-tight">
            RunClash
            <br />
            Run.
            <br />
            Capture.
            <br />
            Conquer.
          </h1>

          <p className="mt-8 text-lg text-white/90 leading-8">
            Join the elite ranks of athletes gamifying their territory.
            Track every mile, claim your ground, and outrun the competition.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-5xl font-extrabold text-zinc-900">
            Create Account
          </h1>

          <p className="mt-3 text-zinc-500 text-lg">
            Enter your details to start your first clash.
          </p>

          <form className="mt-10 space-y-5">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Alex Rivers"
                className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-5 text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800">
                Email Address
              </label>

              <input
                type="email"
                placeholder="alex.rivers@elite.com"
                className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-5 text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••••"
                className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-5 text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white"
              />
            </div>

            {/* Height + Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-800">
                  Height (cm)
                </label>

                <input
                  type="number"
                  placeholder="185"
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-5 text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-800">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  placeholder="78"
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-5 text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800">
                Fitness Goal
              </label>

              <select className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-5 text-zinc-700 outline-none transition focus:border-red-500 focus:bg-white">
                <option>Select your objective</option>
                <option>Lose Weight</option>
                <option>Build Muscle</option>
                <option>Run Faster</option>
                <option>Improve Endurance</option>
              </select>
            </div>

            {/* Terms */}
            <label className="flex items-center gap-3 text-sm text-zinc-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />

              <span>
                I agree to the{" "}
                <span className="text-red-700 font-medium">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-red-700 font-medium">
                  Privacy Policy
                </span>
                .
              </span>
            </label>

            {/* Button */}
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#8B0000] to-[#C62828] text-base font-semibold text-white shadow-lg transition hover:scale-[1.01]"
            >
              Create Account →
            </button>

            {/* Login */}
            <p className="pt-3 text-center text-zinc-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-red-700 hover:underline"
              >
                Sign In
              </Link>
            </p>

            {/* Bottom Features */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-700">
                <div className="mb-2 text-red-700">⚙️</div>
                Pro-grade Accuracy
              </div>

              <div className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-700">
                <div className="mb-2 text-red-700">🏆</div>
                Global Leaderboards
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}