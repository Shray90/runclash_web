import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-red-700">Run</span>
              <span className="text-gray-900">Clash</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-red-700 px-6 py-2 text-sm font-bold text-white shadow transition hover:bg-red-800 hover:shadow-lg"
            >
              Join Clash
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-in-up">
            {/* NOTE: badge uses static text — can be dynamic per user segment later */}
            <div className="mb-6 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-700">
              Elite Running Ecosystem
            </div>

            <h1 className="text-5xl font-black leading-tight text-gray-900 lg:text-7xl">
              Run. <span className="text-red-700">Capture.</span>
              <br />
              Conquer.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-gray-600">
              The world is your arena. Turn every street, park, and trail into territory.
              Compete in global challenges and lead your squad to glory.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-red-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-red-800 hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Running →
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-gray-400 bg-white px-8 py-4 text-lg font-semibold text-gray-800 transition hover:bg-gray-50 hover:border-gray-500"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              <div>
                <h3 className="text-4xl font-black">1.2M+</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Raiders</p>
              </div>
              <div>
                <h3 className="text-4xl font-black">450K+</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Territories Captured</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {/* TODO: replace placeholder div with actual image once CDN is set up */}
            <div className="h-[520px] overflow-hidden rounded-3xl bg-gradient-to-br from-red-100 to-gray-200 shadow-2xl flex items-center justify-center">
              {true ? (
                <div className="text-center p-8">
                  <div className="text-6xl mb-3">🏃</div>
                  <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Runner Visualization</p>
                  <p className="text-xs text-gray-300 mt-1">Image: runner-city.jpg</p>
                </div>
              ) : (
                <img
                  src="/images/runner-city.jpg"
                  alt="Runner sprinting through urban streets"
                  className="h-full w-full object-cover hover-scale"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-14 text-center animate-fade-in-up">
          <h2 className="text-4xl font-black text-gray-900">Master the Digital Domain</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Precision tools for the modern athlete. From GPS tracking to tactical territory control.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* DEV: hardcoded feature cards — TODO: fetch from CMS or config */}
          <div className="card-hover rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-2 text-2xl font-bold">Elite GPS Precision</h3>
            <p className="mb-6 text-gray-600">Real-time tracking with military-grade precision.</p>
            <div className="h-64 overflow-hidden rounded-xl bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">GPS Map View</p>
              </div>
              {/* TODO: img src="/images/gps-map.jpg" alt="GPS tracking interface" className="w-full h-full object-cover" */}
            </div>
          </div>

          <div className="card-hover rounded-2xl bg-red-800 p-8 text-white">
            <h3 className="mb-4 text-3xl font-bold">Capture Territory</h3>
            <p className="text-red-100">Dominate your squad&apos;s control.</p>
            <div className="mt-32 border-t border-red-700 pt-6">
              <div className="text-4xl font-black">LVL 42</div>
              <div className="text-xs uppercase tracking-wider">Zone Commander</div>
            </div>
          </div>

          <div className="card-hover rounded-2xl bg-white p-6 shadow-sm">
            {/* OPTIMIZE: this data is mocked — replace with real API call */}
            <h3 className="mb-4 text-2xl font-bold">Global Ranks</h3>
            <div className="space-y-3">
              <div className="flex justify-between rounded-lg bg-gray-100 p-3 transition hover:bg-red-50">
                <span>Alex Rivers</span>
                <span className="font-bold text-red-700">1,240m</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-100 p-3 transition hover:bg-red-50">
                <span>Sarah Chen</span>
                <span className="font-bold text-red-700">1,192m</span>
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl bg-white p-6 shadow-sm">
            {/* FIXME: squad feature not yet wired to backend — see roadmap */}
            <h3 className="mb-3 text-2xl font-bold">Squad Synergy</h3>
            <p className="text-gray-600">Rally your team and unlock collective achievements.</p>
            <Link href="/dashboard" className="mt-6 inline-block font-semibold text-red-700 transition hover:text-red-800">
              Create a Squad →
            </Link>
          </div>

          <div className="card-hover rounded-2xl bg-white p-4 shadow-sm">
            <div className="h-64 w-full rounded-xl bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🏃‍♂️</div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Team Runners</p>
              </div>
              {/* TODO: <img src="/images/team-runners.jpg" alt="Team of runners" className="w-full h-full object-cover hover-scale" /> */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
