import test from "node:test";
import assert from "node:assert/strict";
import {
  clearHistory,
  deleteHistory,
  getHistory,
  getQuizAttempts,
  saveHistory,
  saveQuizAttempt,
} from "../src/lib/localStorage.ts";

function installFakeWindow(initial = new Map(), shouldThrow = false) {
  const values = initial;
  const events = [];
  globalThis.window = {
    localStorage: {
      getItem(key) {
        if (shouldThrow) throw new Error("storage unavailable");
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        if (shouldThrow) throw new Error("quota exceeded");
        values.set(key, String(value));
      },
      removeItem(key) {
        if (shouldThrow) throw new Error("storage unavailable");
        values.delete(key);
      },
    },
    dispatchEvent(event) {
      events.push(event.type);
      return true;
    },
  };
  return { values, events };
}

function messageEntry(id, message) {
  return {
    id,
    kind: "message",
    createdAt: "2026-10-28T10:00:00.000Z",
    label: "Message analysis",
    riskLevel: "high",
    score: 76,
    input: message,
    result: {
      riskLevel: "high",
      score: 76,
      summary: "Credential request and urgency detected.",
      findings: [{
        ruleId: "credential_request",
        title: "Request for secrets",
        matchedPhrase: message,
        explanation: "Keep credentials private.",
        severity: "high",
        recommendedAction: "Do not share codes.",
      }],
      nextSteps: ["Verify independently."],
      limitation: "A missing signal does not prove safety.",
    },
  };
}

test("message content is not persisted by default, including matched evidence", () => {
  const { values } = installFakeWindow();
  const secret = "My private message includes unique-phrase-otp-99318";
  saveHistory(messageEntry("message-1", secret));

  const raw = values.get("scamlens.history.v1");
  assert.ok(raw);
  assert.equal(raw.includes(secret), false);
  const saved = getHistory()[0];
  assert.equal(saved.input, undefined);
  assert.equal(saved.result.findings[0].matchedPhrase, "[redacted]");
});

test("URL history redacts the submitted URL and query string by default", () => {
  const { values } = installFakeWindow();
  const entry = {
    id: "url-1",
    kind: "url",
    createdAt: "2026-10-28T10:00:00.000Z",
    label: "example.com",
    riskLevel: "medium",
    score: 30,
    result: {
      kind: "url",
      url: "https://example.com/reset?token=secret-99318",
      normalizedUrl: "https://example.com/reset?token=secret-99318",
      host: "example.com",
      riskLevel: "medium",
      score: 30,
      summary: "Check this address.",
      signals: [],
      nextSteps: ["Verify independently."],
      limitation: "A clean result does not prove safety.",
    },
  };
  saveHistory(entry);
  const raw = values.get("scamlens.history.v1");
  assert.ok(raw);
  assert.equal(raw.includes("secret-99318"), false);
  assert.equal(getHistory()[0].result.url, "[redacted]");
  assert.equal(getHistory()[0].result.normalizedUrl, "https://example.com/");
});

test("history supports deletion and clearing", () => {
  installFakeWindow();
  saveHistory(messageEntry("one", "first"));
  saveHistory(messageEntry("two", "second"));
  assert.equal(getHistory().length, 2);
  deleteHistory("one");
  assert.deepEqual(getHistory().map((entry) => entry.id), ["two"]);
  clearHistory();
  assert.deepEqual(getHistory(), []);
});

test("malformed stored JSON and storage failures fall back safely", () => {
  const { values } = installFakeWindow();
  values.set("scamlens.history.v1", "{not-json");
  assert.deepEqual(getHistory(), []);

  installFakeWindow(new Map(), true);
  assert.doesNotThrow(() => saveHistory(messageEntry("unavailable", "private")));
  assert.deepEqual(getHistory(), []);
  assert.doesNotThrow(() => clearHistory());
});

test("quiz attempts persist and remain bounded to validated records", () => {
  installFakeWindow();
  saveQuizAttempt({ id: "attempt-1", createdAt: "2026-10-28T10:00:00.000Z", score: 4, total: 5 });
  assert.equal(getQuizAttempts().length, 1);
  assert.equal(getQuizAttempts()[0].score, 4);
});
