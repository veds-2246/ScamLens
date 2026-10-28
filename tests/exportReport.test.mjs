import test from "node:test";
import assert from "node:assert/strict";
import { reportText } from "../src/lib/exportReport.ts";

test("message reports include evidence, risk and limitation", () => {
  const report = reportText({
    id: "report-1",
    kind: "message",
    createdAt: "2026-10-28T10:00:00.000Z",
    label: "Message analysis",
    riskLevel: "high",
    score: 76,
    result: {
      riskLevel: "high",
      score: 76,
      summary: "Credential request detected.",
      findings: [{
        ruleId: "credential_request",
        title: "Request for secrets",
        matchedPhrase: "[redacted]",
        explanation: "Codes must remain private.",
        severity: "high",
        recommendedAction: "Do not share codes.",
      }],
      nextSteps: ["Verify independently."],
      limitation: "This is a heuristic result, not proof.",
      threatIntel: {
        provider: "URLhaus",
        status: "match",
        checkedAt: "2026-10-28T10:00:00.000Z",
        message: "URLhaus has a record for this URL.",
        threat: "malware_download",
        tags: ["exe"],
      },
    },
  });
  assert.match(report, /ScamLens message report/);
  assert.match(report, /Risk: high \(76\/100\)/);
  assert.match(report, /Request for secrets/);
  assert.match(report, /\[redacted\]/);
  assert.match(report, /not proof/i);
  assert.match(report, /External reputation: URLhaus \/ match/);
  assert.match(report, /malware_download/);
});
