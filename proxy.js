import { NextResponse } from "next/server";

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    res.headers.set("x-middleware-cache", "no-cache");
    return res;
  }

  if (request.nextUrl.searchParams.has("_rsc")) {
    const res = NextResponse.next();
    res.headers.set("x-middleware-cache", "no-cache");
    return res;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").filter(Boolean).map((c) => {
      const [k, ...v] = c.split("=");
      return [k.trim(), v.join("=")];
    })
  );
  const auth = cookies["auth"];

  if (!auth) {
    const redirectRes = NextResponse.redirect(new URL("/login", request.url));
    redirectRes.headers.set("x-middleware-cache", "no-cache");
    return redirectRes;
  }

  const res = NextResponse.next();
  res.headers.set("x-middleware-cache", "no-cache");
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};