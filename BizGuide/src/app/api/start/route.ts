import { NextResponse } from "next/server";
import { z } from "zod";
import { runStartAnalysis } from "@/features/start-business";
import { attachSessionCookie, getOrCreateSessionId } from "@/shared/lib/session/sessionCookie";
import { getSessionCache, setSessionCache } from "@/shared/lib/store/sessionCacheStore";

const bodySchema = z.object({
  niche: z.string().min(2, "Укажите нишу"),
});

export async function POST(request: Request) {
  try {
    const { sessionId, isNew } = await getOrCreateSessionId();
    const body = await request.json();
    const { niche } = bodySchema.parse(body);

    const cacheKey = niche.trim().toLowerCase();
    const cached = getSessionCache<ReturnType<typeof runStartAnalysis>>(sessionId, "start-analysis", cacheKey);
    const result = cached ?? runStartAnalysis(niche);
    if (!cached) {
      setSessionCache(sessionId, "start-analysis", cacheKey, result);
    }
    setSessionCache(sessionId, "start-analysis-latest", "latest", result);

    const response = NextResponse.json(result);
    if (isNew) {
      attachSessionCookie(response, sessionId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка старта";
    return NextResponse.json({ message }, { status: 400 });
  }
}
