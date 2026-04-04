import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "bizguide_auth";

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export const AUTH_FLAG_COOKIE = "bizguide_logged_in";
export const SITE_ID_COOKIE = "bizguide_site_id";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

export function attachAuthCookie(
  response: NextResponse,
  token: string,
  siteId?: string,
): void {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  response.cookies.set({
    name: AUTH_FLAG_COOKIE,
    value: "1",
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  if (siteId) {
    response.cookies.set({
      name: SITE_ID_COOKIE,
      value: siteId,
      httpOnly: false,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }
}

export function clearAuthCookie(response: NextResponse): void {
  for (const name of [AUTH_COOKIE_NAME, AUTH_FLAG_COOKIE, SITE_ID_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}
