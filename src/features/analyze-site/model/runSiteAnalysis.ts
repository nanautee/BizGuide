import { fetchHtml } from "@/shared/lib/http/fetchHtml";
import { parseSite } from "@/entities/site/model/parseSite";
import { runSiteRules, buildRecommendations } from "@/shared/lib/analyzer/rules";
import { calculateScore } from "@/shared/lib/analyzer/scorer";
import { getPreviousSnapshot, saveSnapshot } from "@/shared/lib/store/analysisStore";
import type { SiteAnalysisResult } from "@/entities/site/types";

function toSiteId(url: string): string {
  return Buffer.from(url).toString("base64url");
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function runSiteAnalysis(inputUrl: string, sessionId: string): Promise<SiteAnalysisResult> {
  const normalizedUrl = normalizeUrl(inputUrl);
  const html = await fetchHtml(normalizedUrl);
  const parsed = parseSite(html, normalizedUrl);
  const issues = runSiteRules(parsed);
  const recommendations = buildRecommendations(issues);
  const score = calculateScore(issues);
  const checkedAt = new Date().toISOString();

  const previous = getPreviousSnapshot(sessionId, normalizedUrl);
  saveSnapshot(sessionId, normalizedUrl, score, checkedAt);

  return {
    siteId: toSiteId(normalizedUrl),
    normalizedUrl,
    score,
    issues,
    recommendations,
    checkedAt,
    monitoring: {
      hasPreviousSnapshot: Boolean(previous),
      scoreDelta: previous ? score - previous.score : null,
    },
  };
}
