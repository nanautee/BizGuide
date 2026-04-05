export type SocialPlatform = "vk" | "tg" | "yandex_zen";

export interface SocialLinkInput {
  platform: SocialPlatform;
  url: string;
  active: boolean;
  followers?: number;
  contacts?: string;
}

/** Метрики канала Яндекс Дзен за последние 30 дней (по данным export API). */
export interface ZenChannelMetrics {
  name: string;
  subscribers: number;
  postsLast30Days: number;
  viewsLast30Days: number;
  likesLast30Days: number;
  verified: boolean;
  hasLogo: boolean;
}

export interface VkGroupMetrics {
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

export interface SocialLinkAnalysis {
  platform: SocialPlatform;
  url: string;
  status: "ok" | "warning" | "error";
  score: number;
  issues: string[];
  recommendation: string;
  metrics?: VkGroupMetrics | ZenChannelMetrics;
}
