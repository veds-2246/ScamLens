export type RiskLevel = "low" | "medium" | "high";

export type AnalysisResult = {
  riskLevel: RiskLevel;
  score: number;
  summary: string;
};
