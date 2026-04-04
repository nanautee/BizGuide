import { NextResponse } from "next/server";
import { z } from "zod";
import { runSocialAnalysis } from "@/features/analyze-social/model/runSocialAnalysis";
import { attachSessionCookie, getOrCreateSessionId } from "@/shared/lib/session/sessionCookie";
import { getSessionCache, setSessionCache } from "@/shared/lib/store/sessionCacheStore";

const socialLinkSchema = z.object({
  platform: z.enum(["instagram", "vk", "telegram", "youtube", "whatsapp"]),
  url: z.string().url("Некорректная ссылка"),
  active: z.boolean(),
  followers: z.number().optional(),
  contacts: z.string().optional(),
});

const bodySchema = z.object({
  siteId: z.string().min(1),
  socialLinks: z.array(socialLinkSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const { sessionId, isNew } = await getOrCreateSessionId();
    const body = await request.json();
    const { siteId, socialLinks } = bodySchema.parse(body);

    const cacheKey = JSON.stringify({
      siteId,
      socialLinks: socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url.trim().toLowerCase(),
        active: link.active,
      })),
    });

    const cached = getSessionCache<Awaited<ReturnType<typeof runSocialAnalysis>>>(
      sessionId,
      "social-analysis",
      cacheKey
    );
    const result = cached ?? (await runSocialAnalysis(socialLinks));
    if (!cached) {
      setSessionCache(sessionId, "social-analysis", cacheKey, result);
    }

    const response = NextResponse.json(result);
    if (isNew) {
      attachSessionCookie(response, sessionId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка анализа соцсетей";
    return NextResponse.json({ message }, { status: 400 });
  }
}
