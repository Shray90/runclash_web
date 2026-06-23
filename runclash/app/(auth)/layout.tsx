export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="w-full bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-6">
          <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">
            <span className="text-[#B3261E]">Run</span>
            <span className="text-gray-900">Clash</span>
          </h1>
        </div>
      </header>

      {children}
    </div>
  );
}

