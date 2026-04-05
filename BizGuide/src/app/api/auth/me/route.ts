import { NextResponse } from "next/server";
import { getAuthToken } from "@/shared/lib/auth/authCookie";
import { getUserByToken } from "@/shared/lib/auth/userStore";

export async function GET() {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      email: user.email,
      siteUrl: user.siteUrl,
      createdAt: user.createdAt,
    },
  });
}
