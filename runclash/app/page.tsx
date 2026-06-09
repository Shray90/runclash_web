import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1600&auto=format&fit=crop')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-red-800/60 to-black/80" />

      {/* Decorative Blur Circles */}
      <div className="absolute top-[-120px] left-[-120px] h-96 w-96 rounded-full bg-red-700/20 blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] h-96 w-96 rounded-full bg-red-500/20 blur-3xl" />

      {/* Content */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white">
            RunClash
          </h1>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-red-500" />
        </div>

        {/* Headline */}
        <h2 className="max-w-4xl text-4xl md:text-6xl font-black leading-tight text-white">
          Run.
          <span className="text-red-500"> Capture.</span>
          <br />
          Conquer.
        </h2>

        {/* Subtitle */}
        <p className="mt-8 max-w-2xl text-lg md:text-xl leading-8 text-zinc-300">
          Transform every run into a battle for territory. Compete with
          athletes worldwide, dominate leaderboards, and conquer your city one
          mile at a time.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-5">
          <Link
            href="/register"
            className="flex h-14 min-w-[220px] items-center justify-center rounded-full bg-gradient-to-r from-red-700 to-red-500 px-8 text-lg font-semibold text-white shadow-2xl transition hover:scale-105 hover:from-red-600 hover:to-red-400"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="flex h-14 min-w-[220px] items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-lg font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-black"
          >
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}