import type { AnalysisResult, RiskLevel } from "@/types/analysis";
import type { UrlCheckResult } from "@/types/url";

export type HistoryKind = "message" | "url";

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  createdAt: string;
  label: string;
  riskLevel: RiskLevel;
  score: number;
  result: AnalysisResult | UrlCheckResult;
  /** Deliberately optional: raw user input is not persisted by default. */
  input?: string;
};

export type QuizAttempt = {
  id: string;
  createdAt: string;
  score: number;
  total: number;
};
