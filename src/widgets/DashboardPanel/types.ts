export type AppBlock = {
  name: string;
  store: "google_play" | "app_store";
  appUrl: string;
  score: number;
  issues: string[];
  recommendations: string[];
  checkedAt: string;
};

export type VkMetricsBlock = {
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
};

export type SocialItemBlock = {
  platform: string;
  url: string;
  status: "ok" | "warning" | "error";
  score: number;
  issues: string[];
  recommendation: string;
  metrics?: VkMetricsBlock;
};

export type DashboardInitialData = {
  siteId: string;
  url: string;
  siteName: string;
  siteUrl: string;
  score: number;
  status: string;
  checkedAt: string | null;
  issues: string[];
  recommendations: string[];
  hasPreviousSnapshot: boolean;
  scoreDelta: number | null;
  socialScore: number | null;
  socialRecommendations: string[];
  socialItems: SocialItemBlock[];
  startChecklist: string[];
  startOffer: string[];
  appBlock: AppBlock | null;
  isRealData: boolean;
};
