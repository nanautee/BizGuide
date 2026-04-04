import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/shared/lib/auth/userStore";
import { attachAuthCookie } from "@/shared/lib/auth/authCookie";
import { getOrCreateSessionId, attachSessionCookie } from "@/shared/lib/session/sessionCookie";

const bodySchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(4, "Минимум 4 символа"),
  siteUrl: z.string().default(""),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, siteUrl } = bodySchema.parse(body);

    const result = await registerUser(email, password, siteUrl);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const { sessionId, isNew } = await getOrCreateSessionId();

    const response = NextResponse.json({
      token: result.token,
      email: email.toLowerCase().trim(),
      siteUrl,
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
    const message = error instanceof Error ? error.message : "Ошибка регистрации";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
