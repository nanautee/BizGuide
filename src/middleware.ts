import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "bizguide_auth";
const SITE_ID_COOKIE = "bizguide_site_id";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const siteId = request.cookies.get(SITE_ID_COOKIE)?.value;

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("mode", "login");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/login" && token && siteId) {
    const dashUrl = new URL(`/dashboard/${siteId}`, request.url);
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
