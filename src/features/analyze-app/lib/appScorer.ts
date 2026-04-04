import type { AppAnalysisIssue } from "@/entities/app";

const MAX_PENALTY = 100;

export function calculateAppScore(issues: AppAnalysisIssue[]): number {
  const totalPenalty = issues.reduce((sum, item) => sum + item.penalty, 0);
  const bounded = Math.min(totalPenalty, MAX_PENALTY);
  return Math.max(0, Math.min(100, 100 - bounded));
}
