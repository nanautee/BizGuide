import axios from "axios";
import type { SocialLinkAnalysis, ZenChannelMetrics } from "@/entities/social";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MAX_PAGES_PER_FEED = 30;
const CONTENT_TYPES = ["article", "long_video", "short_video"] as const;
const MS_30_DAYS = 30 * 86400000;

interface ZenLauncherSource {
  title?: string;
  subscribers?: number;
  is_verified?: boolean;
  isPremiumAuthor?: boolean;
  logo?: string;
}

interface ZenExportItem {
  publicationDate?: number;
  views?: number;
  socialInfo?: { likesCount?: number };
}

interface ZenApiItem {
  views?: number;
  source?: ZenLauncherSource;
}

interface ZenApiResponse {
  items?: ZenApiItem[];
  more?: { link?: string } | string;
}

function extractChannelName(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    if (!path) return null;
    return path.split("/")[0] || null;
  } catch {
    return null;
  }
}

function commonHeaders(channelName: string) {
  return {
    "User-Agent": CHROME_UA,
    "Accept-Language": "ru-RU,ru;q=0.9",
    Accept: "application/json",
    Referer: `https://dzen.ru/${channelName}`,
  };
}

function getItemsFromResponse(data: unknown): ZenExportItem[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.items)) return d.items as ZenExportItem[];
  const fd = d.feedData;
  if (fd && typeof fd === "object" && Array.isArray((fd as Record<string, unknown>).items)) {
    return (fd as { items: ZenExportItem[] }).items;
  }
  return [];
}

function getMoreLink(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const top = d.more;
  if (typeof top === "string") return top;
  if (top && typeof top === "object" && "link" in top && typeof (top as { link: string }).link === "string") {
    return (top as { link: string }).link;
  }
  const fd = d.feedData;
  if (fd && typeof fd === "object") {
    const fdMore = (fd as Record<string, unknown>).more;
    if (typeof fdMore === "string") return fdMore;
    if (fdMore && typeof fdMore === "object" && "link" in fdMore) {
      return String((fdMore as { link: string }).link);
    }
  }
  return null;
}

function mergeSource(a: ZenLauncherSource | null, b: ZenLauncherSource | null): ZenLauncherSource {
  return {
    title: a?.title ?? b?.title,
    subscribers: a?.subscribers ?? b?.subscribers ?? 0,
    is_verified: a?.is_verified ?? b?.is_verified ?? false,
    isPremiumAuthor: a?.isPremiumAuthor ?? b?.isPremiumAuthor ?? false,
    logo: a?.logo ?? b?.logo,
  };
}

async function fetchLauncherSource(
  channelName: string,
  headers: Record<string, string>,
): Promise<ZenLauncherSource | null> {
  try {
    const r = await axios.get<ZenApiResponse>("https://dzen.ru/api/v3/launcher/more", {
      params: { channel_name: channelName },
      timeout: 15000,
      headers,
      responseType: "json",
    });
    return r.data.items?.[0]?.source ?? null;
  } catch {
    return null;
  }
}

async function fetchExportChannelSource(
  channelName: string,
  headers: Record<string, string>,
): Promise<ZenLauncherSource | null> {
  try {
    const params = new URLSearchParams({
      country_code: "ru",
      clid: "1400",
      lang: "ru",
      referrer_place: "layout",
      channel_name: channelName,
      content_type: "article",
      channel_version: "welcome_infinity",
      sort_type: "regular",
    });
    const r = await axios.get<{
      channel?: { source?: ZenLauncherSource };
    }>(`https://dzen.ru/api/web/v1/export?${params}`, {
      timeout: 20000,
      headers,
      responseType: "json",
    });
    return r.data.channel?.source ?? null;
  } catch {
    return null;
  }
}

/** Публикации за последние 30 дней по одному типу контента (статьи / длинные ролики / короткие). */
async function aggregateExportType(
  channelName: string,
  contentType: (typeof CONTENT_TYPES)[number],
  cutoffSec: number,
  headers: Record<string, string>,
): Promise<{ posts: number; views: number; likes: number }> {
  const params = new URLSearchParams({
    country_code: "ru",
    clid: "1400",
    lang: "ru",
    referrer_place: "layout",
    channel_name: channelName,
    content_type: contentType,
    channel_version: "welcome_infinity",
    sort_type: "regular",
  });

  let url: string | null = `https://dzen.ru/api/web/v1/export?${params}`;
  let posts = 0;
  let views = 0;
  let likes = 0;

  for (let page = 0; page < MAX_PAGES_PER_FEED && url; page++) {
    const { data } = await axios.get(url, {
      timeout: 20000,
      headers,
      responseType: "json",
    });

    const items = getItemsFromResponse(data);
    if (items.length === 0) break;

    for (const item of items) {
      const pub = item.publicationDate;
      if (pub == null) continue;
      if (pub >= cutoffSec) {
        posts += 1;
        views += item.views ?? 0;
        likes += item.socialInfo?.likesCount ?? 0;
      }
    }

    const allOlder =
      items.length > 0 &&
      items.every((i) => i.publicationDate != null && i.publicationDate < cutoffSec);

    if (allOlder) break;

    url = getMoreLink(data);
  }

  return { posts, views, likes };
}

async function aggregateLast30Days(
  channelName: string,
  cutoffSec: number,
  headers: Record<string, string>,
): Promise<{ posts: number; views: number; likes: number }> {
  let posts = 0;
  let views = 0;
  let likes = 0;

  for (const contentType of CONTENT_TYPES) {
    try {
      const chunk = await aggregateExportType(channelName, contentType, cutoffSec, headers);
      posts += chunk.posts;
      views += chunk.views;
      likes += chunk.likes;
    } catch {
      /* один из типов контента может быть недоступен — продолжаем с остальными */
    }
  }

  return { posts, views, likes };
}

function analyzeZen(m: {
  subscribers: number;
  postsLast30Days: number;
  viewsLast30Days: number;
  hasLogo: boolean;
}): {
  score: number;
  issues: string[];
  recommendation: string;
} {
  const issues: string[] = [];
  let penalty = 0;

  if (m.subscribers < 100) {
    issues.push(`Подписчиков пока мало (${m.subscribers}). Расскажите о канале в других соцсетях.`);
    penalty += 25;
  } else if (m.subscribers < 1000) {
    issues.push(`Подписчиков: ${m.subscribers}. Попробуйте делиться ссылками на канал в других местах.`);
    penalty += 15;
  } else if (m.subscribers < 5000) {
    issues.push(`Подписчиков: ${m.subscribers}. Хорошее начало, продолжайте!`);
    penalty += 5;
  }

  if (m.postsLast30Days < 4) {
    issues.push(
      "За последний месяц мало публикаций. Чем чаще вы выходите в ленту, тем охотнее Дзен показывает канал.",
    );
    penalty += 20;
  } else if (m.postsLast30Days < 12) {
    issues.push("Старайтесь публиковать хотя бы 2–3 материала в неделю — так охват стабильнее.");
    penalty += 10;
  }

  if (!m.hasLogo) {
    issues.push("Добавьте логотип канала — так читатели быстрее вас узнают.");
    penalty += 10;
  }

  if (m.viewsLast30Days > 0 && m.postsLast30Days > 0) {
    const avgViews = m.viewsLast30Days / m.postsLast30Days;
    if (avgViews < 100) {
      issues.push(`В среднем ${Math.round(avgViews)} просмотров на пост за 30 дней. Попробуйте другие темы или форматы.`);
      penalty += 10;
    }
  }

  const score = Math.max(0, 100 - penalty);

  let recommendation: string;
  if (score >= 85) {
    recommendation = "Канал отлично развивается. Продолжайте писать и следите за тем, что нравится читателям.";
  } else if (score >= 60) {
    recommendation = "Неплохо! Пишите регулярно и пробуйте разные форматы.";
  } else {
    recommendation = "Каналу нужна работа. Начните с регулярных публикаций и оформления профиля.";
  }

  return { score, issues, recommendation };
}

export async function parseZenChannel(url: string): Promise<SocialLinkAnalysis> {
  const channelName = extractChannelName(url);
  if (!channelName) throw new Error("Не удалось определить имя канала из URL");

  const headers = commonHeaders(channelName);
  const cutoffSec = Math.floor((Date.now() - MS_30_DAYS) / 1000);

  const [launcherSource, exportSource, last30] = await Promise.all([
    fetchLauncherSource(channelName, headers),
    fetchExportChannelSource(channelName, headers),
    aggregateLast30Days(channelName, cutoffSec, headers),
  ]);

  const source = mergeSource(launcherSource, exportSource);
  const name = source.title ?? channelName;
  const subscribers = source.subscribers ?? 0;
  const hasLogo = !!source.logo;

  const metrics: ZenChannelMetrics = {
    name,
    subscribers,
    postsLast30Days: last30.posts,
    viewsLast30Days: last30.views,
    likesLast30Days: last30.likes,
    verified: source.is_verified ?? false,
    hasLogo,
  };

  const analysis = analyzeZen({
    subscribers,
    postsLast30Days: last30.posts,
    viewsLast30Days: last30.views,
    hasLogo,
  });

  return {
    platform: "yandex_zen",
    url,
    status: analysis.score >= 70 ? "ok" : "warning",
    score: analysis.score,
    issues: analysis.issues,
    recommendation: analysis.recommendation,
    metrics,
  };
}
