import test from "node:test";
import assert from "node:assert/strict";
import { checkUrl } from "../src/lib/urlHeuristics.ts";

test("empty and malformed inputs are rejected", () => {
  assert.equal(checkUrl(""), null);
  assert.equal(checkUrl("   "), null);
  assert.equal(checkUrl("https://"), null);
  assert.equal(checkUrl("not a url"), null);
});

test("dangerous and non-web schemes are rejected before normalization", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "ftp://example.com/file",
  ]) {
    assert.equal(checkUrl(value), null, value);
  }
});

test("a normal HTTPS URL is parsed and includes limitations", () => {
  const result = checkUrl("https://example.com/contact");
  assert.ok(result);
  assert.equal(result.host, "example.com");
  assert.equal(result.normalizedUrl, "https://example.com/contact");
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.match(result.limitation, /cannot prove/i);
});

test("HTTP numeric-host URLs surface multiple relevant signals", () => {
  const result = checkUrl("http://192.0.2.10/login?otp=123456");
  assert.ok(result);
  assert.equal(result.riskLevel, "high");
  const ids = result.signals.map((signal) => signal.id);
  assert.ok(ids.includes("insecure"));
  assert.ok(ids.includes("ip-host"));
  assert.ok(ids.includes("sensitive-path"));
});

test("URL shorteners and brand-like hostnames are explained as signals", () => {
  const short = checkUrl("https://bit.ly/abc123");
  assert.ok(short?.signals.some((signal) => signal.id === "shortener"));

  const lookalike = checkUrl("https://paypal.com.attacker.example/login");
  assert.ok(lookalike);
  assert.ok(lookalike.signals.some((signal) => signal.id === "brand-lookalike"));
  assert.ok(lookalike.signals.some((signal) => signal.id === "sensitive-path"));
});

test("missing schemes are normalized to HTTPS", () => {
  const result = checkUrl("example.com/path");
  assert.ok(result);
  assert.equal(result.normalizedUrl, "https://example.com/path");
});
