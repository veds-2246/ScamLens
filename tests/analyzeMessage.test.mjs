import test from "node:test";
import assert from "node:assert/strict";
import { analyzeMessage, scoreFindings } from "../src/lib/analyzeMessage.ts";

test("empty and whitespace-only messages return null", () => {
  assert.equal(analyzeMessage(""), null);
  assert.equal(analyzeMessage("   \n  "), null);
});

test("ordinary conversation does not trigger unrelated scam findings", () => {
  const result = analyzeMessage("Hey, are we still meeting at 5 PM?");
  assert.ok(result);
  assert.equal(result.riskLevel, "low");
  assert.equal(result.score, 0);
  assert.deepEqual(result.findings, []);
  assert.match(result.limitation, /does not prove/i);
});

test("credential requests, urgency and payment pressure are surfaced", () => {
  const result = analyzeMessage("URGENT: Your account will be blocked in 10 minutes. Share your OTP and pay now.");
  assert.ok(result);
  assert.equal(result.riskLevel, "high");
  const ids = result.findings.map((finding) => finding.ruleId);
  assert.ok(ids.includes("urgency"));
  assert.ok(ids.includes("credential_request"));
  assert.ok(ids.includes("payment_pressure"));
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.nextSteps.length > 0);
});

test("risk scores are bounded and duplicate rule IDs are counted once", () => {
  const finding = {
    ruleId: "credential_request",
    title: "Credential request",
    matchedPhrase: "OTP",
    explanation: "Keep codes private.",
    severity: "high",
    recommendedAction: "Do not share codes.",
  };
  const result = scoreFindings([finding, finding]);
  assert.equal(result.score, 38);
  assert.equal(result.riskLevel, "medium");
  assert.ok(result.score >= 0 && result.score <= 100);
});
