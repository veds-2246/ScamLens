export type RiskLevel = "low" | "medium" | "high";

export type FindingSeverity = "low" | "medium" | "high";

export type Finding = {
  ruleId: string;
  title: string;
  matchedPhrase: string;
  explanation: string;
  severity: FindingSeverity;
  recommendedAction: string;
};

export type AnalysisResult = {
  riskLevel: RiskLevel;
  score: number;
  summary: string;
  findings: Finding[];
  nextSteps: string[];
  limitation: string;
};
