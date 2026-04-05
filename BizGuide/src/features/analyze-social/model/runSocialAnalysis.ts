import { parseSocialLink } from "../lib/socialParser";
import type { SocialLinkAnalysis, SocialLinkInput } from "@/entities/social";

export async function runSocialAnalysis(links: SocialLinkInput[]): Promise<{
  score: number;
  items: SocialLinkAnalysis[];
  recommendations: string[];
}> {
  const items = await Promise.all(links.map((item) => parseSocialLink(item)));
  const score = items.length
    ? Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length)
    : 0;

  const recommendations = items
    .filter((item) => item.status !== "ok")
    .map((item) => `${item.platform}: ${item.recommendation}`);

  return {
    score,
    items,
    recommendations: recommendations.length
      ? recommendations
      : ["Площадки выглядят хорошо. Продолжайте регулярно обновлять контент."],
  };
}
