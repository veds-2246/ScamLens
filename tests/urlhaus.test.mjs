import test from "node:test";
import assert from "node:assert/strict";
import { mapUrlhausResponse, normalizeLookupUrl } from "../src/lib/urlhaus.ts";

test("only valid HTTP and HTTPS URLs without embedded credentials are eligible", () => {
  assert.equal(normalizeLookupUrl("https://example.com/path?x=1"), "https://example.com/path?x=1");
  assert.equal(normalizeLookupUrl("http://example.com"), "http://example.com/");
  assert.equal(normalizeLookupUrl("javascript:alert(1)"), null);
  assert.equal(normalizeLookupUrl("ftp://example.com/file"), null);
  assert.equal(normalizeLookupUrl("https://user:password@example.com"), null);
  assert.equal(normalizeLookupUrl(`https://example.com/${"a".repeat(2049)}`), null);
});

test("a URLhaus match includes provider evidence but no raw query URL", () => {
  const result = mapUrlhausResponse({
    query_status: "ok",
    url_status: "online",
    threat: "malware_download",
    date_added: "2026-10-20 12:00:00 UTC",
    tags: ["exe", "payload", 42],
  }, "2026-10-28T10:00:00.000Z");
  assert.equal(result.status, "match");
  assert.equal(result.provider, "URLhaus");
  assert.equal(result.threat, "malware_download");
  assert.deepEqual(result.tags, ["exe", "payload"]);
  assert.match(result.message, /do not open/i);
});

test("no match explicitly does not imply a safe URL", () => {
  const result = mapUrlhausResponse({ query_status: "no_results" }, "2026-10-28T10:00:00.000Z");
  assert.equal(result.status, "no_match");
  assert.match(result.message, /does not prove.*safe/i);
});

test("provider errors fail closed to unavailable instead of safe", () => {
  const result = mapUrlhausResponse({ query_status: "invalid_auth_key" }, "2026-10-28T10:00:00.000Z");
  assert.equal(result.status, "unavailable");
  assert.match(result.message, /URLHAUS_AUTH_KEY/);
});
