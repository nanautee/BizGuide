import { NextResponse } from "next/server";
import { z } from "zod";
import { runSiteAnalysis } from "@/features/analyze-site";
import { attachSessionCookie, getOrCreateSessionId } from "@/shared/lib/session/sessionCookie";
import { setSessionCache } from "@/shared/lib/store/sessionCacheStore";

const bodySchema = z.object({
  url: z.string().min(3, "URL слишком короткий"),
});

export async function POST(request: Request) {
  try {
    const { sessionId, isNew } = await getOrCreateSessionId();

    const body = await request.json();
    const { url } = bodySchema.parse(body);
    const result = await runSiteAnalysis(url, sessionId);

    setSessionCache(sessionId, "site-analysis", result.siteId, result);

    const response = NextResponse.json(result);
    if (isNew) {
      attachSessionCookie(response, sessionId);
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка анализа";
    return NextResponse.json({ message }, { status: 400 });
  }
}
