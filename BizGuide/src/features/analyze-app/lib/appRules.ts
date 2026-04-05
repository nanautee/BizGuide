import type { AppAnalysisIssue, ParsedAppData } from "@/entities/app";

export function runAppRules(parsed: ParsedAppData): AppAnalysisIssue[] {
  const issues: AppAnalysisIssue[] = [];

  if (parsed.descriptionLength < 300) {
    issues.push({
      code: "description_short",
      message: "Описание приложения слишком короткое (менее 300 символов).",
      level: "high",
      penalty: 20,
    });
  }

  if (parsed.rating !== null && parsed.rating < 4.0) {
    issues.push({
      code: "low_rating",
      message: `Рейтинг ${parsed.rating.toFixed(1)} — ниже 4.0. Низкий рейтинг снижает позиции в поиске стора.`,
      level: "high",
      penalty: 20,
    });
  }

  if (parsed.screenshotsCount < 4) {
    issues.push({
      code: "few_screenshots",
      message: `Найдено ${parsed.screenshotsCount} скриншотов. Рекомендуется минимум 4.`,
      level: "medium",
      penalty: 15,
    });
  }

  if (!parsed.developerEmail) {
    issues.push({
      code: "no_developer_email",
      message: "На странице не найден email разработчика.",
      level: "medium",
      penalty: 10,
    });
  }

  if (parsed.daysSinceUpdate !== null && parsed.daysSinceUpdate > 90) {
    issues.push({
      code: "outdated",
      message: `Приложение не обновлялось ${parsed.daysSinceUpdate} дней (более 90). Сторы ранжируют выше актуальные приложения.`,
      level: "medium",
      penalty: 15,
    });
  }

  return issues;
}

export function buildAppRecommendations(issues: AppAnalysisIssue[]): string[] {
  if (issues.length === 0) {
    return ["Страница приложения выглядит хорошо. Следите за отзывами и обновляйте контент."];
  }

  const map: Record<string, string> = {
    description_short: "Расширьте описание приложения для видимости в поиске стора.",
    low_rating: "Работайте над рейтингом: отвечайте на отзывы, исправляйте баги, запрашивайте оценки у лояльных пользователей.",
    few_screenshots: "Добавьте больше скриншотов — они повышают конверсию установок.",
    no_developer_email: "Добавьте контакт разработчика (email) — это повышает доверие стора и пользователей.",
    outdated: "Обновите приложение — сторы ранжируют выше актуальные приложения.",
  };

  return issues.map((i) => map[i.code] ?? "Исправьте найденную проблему.");
}
