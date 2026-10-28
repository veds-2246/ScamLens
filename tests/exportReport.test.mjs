import test from "node:test";
import assert from "node:assert/strict";
import { reportText, safeReportForExport } from "../src/lib/exportReport.ts";

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

test("JSON export preparation excludes message content and sensitive URL query strings", () => {
  const message = safeReportForExport({
    id: "message-private",
    kind: "message",
    createdAt: "2026-10-28T10:00:00.000Z",
    label: "Message analysis",
    riskLevel: "high",
    score: 80,
    input: "private message with secret-token-12345",
    result: {
      riskLevel: "high",
      score: 80,
      summary: "A warning was detected.",
      findings: [{
        ruleId: "credential_request",
        title: "Credential request",
        matchedPhrase: "secret-token-12345",
        explanation: "Keep credentials private.",
        severity: "high",
        recommendedAction: "Do not share codes.",
      }],
      nextSteps: [],
      limitation: "Heuristic only.",
    },
  });
  const messageJson = JSON.stringify(message);
  assert.equal(messageJson.includes("secret-token-12345"), false);
  assert.equal(message.input, undefined);

  const url = safeReportForExport({
    id: "url-private",
    kind: "url",
    createdAt: "2026-10-28T10:00:00.000Z",
    label: "example.com",
    riskLevel: "medium",
    score: 30,
    result: {
      kind: "url",
      url: "https://example.com/reset?token=secret-12345",
      normalizedUrl: "https://example.com/reset?token=secret-12345",
      host: "example.com",
      riskLevel: "medium",
      score: 30,
      summary: "Check the link.",
      signals: [],
      nextSteps: [],
      limitation: "Heuristic only.",
    },
  });
  const urlJson = JSON.stringify(url);
  assert.equal(urlJson.includes("secret-12345"), false);
  assert.equal(url.result.url, "https://example.com/reset");
  assert.equal(url.result.normalizedUrl, "https://example.com/reset");
});
