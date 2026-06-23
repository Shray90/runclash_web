import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = getTokenFromCookie(req, "runclash_token");
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Forward multipart body to backend
  const formData = await req.formData();

  const backendRes = await fetch(`${apiBaseUrl}/v1/auth/update`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: "no-store",
  });

  const json = await backendRes.json().catch(() => ({}));
  return NextResponse.json(json, { status: backendRes.status });
}

function getTokenFromCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  const value = match.split("=").slice(1).join("=");
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

