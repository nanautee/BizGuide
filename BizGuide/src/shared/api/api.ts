export interface AnalysisIssueDTO {
  code: string;
  message: string;
  level: "low" | "medium" | "high";
  penalty: number;
}

export interface AnalyzeResponse {
  siteId: string;
  normalizedUrl: string;
  score: number;
  issues: AnalysisIssueDTO[];
  recommendations: string[];
  checkedAt: string;
  monitoring: {
    hasPreviousSnapshot: boolean;
    scoreDelta: number | null;
  };
}

export interface StartBusinessResponse {
  niche: string;
  checklist: string[];
  commercialOffer: string[];
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function analyzeSite(url: string): Promise<AnalyzeResponse> {
  return request<AnalyzeResponse>("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function startBusiness(niche: string): Promise<StartBusinessResponse> {
  return request<StartBusinessResponse>("/api/start", {
    method: "POST",
    body: JSON.stringify({ niche }),
  });
}

export interface SocialLinkPayload {
  platform: "vk" | "tg" | "yandex_zen";
  url: string;
  active: boolean;
  followers?: number;
  contacts?: string;
}

export interface VkGroupMetricsDTO {
  name: string;
  screenName: string;
  membersCount: number;
  description: string;
  status: string;
  verified: boolean;
  hasCover: boolean;
  hasPhoto: boolean;
  siteUrl: string | null;
  contacts: { desc: string; email?: string }[];
  tabs: { name: string; count: number }[];
  wallPosts: number;
  videos: number;
  photos: number;
  articles: number;
  clips: number;
  isClosed: boolean;
  type: string;
}

export interface ZenChannelMetricsDTO {
  name: string;
  subscribers: number;
  postsLast30Days: number;
  viewsLast30Days: number;
  likesLast30Days: number;
  verified: boolean;
  hasLogo: boolean;
}

export interface SocialAnalysisItem {
  platform: string;
  url: string;
  status: "ok" | "warning" | "error";
  score: number;
  issues: string[];
  recommendation: string;
  metrics?: VkGroupMetricsDTO | ZenChannelMetricsDTO;
}

export interface SocialAnalyzeResponse {
  score: number;
  items: SocialAnalysisItem[];
  recommendations: string[];
}

export function analyzeSocial(
  siteId: string,
  socialLinks: SocialLinkPayload[],
): Promise<SocialAnalyzeResponse> {
  return request<SocialAnalyzeResponse>("/api/social", {
    method: "POST",
    body: JSON.stringify({ siteId, socialLinks }),
  });
}

export interface AppAnalyzeResponse {
  appUrl: string;
  store: "google_play" | "app_store";
  name: string;
  score: number;
  issues: { code: string; message: string; level: string; penalty: number }[];
  recommendations: string[];
  checkedAt: string;
}

export function analyzeApp(url: string, siteId?: string): Promise<AppAnalyzeResponse> {
  return request<AppAnalyzeResponse>("/api/app", {
    method: "POST",
    body: JSON.stringify({ url, siteId }),
  });
}
