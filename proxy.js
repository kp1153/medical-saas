export function proxy(request) {
  const url = new URL(request.url);
  const token = request.cookies.get("token")?.value;

  const publicPaths = ["/login"];
  if (publicPaths.includes(url.pathname)) {
    return;
  }

  if (!token) {
    return Response.redirect(new URL("/login", request.url));
  }
}