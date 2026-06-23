import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/setting",
  "/runtracker",
  "/terotories",
  "/global-ranks",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public auth pages
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuthRoute) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("runclash_token")?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setting/:path*",
    "/runtracker/:path*",
    "/terotories/:path*",
    "/global-ranks/:path*",
  ],
};

