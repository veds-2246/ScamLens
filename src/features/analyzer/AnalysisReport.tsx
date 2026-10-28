import Badge from "@/components/Badge";
import type { AnalysisResult, FindingSeverity, RiskLevel } from "@/types/analysis";

const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Lower signal",
  medium: "Elevated signal",
  high: "High signal",
};

const BADGE_TONE: Record<FindingSeverity, "teal" | "warning" | "high"> = {
  low: "teal",
  medium: "warning",
  high: "high",
};

type AnalysisReportProps = {
  result: AnalysisResult;
};

export default function AnalysisReport({ result }: AnalysisReportProps) {
  return (
    <div className="report-stack">
      <div className="score-row">
        <div>
          <p className={`score-value risk-${result.riskLevel}`}>{result.score}</p>
          <p className="supporting-text">Risk score / 100</p>
        </div>
        <Badge tone={BADGE_TONE[result.riskLevel]}>{RISK_LABEL[result.riskLevel]}</Badge>
      </div>
      <p className="body-copy">{result.summary}</p>
      <section className="report-section" aria-labelledby="evidence-heading">
        <h3 id="evidence-heading">Evidence</h3>
        {result.findings.length === 0 ? (
          <p className="supporting-text">No matching phrases from the current rule set. Absence of hits is not a clearance.</p>
        ) : (
          <ul className="findings-list">
            {result.findings.map((finding) => (
              <li className="finding-item" key={finding.ruleId}>
                <div className="finding-header">
                  <p className="finding-title">{finding.title}</p>
                  <Badge tone={BADGE_TONE[finding.severity]}>{finding.severity}</Badge>
                </div>
                <p className="matched-phrase">{finding.matchedPhrase}</p>
                <p className="supporting-text">{finding.explanation}</p>
                <p className="body-copy">{finding.recommendedAction}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="report-section" aria-labelledby="next-steps-heading">
        <h3 id="next-steps-heading">Safe next steps</h3>
        <ol className="next-steps">
          {result.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <p className="limitation-note">{result.limitation}</p>
    </div>
  );
}
