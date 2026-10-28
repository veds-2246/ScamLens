import type { RiskLevel } from "@/types/analysis";

export type UrlSignal = {
  id: string;
  title: string;
  explanation: string;
  severity: "low" | "medium" | "high";
};

export type ThreatIntelStatus = "match" | "no_match" | "unconfigured" | "unavailable";

export type ThreatIntelResult = {
  provider: "URLhaus";
  status: ThreatIntelStatus;
  checkedAt: string;
  message: string;
  urlStatus?: string;
  threat?: string;
  dateAdded?: string;
  tags?: string[];
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
  threatIntel?: ThreatIntelResult;
};
