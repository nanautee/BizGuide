export interface ParsedSiteData {
  title: string;
  metaDescription: string;
  h1: string;
  textLength: number;
  totalImages: number;
  imagesWithAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasContacts: boolean;
}

export type AnalysisIssueLevel = "low" | "medium" | "high";

export interface AnalysisIssue {
  code: string;
  message: string;
  level: AnalysisIssueLevel;
  penalty: number;
}

export interface SiteAnalysisResult {
  siteId: string;
  normalizedUrl: string;
  score: number;
  issues: AnalysisIssue[];
  recommendations: string[];
  checkedAt: string;
  monitoring: {
    hasPreviousSnapshot: boolean;
    scoreDelta: number | null;
  };
}
