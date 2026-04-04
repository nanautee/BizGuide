import { NextResponse } from "next/server";
import { z } from "zod";
import { runAppAnalysis } from "@/features/analyze-app";
import { attachSessionCookie, getOrCreateSessionId } from "@/shared/lib/session/sessionCookie";
import { setSessionCache } from "@/shared/lib/store/sessionCacheStore";

const bodySchema = z.object({
  url: z.string().url("Некорректная ссылка на приложение"),
  siteId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const { sessionId, isNew } = await getOrCreateSessionId();
    const body = await request.json();
    const { url, siteId } = bodySchema.parse(body);

    const result = await runAppAnalysis(url);

    const cacheKey = siteId ?? url;
    setSessionCache(sessionId, "app-analysis", cacheKey, result);

    const response = NextResponse.json(result);
    if (isNew) {
      attachSessionCookie(response, sessionId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка анализа приложения";
    return NextResponse.json({ message }, { status: 400 });
  }
}
