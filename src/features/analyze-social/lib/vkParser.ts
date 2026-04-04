import axios from "axios";
import * as cheerio from "cheerio";
import * as iconv from "iconv-lite";
import type { SocialLinkAnalysis, VkGroupMetrics } from "@/entities/social";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface VkRawGroup {
  id: number;
  name?: string;
  screen_name?: string;
  members_count?: number;
  description?: string;
  status?: string;
  verified?: number;
  cover?: { enabled: number };
  has_photo?: number;
  site?: string;
  contacts?: { desc?: string; email?: string }[];
  tabs?: { name: string; main_type_count?: number }[];
  is_closed?: number;
  type?: string;
}

function extractEmbeddedGroup(html: string): VkRawGroup | null {
  const $ = cheerio.load(html);
  const scripts = $("script").toArray();

  for (const s of scripts) {
    const txt = $(s).html() ?? "";
    const marker = '"response":{"groups"';
    const respIdx = txt.indexOf(marker);
    if (respIdx === -1) continue;

    let startIdx = respIdx;
    let braceCount = 0;
    for (let i = respIdx; i >= 0; i--) {
      if (txt[i] === "}") braceCount++;
      if (txt[i] === "{") {
        braceCount--;
        if (braceCount < 0) {
          startIdx = i;
          break;
        }
      }
    }

    braceCount = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < txt.length; i++) {
      if (txt[i] === "{") braceCount++;
      if (txt[i] === "}") {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    try {
      const data = JSON.parse(txt.substring(startIdx, endIdx));
      const groups: VkRawGroup[] = data?.response?.groups;
      if (groups?.length) return groups[0];
    } catch {
      /* JSON parse failed — try next script */
    }
  }
  return null;
}

function tabCount(tabs: VkRawGroup["tabs"], name: string): number {
  return tabs?.find((t) => t.name === name)?.main_type_count ?? 0;
}

function buildMetrics(g: VkRawGroup): VkGroupMetrics {
  return {
    name: g.name ?? "",
    screenName: g.screen_name ?? "",
    membersCount: g.members_count ?? 0,
    description: g.description ?? "",
    status: g.status ?? "",
    verified: g.verified === 1,
    hasCover: g.cover?.enabled === 1,
    hasPhoto: g.has_photo === 1,
    siteUrl: g.site || null,
    contacts: (g.contacts ?? []).map((c) => ({
      desc: c.desc ?? "",
      email: c.email,
    })),
    tabs: (g.tabs ?? []).map((t) => ({
      name: t.name,
      count: t.main_type_count ?? 0,
    })),
    wallPosts: tabCount(g.tabs, "wall"),
    videos: tabCount(g.tabs, "videos"),
    photos: tabCount(g.tabs, "photos"),
    articles: tabCount(g.tabs, "articles"),
    clips: tabCount(g.tabs, "short_videos"),
    isClosed: g.is_closed === 1,
    type: g.type ?? "group",
  };
}

function analyzeMetrics(m: VkGroupMetrics): {
  score: number;
  issues: string[];
  recommendation: string;
} {
  const issues: string[] = [];
  let penalty = 0;

  if (m.membersCount < 100) {
    issues.push(`Подписчиков пока мало (${m.membersCount}). Расскажите о группе друзьям и клиентам.`);
    penalty += 25;
  } else if (m.membersCount < 1000) {
    issues.push(`Подписчиков: ${m.membersCount}. Попробуйте рекламу, чтобы набрать больше.`);
    penalty += 15;
  } else if (m.membersCount < 5000) {
    issues.push(`Подписчиков: ${m.membersCount}. Хорошее начало, продолжайте!`);
    penalty += 5;
  }

  if (!m.description || m.description.length < 50) {
    issues.push("Напишите подробнее о себе в описании группы.");
    penalty += 10;
  }

  if (!m.hasCover) {
    issues.push("Добавьте обложку — так группа выглядит солиднее.");
    penalty += 10;
  }

  if (!m.siteUrl) {
    issues.push("Добавьте ссылку на сайт в настройках группы.");
    penalty += 10;
  }

  if (m.contacts.length === 0) {
    issues.push("Укажите контакты, чтобы клиенты могли связаться с вами.");
    penalty += 10;
  }

  if (m.wallPosts < 10) {
    issues.push(`Записей мало (${m.wallPosts}). Публикуйте чаще, чтобы подписчики не забывали о вас.`);
    penalty += 15;
  } else if (m.wallPosts < 50) {
    issues.push(`Записей: ${m.wallPosts}. Старайтесь выкладывать хотя бы 2-3 поста в неделю.`);
    penalty += 5;
  }

  if (m.videos === 0) {
    issues.push("Попробуйте добавить видео — их смотрят чаще, чем читают текст.");
    penalty += 10;
  }

  if (m.articles === 0) {
    issues.push("Напишите хотя бы одну статью — это помогает находить вашу группу через поиск.");
    penalty += 5;
  }

  if (m.clips === 0) {
    issues.push("Снимите короткие клипы — VK показывает их в рекомендациях бесплатно.");
    penalty += 5;
  }

  if (m.isClosed) {
    issues.push("Группа закрыта. Откройте доступ, чтобы больше людей увидело ваш контент.");
    penalty += 10;
  }

  const score = Math.max(0, 100 - penalty);

  let recommendation: string;
  if (score >= 85) {
    recommendation = "Группа хорошо оформлена. Продолжайте публиковать и общаться с подписчиками.";
  } else if (score >= 60) {
    recommendation = "Неплохо, но можно лучше. Обратите внимание на советы выше.";
  } else {
    recommendation = "Группе нужна доработка. Начните с описания, обложки и регулярных постов.";
  }

  return { score, issues, recommendation };
}

export async function parseVkGroup(url: string): Promise<SocialLinkAnalysis> {
  const response = await axios.get<ArrayBuffer>(url, {
    timeout: 12000,
    headers: {
      "User-Agent": CHROME_UA,
      "Accept-Language": "ru-RU,ru;q=0.9",
    },
    responseType: "arraybuffer",
  });

  const html = iconv.decode(Buffer.from(response.data), "win1251");
  const group = extractEmbeddedGroup(html);

  if (!group) {
    return {
      platform: "vk",
      url,
      status: "error",
      score: 0,
      issues: ["Не удалось извлечь данные группы. Проверьте ссылку."],
      recommendation: "Убедитесь, что ссылка ведёт на публичную группу/страницу VK.",
    };
  }

  const metrics = buildMetrics(group);
  const analysis = analyzeMetrics(metrics);

  return {
    platform: "vk",
    url,
    status: analysis.score >= 70 ? "ok" : "warning",
    score: analysis.score,
    issues: analysis.issues,
    recommendation: analysis.recommendation,
    metrics,
  };
}
