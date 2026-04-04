import { fetchHtml } from "@/shared/lib/http/fetchHtml";
import { parseAppPage } from "../lib/appParser";
import { runAppRules, buildAppRecommendations } from "../lib/appRules";
import { calculateAppScore } from "../lib/appScorer";
import type { AppAnalysisResult } from "@/entities/app";

const SUPPORTED_HOSTS = ["play.google.com", "apps.apple.com"];

export function isAppStoreUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return SUPPORTED_HOSTS.some((h) => host.includes(h));
  } catch {
    return false;
  }
}

export async function runAppAnalysis(inputUrl: string): Promise<AppAnalysisResult> {
  const url = inputUrl.trim();
  if (!isAppStoreUrl(url)) {
    throw new Error("Поддерживаются только ссылки на Google Play и App Store.");
  }

  const html = await fetchHtml(url);
  const parsed = parseAppPage(html, url);
  const issues = runAppRules(parsed);
  const recommendations = buildAppRecommendations(issues);
  const score = calculateAppScore(issues);

  return {
    appUrl: url,
    store: parsed.store,
    name: parsed.name,
    score,
    issues,
    recommendations,
    checkedAt: new Date().toISOString(),
    parsed,
  };
}
