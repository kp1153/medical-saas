import { NextResponse } from "next/server";

export function proxy(request) {
  const auth = request.cookies.get("auth");
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!auth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
