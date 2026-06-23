export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-black tracking-tight">
        <span className="text-red-700">Run</span>
        <span className="text-gray-900">Clash</span>
      </h1>
    </div>


    {/* Right Side */}
    <div className="flex items-center gap-4">
      <a
        href="/register"
        className="rounded-full bg-red-700 px-6 py-2 text-sm font-bold text-white shadow hover:bg-red-800"
      >
        JOIN CLASH
      </a>
    </div>
  </div>
</header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-700">
              Elite Running Ecosystem
            </div>

            <h1 className="text-5xl font-black leading-tight text-gray-900 lg:text-7xl">
              Run. <span className="text-red-700">Capture.</span>
              <br />
              Conquer.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-gray-600">
              The world is your arena. Turn every street, park, and trail into
              territory. Compete in global challenges and lead your squad to glory.
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="/register"
                className="rounded-full bg-red-700 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-red-800"
              >
                Start Running →
              </a>

              <a
                href="/rankings"
                className="rounded-full border border-gray-400 bg-white px-8 py-4 font-semibold text-gray-800 hover:bg-gray-50"
              >
                View Rankings
              </a>
            </div>

            <div className="mt-12 flex gap-10">
              <div>
                <h3 className="text-4xl font-black">1.2M+</h3>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Active Raiders
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-black">450K+</h3>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Territories Captured
                </p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div>
            <img
              src="/images/runner-city.jpg"
              alt="Runner"
              className="h-[650px] w-full rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-black text-gray-900">
            Master the Digital Domain
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Precision tools for the modern athlete. From GPS tracking to tactical
            territory control.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* GPS Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-2 text-2xl font-bold">
              Elite GPS Precision
            </h3>

            <p className="mb-6 text-gray-600">
              Real-time tracking with military-grade precision.
            </p>

            <img
              src="/images/gps-map.jpg"
              alt=""
              className="h-64 w-full rounded-xl object-cover"
            />
          </div>

          {/* Territory Card */}
          <div className="rounded-2xl bg-red-800 p-8 text-white">
            <h3 className="mb-4 text-3xl font-bold">
              Capture Territory
            </h3>

            <p className="text-red-100">
              Every mile contributes to your squad's control over local zones.
            </p>

            <div className="mt-32 border-t border-red-700 pt-6">
              <div className="text-4xl font-black">LVL 42</div>
              <div className="text-xs uppercase tracking-wider">
                Zone Commander
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-2xl font-bold">
              Global Ranks
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between rounded-lg bg-gray-100 p-3">
                <span>Alex Rivers</span>
                <span className="font-bold text-red-700">1,240m</span>
              </div>

              <div className="flex justify-between rounded-lg bg-gray-100 p-3">
                <span>Sarah Chen</span>
                <span>1,192m</span>
              </div>
            </div>
          </div>

          {/* Squad Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-2xl font-bold">
              Squad Synergy
            </h3>

            <p className="text-gray-600">
              Rally your team and unlock collective achievements.
            </p>

            <a
              href="/squads"
              className="mt-6 inline-block font-semibold text-red-700"
            >
              Create a Squad →
            </a>
          </div>

          {/* Team Image */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <img
              src="/images/team-runners.jpg"
              alt=""
              className="h-64 w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}