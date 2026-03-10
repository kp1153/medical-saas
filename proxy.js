import { NextResponse } from "next/server";

export function proxy(request) {
  const auth = request.cookies.get("auth");
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!auth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (auth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/).*)"],
};
