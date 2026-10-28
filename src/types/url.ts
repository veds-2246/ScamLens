import type { RiskLevel } from "@/types/analysis";

export type UrlSignal = {
  id: string;
  title: string;
  explanation: string;
  severity: "low" | "medium" | "high";
};

export type UrlCheckResult = {
  kind: "url";
  url: string;
  normalizedUrl: string;
  host: string;
  riskLevel: RiskLevel;
  score: number;
  summary: string;
  signals: UrlSignal[];
  nextSteps: string[];
  limitation: string;
};
