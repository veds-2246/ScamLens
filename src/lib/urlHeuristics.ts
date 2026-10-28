import type { UrlCheckResult, UrlSignal } from "@/types/url";

const SHORTENERS = new Set(["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "cutt.ly", "rb.gy"]);
const RISKY_TLDS = new Set(["xyz", "top", "click", "zip", "mov", "tk", "ml", "ga", "cf", "gq", "rest", "buzz"]);
const BRANDS = ["paypal", "microsoft", "apple", "google", "amazon", "netflix", "whatsapp", "instagram", "bank"];
const SIGNALS: UrlSignal[] = [
  { id: "shortener", title: "Link shortener", explanation: "Short links hide their destination, making independent verification harder.", severity: "medium" },
  { id: "risky-tld", title: "Uncommon or abused domain ending", explanation: "This domain ending is frequently used in throwaway or impersonation links. It is not proof of fraud by itself.", severity: "medium" },
  { id: "subdomain", title: "Lookalike subdomain", explanation: "Several subdomains or brand-like words can make a link look official while the registrable domain belongs elsewhere.", severity: "medium" },
  { id: "at-symbol", title: "Deceptive @ character", explanation: "Everything before @ is ignored by browsers when choosing the host and may be used to imitate a trusted name.", severity: "high" },
  { id: "punycode", title: "Punycode domain", explanation: "Internationalised domains can use lookalike characters. Check the owner through a trusted bookmark.", severity: "high" },
  { id: "ip-host", title: "IP address instead of a domain", explanation: "Payment and login pages rarely need an unfamiliar numeric address. Treat it as untrusted.", severity: "high" },
  { id: "sensitive-path", title: "Sensitive action in the path", explanation: "Login, verification, payment, or account language raises the stakes if the destination is unexpected.", severity: "medium" },
  { id: "insecure", title: "No encrypted connection", explanation: "HTTP does not protect the connection from interception. Never enter private information on it.", severity: "high" },
  { id: "brand-lookalike", title: "Brand-like or misspelled host", explanation: "This host resembles a well-known brand or contains a common typo. Confirm the registrable domain through a trusted bookmark.", severity: "high" },
  { id: "obscured-host", title: "Unusually long or encoded address", explanation: "Long hosts, encoded characters, or repeated separators can obscure who controls the destination.", severity: "medium" },
];

function signal(id: string) { return SIGNALS.find((item) => item.id === id)!; }

export function checkUrl(input: string): UrlCheckResult | null {
  const raw = input.trim();
  if (!raw) return null;
  // Reject dangerous/non-web schemes before adding a default protocol.
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let parsed: URL;
  try { parsed = new URL(candidate); } catch { return null; }
  if (!parsed.hostname || !parsed.host.includes(".")) return null;
  const host = parsed.hostname.toLowerCase();
  const signals: UrlSignal[] = [];
  const add = (id: string) => { if (!signals.some((item) => item.id === id)) signals.push(signal(id)); };
  if (SHORTENERS.has(host)) add("shortener");
  if (RISKY_TLDS.has(host.split(".").pop() ?? "")) add("risky-tld");
  if (parsed.username || parsed.password) add("at-symbol");
  if (host.includes("xn--")) add("punycode");
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) add("ip-host");
  if (parsed.protocol !== "https:") add("insecure");
  if (BRANDS.some((brand) => host.includes(brand) && host !== `${brand}.com` && host !== `${brand}.co.uk`)) add("brand-lookalike");
  if (host.length > 45 || /%[0-9a-f]{2}/i.test(parsed.href) || /-{2,}|\d{5,}/.test(host)) add("obscured-host");
  if ((parsed.pathname + parsed.search).match(/\b(?:login|signin|verify|payment|wallet|password|account|otp)\b/i)) add("sensitive-path");
  if (host.split(".").length > 3 || /(?:secure|login|verify|support|account|update|bank)-/i.test(host)) add("subdomain");
  const score = Math.min(100, signals.reduce((sum, item) => sum + (item.severity === "high" ? 30 : item.severity === "medium" ? 18 : 8), 0));
  const riskLevel = score >= 55 ? "high" : score >= 25 ? "medium" : "low";
  return {
    kind: "url", url: raw, normalizedUrl: parsed.toString(), host, score, riskLevel,
    summary: signals.length ? `This address has ${signals.length} signal${signals.length === 1 ? "" : "s"} worth checking before you open it.` : "No obvious structural warning signs were found in this address.",
    signals, nextSteps: ["Do not log in or pay from an unexpected link.", "Open the organisation's app or type a trusted address yourself.", "If you are unsure, ask the supposed sender through a separate channel."],
    limitation: "This is a local structure check, not a reputation or malware scan. A clean result cannot prove that a website is safe.",
  };
}
