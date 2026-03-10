import { NextResponse } from "next/server";

export function proxy(request) {
  const auth = request.cookies.get("auth");
  const isAuth = auth?.value === process.env.SHOP_PASSWORD;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/).*)"],
};
