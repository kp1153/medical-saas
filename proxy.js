import { NextResponse } from "next/server";

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const auth = request.cookies.get("auth")?.value;

  if (!auth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};