import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/shared/lib/auth/authCookie";
import { SESSION_COOKIE_NAME } from "@/shared/lib/session/sessionCookie";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
