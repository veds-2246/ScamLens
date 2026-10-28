import type { ThreatIntelResult } from "@/types/url";

export type UrlhausLookupPayload = {
  query_status?: unknown;
  url_status?: unknown;
  threat?: unknown;
  date_added?: unknown;
  tags?: unknown;
};

export function normalizeLookupUrl(input: string): string | null {
  if (!input || input.length > 2048) return null;
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    if (!parsed.hostname || parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function mapUrlhausResponse(payload: unknown, checkedAt = new Date().toISOString()): ThreatIntelResult {
  const data = typeof payload === "object" && payload !== null ? payload as UrlhausLookupPayload : {};
  const status = typeof data.query_status === "string" ? data.query_status : "unknown";
  const urlStatus = typeof data.url_status === "string" ? data.url_status : undefined;
  const threat = typeof data.threat === "string" ? data.threat : undefined;
  const dateAdded = typeof data.date_added === "string" ? data.date_added : undefined;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 10)
    : undefined;

  if (status === "ok") {
    return {
      provider: "URLhaus",
      status: "match",
      checkedAt,
      message: "URLhaus has a record for this URL in its malware-distribution database. Treat the link as dangerous and do not open it.",
      ...(urlStatus ? { urlStatus } : {}),
      ...(threat ? { threat } : {}),
      ...(dateAdded ? { dateAdded } : {}),
      ...(tags?.length ? { tags } : {}),
    };
  }

  if (status === "no_results") {
    return {
      provider: "URLhaus",
      status: "no_match",
      checkedAt,
      message: "URLhaus returned no matching record. This only means it was not found in this provider's malware URL dataset; it does not prove the URL is safe.",
    };
  }

  return {
    provider: "URLhaus",
    status: "unavailable",
    checkedAt,
    message: status === "invalid_auth_key"
      ? "URLhaus rejected the server's API key. Check URLHAUS_AUTH_KEY in the deployment environment."
      : "URLhaus could not complete the reputation lookup. Local URL analysis is still available.",
  };
}
