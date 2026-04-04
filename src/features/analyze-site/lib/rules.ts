import { SEO_CONSTANTS } from "@/shared/config/constants";
import type { AnalysisIssue, ParsedSiteData } from "@/entities/site";

export function runSiteRules(parsed: ParsedSiteData): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  if (!parsed.title || parsed.title.length < SEO_CONSTANTS.minTitleLength) {
    issues.push({
      code: "title_short",
      message: "Заголовок страницы слишком короткий или отсутствует.",
      level: "high",
      penalty: 20,
    });
  }

  if (!parsed.metaDescription || parsed.metaDescription.length < SEO_CONSTANTS.minMetaDescriptionLength) {
    issues.push({
      code: "meta_description_short",
      message: "Описание страницы (meta description) не заполнено или слишком короткое.",
      level: "high",
      penalty: 20,
    });
  }

  if (!parsed.h1) {
    issues.push({
      code: "h1_missing",
      message: "На странице не найден главный заголовок H1.",
      level: "medium",
      penalty: 15,
    });
  }

  if (parsed.textLength < SEO_CONSTANTS.minTextLength) {
    issues.push({
      code: "content_short",
      message: "Текста на странице мало: поиску сложно понять, о чем ваш бизнес.",
      level: "medium",
      penalty: 15,
    });
  }

  if (parsed.totalImages > 0 && parsed.imagesWithAlt < parsed.totalImages) {
    issues.push({
      code: "image_alt_missing",
      message: "Не у всех изображений есть alt-описания.",
      level: "low",
      penalty: 10,
    });
  }

  if (!parsed.hasContacts) {
    issues.push({
      code: "contacts_missing",
      message: "На странице не видно контактных данных.",
      level: "medium",
      penalty: 10,
    });
  }

  return issues;
}

export function buildRecommendations(issues: AnalysisIssue[]): string[] {
  if (issues.length === 0) {
    return ["Сайт уже выглядит хорошо. Продолжайте регулярно обновлять контент и проверять метрики."];
  }

  const map: Record<string, string> = {
    title_short: "Добавьте понятный и конкретный заголовок страницы (title) с ключевой услугой.",
    meta_description_short: "Заполните meta description: коротко опишите, чем полезен ваш бизнес клиенту.",
    h1_missing: "Добавьте один заметный заголовок H1 на страницу.",
    content_short: "Расширьте текст: услуги, преимущества, цены, ответы на вопросы клиентов.",
    image_alt_missing: "Добавьте alt-описания к изображениям, чтобы улучшить SEO и доступность.",
    contacts_missing: "Укажите контакты (телефон, email, мессенджеры) на видном месте.",
  };

  return issues.map((issue) => map[issue.code] ?? "Исправьте найденную проблему для улучшения видимости.");
}
