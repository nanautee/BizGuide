import axios from "axios";
import { REQUEST_CONSTANTS, SEO_CONSTANTS } from "@/shared/config/constants";
import type { SocialLinkAnalysis, SocialLinkInput } from "@/entities/social";
import { parseVkGroup } from "./vkParser";
import { parseZenChannel } from "./zenParser";

function isVkUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "vk.com" || host === "www.vk.com" || host.endsWith(".vk.com");
  } catch {
    return false;
  }
}

function isZenUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "dzen.ru" || host === "zen.yandex.ru" || host.endsWith(".dzen.ru");
  } catch {
    return false;
  }
}

export async function parseSocialLink(input: SocialLinkInput): Promise<SocialLinkAnalysis> {
  if (!input.active) {
    return {
      platform: input.platform,
      url: input.url,
      status: "warning",
      score: 50,
      issues: ["Эта площадка сейчас выключена."],
      recommendation: "Включите её, если хотите привлекать клиентов через эту соцсеть.",
    };
  }

  if (input.platform === "vk" || isVkUrl(input.url)) {
    try {
      return await parseVkGroup(input.url);
    } catch {
      return {
        platform: "vk",
        url: input.url,
        status: "error",
        score: 30,
        issues: ["Не получилось загрузить данные VK-группы."],
        recommendation: "Проверьте, что ссылка правильная и страница открывается.",
      };
    }
  }

  if (input.platform === "yandex_zen" || isZenUrl(input.url)) {
    try {
      return await parseZenChannel(input.url);
    } catch {
      return {
        platform: "yandex_zen",
        url: input.url,
        status: "error",
        score: 30,
        issues: ["Не получилось загрузить данные канала Дзен."],
        recommendation: "Проверьте, что ссылка правильная и канал существует.",
      };
    }
  }

  try {
    const response = await axios.get<string>(input.url, {
      timeout: REQUEST_CONSTANTS.timeoutMs,
      headers: { "User-Agent": REQUEST_CONSTANTS.userAgent },
      responseType: "text",
    });

    const content = String(response.data ?? "").toLowerCase();
    const hasContacts = SEO_CONSTANTS.contactKeywords.some((keyword) =>
      content.includes(keyword.toLowerCase()),
    );

    const issues = hasContacts ? [] : ["На странице не видно контактов (телефон, email и т.д.)."];
    return {
      platform: input.platform,
      url: input.url,
      status: issues.length ? "warning" : "ok",
      score: issues.length ? 70 : 90,
      issues,
      recommendation: hasContacts
        ? "Контакты есть. Не забывайте обновлять информацию."
        : "Добавьте телефон или мессенджер, чтобы клиенты могли с вами связаться.",
    };
  } catch {
    return {
      platform: input.platform,
      url: input.url,
      status: "error",
      score: 30,
      issues: ["Не получилось загрузить страницу."],
      recommendation: "Проверьте, что ссылка правильная и страница открывается.",
    };
  }
}
