import * as cheerio from "cheerio";
import type { AppStore, ParsedAppData } from "@/entities/app";

function detectStore(url: string): AppStore {
  if (url.includes("apps.apple.com")) return "app_store";
  return "google_play";
}

function daysBetween(dateStr: string): number | null {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

function parseGooglePlay(html: string): Omit<ParsedAppData, "store"> {
  const $ = cheerio.load(html);

  const name = $('h1[itemprop="name"]').text().trim()
    || $("h1").first().text().trim()
    || "Unknown App";

  const descriptionEl = $('div[data-g-id="description"]').first();
  const description = descriptionEl.length
    ? descriptionEl.text().trim()
    : $('meta[name="description"]').attr("content")?.trim() ?? "";

  const ratingText = $('div[itemprop="starRating"] meta[itemprop="ratingValue"]').attr("content")
    || $('[class*="rating"] [aria-label*="rating"]').attr("aria-label")?.match(/[\d.]+/)?.[0]
    || $('div[aria-label*="Rated"]').attr("aria-label")?.match(/[\d.]+/)?.[0]
    || "";
  const rating = ratingText ? parseFloat(ratingText) : null;

  const ratingsCountText = $('span[aria-label*="rating"]').text().match(/[\d,]+/)?.[0]
    || $('div[class*="reviews"]').text().match(/[\d,]+/)?.[0]
    || "";
  const ratingsCount = ratingsCountText ? parseInt(ratingsCountText.replace(/,/g, ""), 10) : null;

  const screenshots = $('img[alt*="screenshot"], img[data-screenshot-item], img[srcset*="screenshot"]');
  const screenshotsCount = Math.max(screenshots.length, $('img[alt*="Screenshot"]').length);

  const emailMatch = html.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const developerEmail = emailMatch ? emailMatch[0] : null;

  const updatedMeta = $('div:contains("Updated on")').text().match(/Updated on\s+(.+)/)?.[1]
    || $('div:contains("Обновлено")').text().match(/Обновлено\s+(.+)/)?.[1]
    || "";
  const lastUpdated = updatedMeta.trim() || null;
  const daysSinceUpdate = lastUpdated ? daysBetween(lastUpdated) : null;

  return {
    name,
    description,
    descriptionLength: description.length,
    rating: rating && rating > 0 && rating <= 5 ? rating : null,
    ratingsCount: ratingsCount && ratingsCount > 0 ? ratingsCount : null,
    screenshotsCount,
    developerEmail,
    lastUpdated,
    daysSinceUpdate,
  };
}

function parseAppStore(html: string): Omit<ParsedAppData, "store"> {
  const $ = cheerio.load(html);

  const name = $('h1.product-header__title').text().trim()
    || $("h1").first().text().trim()
    || "Unknown App";

  const description = $('div.section__description .we-truncate__child').text().trim()
    || $('meta[property="og:description"]').attr("content")?.trim()
    || $('meta[name="description"]').attr("content")?.trim()
    || "";

  const ratingText = $('span.we-customer-ratings__averages__display').text().trim()
    || $('figcaption.we-rating-count').text().match(/[\d.]+/)?.[0]
    || "";
  const rating = ratingText ? parseFloat(ratingText) : null;

  const ratingsCountText = $('div.we-customer-ratings__count').text().match(/[\d,.\s]+/)?.[0]
    || "";
  const ratingsCount = ratingsCountText
    ? parseInt(ratingsCountText.replace(/[\s,.]/g, ""), 10)
    : null;

  const screenshots = $('picture.we-screenshot__image source, img.we-screenshot__image');
  const screenshotsCount = screenshots.length;

  const emailMatch = html.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const developerEmail = emailMatch ? emailMatch[0] : null;

  const versionHistory = $('time').first().attr("datetime") || "";
  const lastUpdated = versionHistory || null;
  const daysSinceUpdate = lastUpdated ? daysBetween(lastUpdated) : null;

  return {
    name,
    description,
    descriptionLength: description.length,
    rating: rating && rating > 0 && rating <= 5 ? rating : null,
    ratingsCount: ratingsCount && ratingsCount > 0 ? ratingsCount : null,
    screenshotsCount,
    developerEmail,
    lastUpdated,
    daysSinceUpdate,
  };
}

export function parseAppPage(html: string, url: string): ParsedAppData {
  const store = detectStore(url);
  const parsed = store === "app_store" ? parseAppStore(html) : parseGooglePlay(html);
  return { store, ...parsed };
}
