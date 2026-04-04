import * as cheerio from "cheerio";
import { SEO_CONSTANTS } from "@/shared/config/constants";
import type { ParsedSiteData } from "../types";

export function parseSite(html: string, baseUrl: string): ParsedSiteData {
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1 = $("h1").first().text().trim();

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const textLength = bodyText.length;

  const images = $("img").toArray();
  const totalImages = images.length;
  const imagesWithAlt = images.filter((img) => {
    const alt = $(img).attr("alt")?.trim();
    return Boolean(alt);
  }).length;

  const links = $("a[href]").toArray();
  const host = new URL(baseUrl).hostname;
  let internalLinks = 0;
  let externalLinks = 0;

  links.forEach((link) => {
    const href = $(link).attr("href") ?? "";
    if (href.startsWith("/") || href.startsWith("#")) {
      internalLinks += 1;
      return;
    }

    try {
      const targetHost = new URL(href, baseUrl).hostname;
      if (targetHost === host) {
        internalLinks += 1;
      } else {
        externalLinks += 1;
      }
    } catch {
      // Невалидные ссылки учитываем как внутренние, чтобы не ломать анализ.
      internalLinks += 1;
    }
  });

  const lowerText = bodyText.toLowerCase();
  const hasContacts = SEO_CONSTANTS.contactKeywords.some((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );

  return {
    title,
    metaDescription,
    h1,
    textLength,
    totalImages,
    imagesWithAlt,
    internalLinks,
    externalLinks,
    hasContacts,
  };
}
