import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/shared/lib/auth/userStore";
import { attachAuthCookie } from "@/shared/lib/auth/authCookie";
import { getOrCreateSessionId, attachSessionCookie } from "@/shared/lib/session/sessionCookie";

const bodySchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = bodySchema.parse(body);

    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const { sessionId, isNew } = await getOrCreateSessionId();

    const response = NextResponse.json({
      token: result.token,
      email: email.toLowerCase().trim(),
      siteUrl: result.siteUrl,
      siteId: result.siteId,
      domain: result.domain,
    });

    attachAuthCookie(response, result.token, result.siteId);
    if (isNew) {
      attachSessionCookie(response, sessionId);
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Ошибка входа";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
