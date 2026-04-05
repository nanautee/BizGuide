export type AppStore = "google_play" | "app_store";

export interface ParsedAppData {
  store: AppStore;
  name: string;
  description: string;
  descriptionLength: number;
  rating: number | null;
  ratingsCount: number | null;
  screenshotsCount: number;
  developerEmail: string | null;
  lastUpdated: string | null;
  daysSinceUpdate: number | null;
}

export interface AppAnalysisIssue {
  code: string;
  message: string;
  level: "low" | "medium" | "high";
  penalty: number;
}

export interface AppAnalysisResult {
  appUrl: string;
  store: AppStore;
  name: string;
  score: number;
  issues: AppAnalysisIssue[];
  recommendations: string[];
  checkedAt: string;
  parsed: ParsedAppData;
}
