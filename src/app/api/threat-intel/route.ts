import { mapUrlhausResponse, normalizeLookupUrl } from "@/lib/urlhaus";
import type { ThreatIntelResult } from "@/types/url";

const URLHAUS_ENDPOINT = "https://urlhaus-api.abuse.ch/v1/url/";
const WINDOW_MS = 60_000;
const MAX_LOOKUPS_PER_WINDOW = 12;
const requests = new Map<string, { count: number; resetAt: number }>();

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function isRateLimited(request: Request): boolean {
  const now = Date.now();
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientKey = forwardedFor?.split(",")[0]?.trim() || "unknown";
  for (const [key, value] of requests) {
    if (value.resetAt <= now) requests.delete(key);
  }
  const current = requests.get(clientKey);
  if (!current || current.resetAt <= now) {
    requests.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (current.count >= MAX_LOOKUPS_PER_WINDOW) return true;
  current.count += 1;
  return false;
}

export async function POST(request: Request) {
  const checkedAt = new Date().toISOString();
  const authKey = process.env.URLHAUS_AUTH_KEY?.trim();

  if (!authKey) {
    const result: ThreatIntelResult = {
      provider: "URLhaus",
      status: "unconfigured",
      checkedAt,
      message: "Optional URLhaus checks are not configured yet. Set URLHAUS_AUTH_KEY on the server. Local URL analysis still works.",
    };
    return Response.json(result, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Send a JSON body containing a URL string.", 400);
  }

  const candidate = typeof body === "object" && body !== null && "url" in body && typeof body.url === "string"
    ? body.url
    : "";
  const url = normalizeLookupUrl(candidate);
  if (!url) {
    return jsonError("Enter a valid HTTP or HTTPS URL without embedded credentials. URLs over 2048 characters are not accepted.", 400);
  }

  if (isRateLimited(request)) {
    return jsonError("Too many reputation lookups. Wait a minute and try again.", 429);
  }

  try {
    const response = await fetch(URLHAUS_ENDPOINT, {
      method: "POST",
      headers: {
        "Auth-Key": authKey,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({ url }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      const unavailable: ThreatIntelResult = {
        provider: "URLhaus",
        status: "unavailable",
        checkedAt,
        message: "URLhaus is temporarily unavailable. Local URL analysis is still available.",
      };
      return Response.json(unavailable, { status: 502 });
    }

    const payload: unknown = await response.json();
    return Response.json(mapUrlhausResponse(payload, checkedAt), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    const unavailable: ThreatIntelResult = {
      provider: "URLhaus",
      status: "unavailable",
      checkedAt,
      message: timedOut
        ? "URLhaus did not respond within 8 seconds. Local URL analysis is still available."
        : "URLhaus could not be reached. Local URL analysis is still available.",
    };
    return Response.json(unavailable, { status: timedOut ? 504 : 502 });
  }
}
