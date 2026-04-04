import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/shared/lib/session/sessionCookie";
import { getSessionCache } from "@/shared/lib/store/sessionCacheStore";
import type { SiteAnalysisResult } from "@/entities/site";
import { DashboardPanel } from "@/widgets/DashboardPanel";
import type { DashboardInitialData } from "@/widgets/DashboardPanel";

type SocialCacheShape = {
  score: number;
  items: {
    platform: string;
    url: string;
    status: "ok" | "warning" | "error";
    score: number;
    issues: string[];
    recommendation: string;
  }[];
  recommendations: string[];
};

type StartCacheShape = {
  niche: string;
  checklist: string[];
  commercialOffer: string[];
};

type AppCacheShape = {
  appUrl: string;
  store: "google_play" | "app_store";
  name: string;
  score: number;
  issues: { code: string; message: string; level: string; penalty: number }[];
  recommendations: string[];
  checkedAt: string;
};

function toSiteName(url?: string): string {
  if (!url) return "BusinessSite.com";
  try {
    return new URL(url).hostname.replace(/^www\./, "") || "BusinessSite.com";
  } catch {
    return url.replace(/^https?:\/\//, "") || "BusinessSite.com";
  }
}

function toSiteUrl(url?: string): string {
  if (!url) return "http://businesssite.com/";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seeded(seed: number, min: number, max: number): number {
  const value = Math.abs(Math.sin(seed) * 10000);
  return Math.floor(min + (value - Math.floor(value)) * (max - min + 1));
}

function buildMockFallback(siteId: string, sessionId: string, url?: string): DashboardInitialData {
  const seed = hashSeed(`${sessionId}:${siteId}`);
  const score = seeded(seed + 3, 55, 91);
  const status = score >= 85 ? "Отлично" : score >= 70 ? "Хорошо" : score >= 55 ? "Средне" : "Низко";

  const tipsPool = [
    "Укоротите title на главной до 55-65 символов.",
    "Добавьте FAQ-блок с ключевыми вопросами клиентов.",
    "Уплотните внутреннюю перелинковку в услугах.",
    "Обновляйте основной оффер минимум раз в 2 недели.",
    "Проверьте alt-тексты у изображений в карточках.",
  ];
  const issuesPool = [
    "Meta description короткий на 2 страницах.",
    "На части карточек нет alt-описаний.",
    "Скорость мобильной версии выше целевой.",
    "Слабая связка между страницами услуг.",
  ];

  const tipsOffset = seeded(seed + 29, 0, tipsPool.length - 3);
  const issuesOffset = seeded(seed + 31, 0, issuesPool.length - 2);

  return {
    siteId,
    url: toSiteUrl(url),
    siteName: toSiteName(url),
    siteUrl: toSiteUrl(url),
    score,
    status,
    checkedAt: null,
    issues: score >= 80 ? issuesPool.slice(issuesOffset, issuesOffset + 1) : issuesPool.slice(issuesOffset, issuesOffset + 2),
    recommendations: tipsPool.slice(tipsOffset, tipsOffset + 3),
    hasPreviousSnapshot: false,
    scoreDelta: null,
    socialScore: null,
    socialRecommendations: [],
    startChecklist: [],
    startOffer: [],
    appBlock: null,
    isRealData: false,
  };
}

function buildFromCache(
  siteId: string,
  url: string | undefined,
  siteCache: SiteAnalysisResult,
  socialCache: SocialCacheShape | null,
  startCache: StartCacheShape | null,
  appCache: AppCacheShape | null,
): DashboardInitialData {
  const score = siteCache.score;
  const status = score >= 85 ? "Отлично" : score >= 70 ? "Хорошо" : score >= 55 ? "Средне" : "Низко";

  return {
    siteId,
    url: siteCache.normalizedUrl || toSiteUrl(url),
    siteName: toSiteName(siteCache.normalizedUrl || url),
    siteUrl: siteCache.normalizedUrl || toSiteUrl(url),
    score,
    status,
    checkedAt: siteCache.checkedAt,
    issues: siteCache.issues.map((i) => i.message),
    recommendations: siteCache.recommendations,
    hasPreviousSnapshot: siteCache.monitoring.hasPreviousSnapshot,
    scoreDelta: siteCache.monitoring.scoreDelta,
    socialScore: socialCache?.score ?? null,
    socialRecommendations: socialCache?.recommendations ?? [],
    startChecklist: startCache?.checklist ?? [],
    startOffer: startCache?.commercialOffer ?? [],
    appBlock: appCache
      ? {
          name: appCache.name,
          store: appCache.store,
          appUrl: appCache.appUrl,
          score: appCache.score,
          issues: appCache.issues.map((i) => i.message),
          recommendations: appCache.recommendations,
          checkedAt: appCache.checkedAt,
        }
      : null,
    isRealData: true,
  };
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ url?: string; tab?: string }>;
}) {
  const [{ siteId }, { url }] = await Promise.all([params, searchParams]);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "guest-session";

  const siteCache = getSessionCache<SiteAnalysisResult>(sessionId, "site-analysis", siteId);
  const socialCache = getSessionCache<SocialCacheShape>(sessionId, "social-analysis-by-site", siteId);
  const startCache = getSessionCache<StartCacheShape>(sessionId, "start-analysis-latest", "latest");
  const appCache = getSessionCache<AppCacheShape>(sessionId, "app-analysis", siteId);

  const initialData: DashboardInitialData = siteCache
    ? buildFromCache(siteId, url, siteCache, socialCache, startCache, appCache)
    : buildMockFallback(siteId, sessionId, url);

  return <DashboardPanel initialData={initialData} />;
}
