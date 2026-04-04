import { SEO_CONSTANTS } from "@/shared/config/constants";
import type { AnalysisIssue } from "@/entities/site/types";

export function calculateScore(issues: AnalysisIssue[]): number {
  const totalPenalty = issues.reduce((sum, item) => sum + item.penalty, 0);
  const boundedPenalty = Math.min(totalPenalty, SEO_CONSTANTS.maxPenalty);
  const score = 100 - boundedPenalty;
  return Math.max(0, Math.min(100, score));
}
