import axios from "axios";
import type { SocialLinkAnalysis } from "@/entities/social";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MAX_PAGES = 30;

interface ZenChannelData {
  name: string;
  subscribers: number;
  isVerified: boolean;
  isPremium: boolean;
  hasLogo: boolean;
  postsCount: number;
  totalViews: number;
}

interface ZenApiItem {
  views?: number;
  source?: {
    title?: string;
    subscribers?: number;
    is_verified?: boolean;
    isPremiumAuthor?: boolean;
    logo?: string;
  };
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

async function fetchZenChannel(url: string): Promise<ZenChannelData> {
  const channelName = extractChannelName(url);
  if (!channelName) throw new Error("Не удалось определить имя канала из URL");

  const headers = commonHeaders(channelName);

  const firstPage = await axios.get<ZenApiResponse>(
    "https://dzen.ru/api/v3/launcher/more",
    {
      params: { channel_name: channelName },
      timeout: 15000,
      headers,
      responseType: "json",
    },
  );

  const firstItems = firstPage.data.items || [];
  const source = firstItems[0]?.source;

  let totalViews = 0;
  let totalPosts = 0;

  for (const item of firstItems) totalViews += item.views || 0;
  totalPosts += firstItems.length;

  let moreLink =
    typeof firstPage.data.more === "string"
      ? firstPage.data.more
      : firstPage.data.more?.link ?? null;

  let page = 1;
  while (moreLink && page < MAX_PAGES) {
    try {
      const next = await axios.get<ZenApiResponse>(moreLink, {
        timeout: 15000,
        headers,
        responseType: "json",
      });
      const nextItems = next.data.items || [];
      if (nextItems.length === 0) break;

      for (const item of nextItems) totalViews += item.views || 0;
      totalPosts += nextItems.length;

      moreLink =
        typeof next.data.more === "string"
          ? next.data.more
          : next.data.more?.link ?? null;
      page++;
    } catch {
      break;
    }
  }

  return {
    name: source?.title || channelName,
    subscribers: source?.subscribers || 0,
    isVerified: source?.is_verified || false,
    isPremium: source?.isPremiumAuthor || false,
    hasLogo: !!source?.logo,
    postsCount: totalPosts,
    totalViews,
  };
}

function analyzeZen(m: ZenChannelData): {
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

  if (m.postsCount < 10) {
    issues.push("Публикаций мало. Чем больше вы пишете, тем чаще Дзен показывает ваш канал.");
    penalty += 20;
  } else if (m.postsCount < 50) {
    issues.push("Пишите чаще — так Дзен будет рекомендовать вас большему числу читателей.");
    penalty += 10;
  }

  if (!m.hasLogo) {
    issues.push("Добавьте логотип канала — так читатели быстрее вас узнают.");
    penalty += 10;
  }

  if (m.totalViews > 0 && m.postsCount > 0) {
    const avgViews = m.totalViews / m.postsCount;
    if (avgViews < 100) {
      issues.push(`В среднем ${Math.round(avgViews)} просмотров на пост. Попробуйте другие темы или форматы.`);
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
  const channelData = await fetchZenChannel(url);
  const analysis = analyzeZen(channelData);

  return {
    platform: "yandex_zen",
    url,
    status: analysis.score >= 70 ? "ok" : "warning",
    score: analysis.score,
    issues: analysis.issues,
    recommendation: analysis.recommendation,
  };
}
