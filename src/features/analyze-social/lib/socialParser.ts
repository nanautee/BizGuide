import axios from "axios";
import { REQUEST_CONSTANTS, SEO_CONSTANTS } from "@/shared/config/constants";
import type { SocialLinkAnalysis, SocialLinkInput } from "@/entities/social";

export async function parseSocialLink(input: SocialLinkInput): Promise<SocialLinkAnalysis> {
  if (!input.active) {
    return {
      platform: input.platform,
      url: input.url,
      status: "warning",
      score: 50,
      issues: ["Площадка выключена из анализа."],
      recommendation: "Активируйте площадку, если планируете привлекать клиентов через нее.",
    };
  }

  try {
    const response = await axios.get<string>(input.url, {
      timeout: REQUEST_CONSTANTS.timeoutMs,
      headers: { "User-Agent": REQUEST_CONSTANTS.userAgent },
      responseType: "text",
    });

    const content = String(response.data ?? "").toLowerCase();
    const hasContacts = SEO_CONSTANTS.contactKeywords.some((keyword) =>
      content.includes(keyword.toLowerCase())
    );

    const issues = hasContacts ? [] : ["На странице не обнаружены явные контакты."];
    return {
      platform: input.platform,
      url: input.url,
      status: issues.length ? "warning" : "ok",
      score: issues.length ? 70 : 90,
      issues,
      recommendation: hasContacts
        ? "Контакты найдены. Поддерживайте актуальность профиля."
        : "Добавьте телефон/мессенджер в описание профиля.",
    };
  } catch {
    return {
      platform: input.platform,
      url: input.url,
      status: "error",
      score: 30,
      issues: ["Не удалось получить данные страницы (таймаут или ошибка доступа)."],
      recommendation: "Проверьте ссылку и доступность страницы.",
    };
  }
}
