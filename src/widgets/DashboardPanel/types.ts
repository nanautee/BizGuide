export type AppBlock = {
  name: string;
  store: "google_play" | "app_store";
  appUrl: string;
  score: number;
  issues: string[];
  recommendations: string[];
  checkedAt: string;
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
  startChecklist: string[];
  startOffer: string[];
  appBlock: AppBlock | null;
  isRealData: boolean;
};
