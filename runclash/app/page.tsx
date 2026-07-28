import Link from "next/link";
import { Footprints, Trophy, MapPinned, Target, BadgeCheck, Users, Flag, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 text-lg font-black text-white">RC</div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-red-700">Run</span>
              <span className="text-gray-900">Clash</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-800 transition hover:border-gray-400 hover:shadow-sm">
              Sign In
            </Link>
            <Link href="/register" className="rounded-full bg-red-700 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 hover:shadow-md">
              Start Running
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-50 via-white to-orange-50" />
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <div className="mb-6 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-700">
                Strava meets Pokémon GO
              </div>
              <h1 className="text-5xl font-black leading-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Run. <span className="text-red-700">Capture.</span> Conquer.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-gray-600">
                Turn every street, park, and trail into territory. Complete challenges, earn badges, and climb the leaderboard.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/register" className="rounded-full bg-red-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-red-800 hover:shadow-xl hover:-translate-y-0.5">
                  Start Running →
                </Link>
                <Link href="/login" className="rounded-full border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-800 transition hover:bg-gray-50 hover:border-gray-400">
                  Sign In
                </Link>
              </div>
              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                <div>
                  <h3 className="text-3xl font-black text-gray-900">1.2M+</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Runners</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900">450K+</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Territories Captured</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900">85K+</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Challenges Completed</p>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="relative">
                <div className="h-[520px] overflow-hidden rounded-3xl bg-gradient-to-br from-red-100 to-orange-100 shadow-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <Footprints className="h-28 w-28 mb-4 text-red-400" />
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Your City. Your Territory.</p>
                    <p className="text-xs text-gray-400 mt-2">Map view with live territory control</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg"><Flag className="h-5 w-5 text-green-600" /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Territory Captured!</p>
                      <p className="text-[10px] text-gray-500">+150 XP • +75 Coins</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 rounded-2xl bg-white p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-lg"><Trophy className="h-5 w-5 text-yellow-500" /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Achievement Unlocked</p>
                      <p className="text-[10px] text-gray-500">Run 10 km badge earned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-14 text-center animate-fade-in-up">
          <h2 className="text-4xl font-black text-gray-900">Built for Runners Who Compete</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            GPS tracking, territory control, challenges, and social features — wrapped in a game-like experience.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm card-hover">
            <MapPinned className="h-8 w-8 mb-4 text-red-500" />
            <h3 className="text-xl font-bold text-gray-900">GPS Precision</h3>
            <p className="mt-2 text-sm text-gray-600">Real-time run tracking with pace, distance, calories, and route mapping.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm card-hover">
            <Flag className="h-8 w-8 mb-4 text-red-500" />
            <h3 className="text-xl font-bold text-gray-900">Territory Control</h3>
            <p className="mt-2 text-sm text-gray-600">Capture zones by running through them. Defend your turf against other runners.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm card-hover">
            <Target className="h-8 w-8 mb-4 text-red-500" />
            <h3 className="text-xl font-bold text-gray-900">Daily Challenges</h3>
            <p className="mt-2 text-sm text-gray-600">Complete daily, weekly, and monthly challenges to earn XP and exclusive badges.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm card-hover">
            <Trophy className="h-8 w-8 mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900">Leaderboards</h3>
            <p className="mt-2 text-sm text-gray-600">Rank globally by distance, pace, streaks, and territories controlled.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm card-hover">
            <BadgeCheck className="h-8 w-8 mb-4 text-gray-500" />
            <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
            <p className="mt-2 text-sm text-gray-600">Unlock badges for milestones. Show off your collection on your profile.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm card-hover">
            <Users className="h-8 w-8 mb-4 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-900">Social Rivalries</h3>
            <p className="mt-2 text-sm text-gray-600">Add friends, compare stats, and see who&apos;s dominating the map this week.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-gray-100 bg-gray-900 p-10 text-white sm:p-16">
          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black">Ready to own the streets?</h2>
              <p className="mt-4 max-w-xl text-gray-300">
                Join runners competing for territory control. Every run counts toward your next rank.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/register" className="rounded-full bg-white px-8 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-gray-100">
                  Create Free Account
                </Link>
                <Link href="/login" className="rounded-full border border-gray-700 bg-transparent px-8 py-3 text-sm font-bold text-white transition hover:border-gray-500">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-2xl font-black">Run</p>
                <p className="text-xs text-gray-300">Track every kilometer</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-2xl font-black">Capture</p>
                <p className="text-xs text-gray-300">Claim your territory</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-2xl font-black">Compete</p>
                <p className="text-xs text-gray-300">Climb the rankings</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-2xl font-black">Repeat</p>
                <p className="text-xs text-gray-300">Build your streak</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-700 text-sm font-black text-white">RC</div>
              <span className="text-lg font-black tracking-tight">
                <span className="text-red-700">Run</span>
                <span className="text-gray-900">Clash</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">Territory control for runners.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
