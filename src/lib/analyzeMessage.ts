import type { AnalysisResult, Finding, FindingSeverity, RiskLevel } from "@/types/analysis";

export const ANALYSIS_LIMITATION =
  "This report flags language patterns only. Missing warning signs does not prove a message is legitimate. Verify unexpected requests through a trusted official channel you already know, not through details in the message.";

const SEVERITY_WEIGHT: Record<FindingSeverity, number> = {
  low: 14,
  medium: 24,
  high: 38,
};

const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const URL_LIKE =
  /(?:https?:\/\/[^\s<>"']+)|(?:www\.[^\s<>"']+)|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+\.?(?:\/[^\s<>"']*)?)/gi;

const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rb.gy",
  "tiny.cc",
]);

const SUSPICIOUS_TLDS = new Set([
  "xyz",
  "top",
  "click",
  "zip",
  "mov",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "example",
  "test",
  "link",
  "rest",
  "country",
  "buzz",
  "work",
]);

type DetectionRule = {
  id: string;
  title: string;
  severity: FindingSeverity;
  explanation: string;
  recommendedAction: string;
  patterns?: readonly RegExp[];
  match?: (message: string) => string | null;
};

export const DETECTION_RULES: readonly DetectionRule[] = [
  {
    id: "urgency",
    title: "Artificial urgency",
    severity: "medium",
    explanation: "The message pushes you to act before you can think or check. Scammers use deadlines and ‘act now’ language to short-circuit caution.",
    recommendedAction: "Give yourself time. A genuine organisation rarely needs an instant reply.",
    patterns: [
      /\burgent(?:ly)?\b/i,
      /\bimmediately\b/i,
      /\basap\b/i,
      /\bact now\b/i,
      /\bright now\b/i,
      /\bdo it now\b/i,
      /\btoday'?s deadline\b/i,
      /\bbefore (?:today'?s|the) deadline\b/i,
      /\bwithin \d+\s*(?:hour|hr|minute|min|day)s?\b/i,
      /\bexpires?(?:\s+today|\s+soon|\s+tonight)?\b/i,
      /\blimited time\b/i,
      /\bfinal (?:notice|warning|chance)\b/i,
      /\blast chance\b/i,
      /\brespond (?:immediately|now|today)\b/i,
      /\bdon'?t delay\b/i,
      /\bact fast\b/i,
      /\bbefore (?:it'?s|its) too late\b/i,
    ],
  },
  {
    id: "threats",
    title: "Threats or punishment",
    severity: "high",
    explanation: "Fear of losing access, money, or legal standing is a common pressure tactic. Legitimate notices still leave a way to verify independently.",
    recommendedAction: "Do not respond to threats. Check the claim through an official channel you look up yourself.",
    patterns: [
      /\b(?:will be |to be )?(?:permanently )?(?:closed|suspended|locked|terminated|disabled|deleted|blocked)\b/i,
      /\blegal action\b/i,
      /\barrest(?:ed| warrant)?\b/i,
      /\bwarrant\b/i,
      /\bfine\b/i,
      /\bprosecut(?:e|ion)\b/i,
      /\bpolice\b/i,
      /\bconsequences\b/i,
      /\baccount (?:will be|has been|is being) (?:closed|suspended|locked|blocked)\b/i,
      /\bunless you (?:pay|respond|verify|confirm)\b/i,
    ],
  },
  {
    id: "impersonation",
    title: "Possible impersonation",
    severity: "medium",
    explanation: "The wording borrows authority from a bank, school, courier, tech brand, or support team. Names and job titles in a message are easy to fake.",
    recommendedAction: "Ignore in-message branding. Contact the organisation using a number or website you already trust.",
    patterns: [
      /\b(?:your )?(?:bank|irs|hmrc|microsoft|apple|google|amazon|paypal|netflix|facebook|whatsapp|instagram)\b/i,
      /\bit department\b/i,
      /\bsupport team\b/i,
      /\bhelp desk\b/i,
      /\bofficial (?:notice|alert|warning|message)\b/i,
      /\bstudent account\b/i,
      /\bschool (?:account|admin|office)\b/i,
      /\b(?:parcel|package) is waiting\b/i,
      /\bdelivery (?:details|update|service|partner|attempt)\b/i,
      /\bcustoms?\b/i,
      /\bfrom (?:the )?(?:principal|dean|manager|ceo|director)\b/i,
      /\byour (?:courier|shipping) (?:partner|service)\b/i,
    ],
  },
  {
    id: "credential_request",
    title: "Request for secrets or personal details",
    severity: "high",
    explanation: "Asking for OTPs, passwords, PINs, or identity details by message is a classic takeover move. Those codes are meant to stay with you.",
    recommendedAction: "Never send passwords, OTPs, PINs, or ID scans in reply. A real service will not need them this way.",
    patterns: [
      /\botp\b/i,
      /\bone[ -]?time (?:code|password|pin|passcode)\b/i,
      /\bverification code\b/i,
      /\bsecurity code\b/i,
      /\bpassword\b/i,
      /\bpasscode\b/i,
      /\bpin\b/i,
      /\bcvv\b/i,
      /\bcvc\b/i,
      /\bsocial security\b/i,
      /\bssn\b/i,
      /\baadhaar\b/i,
      /\bkyc\b/i,
      /\bconfirm your (?:password|login|credentials|identity)\b/i,
      /\bsend (?:me |us )?(?:your )?(?:details|password|otp|pin|code)\b/i,
      /\bshare (?:your )?(?:otp|password|pin|code|details)\b/i,
    ],
  },
  {
    id: "payment_pressure",
    title: "Payment or money-move pressure",
    severity: "high",
    explanation: "Requests to pay quickly, use gift cards, crypto, or informal transfers are hard to reverse. Scammers prefer channels with weak buyer protection.",
    recommendedAction: "Do not pay, transfer money, or buy gift cards because a message told you to. Use official billing pages you navigate to yourself.",
    patterns: [
      /\bgift cards?\b/i,
      /\bwired? transfer\b/i,
      /\bwestern union\b/i,
      /\bbitcoin\b/i,
      /\bcrypto(?:currency)?\b/i,
      /\bpay now\b/i,
      /\bsend (?:money|payment|cash|funds)\b/i,
      /\btransfer (?:money|funds|payment)\b/i,
      /\bupi\b/i,
      /\biTunes card\b/i,
      /\bgoogle play card\b/i,
      /\bsteam card\b/i,
      /\bpay(?:ment)? (?:immediately|today|now)\b/i,
      /\boutstanding (?:balance|payment|fee)\b/i,
    ],
  },
  {
    id: "suspicious_url",
    title: "Suspicious link or web address",
    severity: "high",
    explanation: "Odd domains, short links, or ‘click here’ prompts can send you to a lookalike site. A real organisation does not need you to use a mystery address.",
    recommendedAction: "Do not open the link. Type a known official address yourself or use a saved bookmark.",
    match: findSuspiciousLinkPhrase,
  },
  {
    id: "prize_refund_bait",
    title: "Prize, reward, or refund bait",
    severity: "medium",
    explanation: "Unexpected winnings, rewards, or fast refunds are used to make you share details or click before checking. Genuine prizes are rarely sprung on you by cold message.",
    recommendedAction: "Treat unsolicited prizes and refunds as suspicious until you verify them on an official channel you already use.",
    patterns: [
      /\byou(?:'ve| have) (?:been )?selected\b/i,
      /\byou(?:'ve| have) won\b/i,
      /\bcongratulations\b/i,
      /\breward\b/i,
      /\bprize\b/i,
      /\blottery\b/i,
      /\bjackpot\b/i,
      /\bfree gift\b/i,
      /\bclaim (?:it|your|now|the)\b/i,
      /\brefund\b/i,
      /\bcashback\b/i,
      /\byou are a winner\b/i,
    ],
  },
];

const DEFAULT_NEXT_STEPS = [
  "Pause before you reply, click, or pay. Pressure is a reason to slow down, not speed up.",
  "Contact the organisation using a phone number or website you already trust, not one from the message.",
  "Never share passwords, OTPs, card numbers, or copies of ID in a reply.",
];

function firstPatternMatch(message: string, patterns: readonly RegExp[]): string | null {
  let earliest: { index: number; text: string } | null = null;

  for (const pattern of patterns) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const regex = new RegExp(pattern.source, flags);
    const match = regex.exec(message);
    if (!match?.[0]) continue;
    if (!earliest || match.index < earliest.index) {
      earliest = { index: match.index, text: match[0] };
    }
  }

  return earliest ? tidyPhrase(earliest.text) : null;
}

function tidyPhrase(phrase: string): string {
  return phrase.replace(/\s+/g, " ").trim().slice(0, 120);
}

function stripTrailingPunctuation(value: string): string {
  return value.replace(/[.,;:!?)\]]+$/g, "");
}

function hostnameFromToken(token: string): { host: string; protocol: string | null } | null {
  const raw = stripTrailingPunctuation(token);
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      return { host: url.hostname, protocol: url.protocol };
    }
    if (raw.toLowerCase().startsWith("www.")) {
      const url = new URL(`https://${raw}`);
      return { host: url.hostname, protocol: null };
    }
  } catch {
    return null;
  }

  const host = raw.split("/")[0]?.split("?")[0] ?? "";
  if (!host.includes(".")) return null;
  return { host, protocol: null };
}

function isSuspiciousHost(host: string, protocol: string | null): boolean {
  const normalized = host.replace(/\.$/, "").replace(/^www\./i, "").toLowerCase();
  if (protocol === "http:") return true;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) return true;
  if (SHORTENER_HOSTS.has(normalized)) return true;
  if (normalized.includes("@")) return true;

  const labels = normalized.split(".");
  const tld = labels.at(-1) ?? "";
  if (SUSPICIOUS_TLDS.has(tld)) return true;

  const sld = labels.slice(0, -1).join(".");
  const hyphenCount = (sld.match(/-/g) ?? []).length;
  if (hyphenCount >= 1 && SUSPICIOUS_TLDS.has(tld)) return true;
  if (hyphenCount >= 2) return true;
  if (labels.length >= 4) return true;
  return false;
}

function findSuspiciousUrlToken(message: string): string | null {
  const regex = new RegExp(URL_LIKE.source, "gi");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(message))) {
    const token = stripTrailingPunctuation(match[0]);
    const parsed = hostnameFromToken(token);
    if (!parsed) continue;
    if (isSuspiciousHost(parsed.host, parsed.protocol)) {
      return tidyPhrase(token);
    }
  }
  return null;
}

function findSuspiciousLinkPhrase(message: string): string | null {
  const url = findSuspiciousUrlToken(message);
  if (url) return url;
  return firstPatternMatch(message, [
    /\bclick (?:here|below|this link)\b/i,
    /\btap (?:the )?link\b/i,
    /\blog[- ]?in here\b/i,
    /\bopen (?:this|the) link\b/i,
  ]);
}

function collectFindings(message: string): Finding[] {
  const findings: Finding[] = [];
  const usedRules = new Set<string>();
  const usedPhrases = new Set<string>();

  for (const rule of DETECTION_RULES) {
    if (usedRules.has(rule.id)) continue;
    const matchedPhrase = rule.match ? rule.match(message) : firstPatternMatch(message, rule.patterns ?? []);
    if (!matchedPhrase) continue;

    const phraseKey = matchedPhrase.toLowerCase();
    if (usedPhrases.has(phraseKey)) continue;

    usedRules.add(rule.id);
    usedPhrases.add(phraseKey);
    findings.push({
      ruleId: rule.id,
      title: rule.title,
      matchedPhrase,
      explanation: rule.explanation,
      severity: rule.severity,
      recommendedAction: rule.recommendedAction,
    });
  }

  return findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

export function scoreFindings(findings: readonly Finding[]): { score: number; riskLevel: RiskLevel } {
  const unique = new Map<string, Finding>();
  for (const finding of findings) {
    if (!unique.has(finding.ruleId)) unique.set(finding.ruleId, finding);
  }

  const uniqueFindings = [...unique.values()];
  let score = uniqueFindings.reduce((total, finding) => total + SEVERITY_WEIGHT[finding.severity], 0);

  if (uniqueFindings.length >= 3) {
    score += 8;
  }

  score = Math.max(0, Math.min(100, score));

  const highCount = uniqueFindings.filter((finding) => finding.severity === "high").length;
  let riskLevel: RiskLevel = "low";
  if (score >= 60 || highCount >= 2) {
    riskLevel = "high";
  } else if (score >= 30 || highCount === 1) {
    riskLevel = "medium";
  }

  return { score, riskLevel };
}

function buildSummary(riskLevel: RiskLevel, findings: readonly Finding[]): string {
  if (findings.length === 0) {
    return "No common warning signs were detected in this text. That is not proof the message is safe or genuine.";
  }

  const titles = findings.slice(0, 3).map((finding) => finding.title.toLowerCase());
  const listed =
    titles.length === 1
      ? titles[0]
      : titles.length === 2
        ? `${titles[0]} and ${titles[1]}`
        : `${titles.slice(0, -1).join("; ")} and ${titles[titles.length - 1]}`;

  if (riskLevel === "high") {
    return `This message shows high-pressure social-engineering signals, including ${listed}. Pause and verify through a channel you already trust.`;
  }
  if (riskLevel === "medium") {
    return `This message includes warning signs (${listed}) that deserve a second look before you reply, click, or pay.`;
  }
  return `A few milder signals appeared (${listed}). Treat unexpected requests with caution even when the tone feels polite.`;
}

function buildNextSteps(findings: readonly Finding[]): string[] {
  const fromFindings = findings.map((finding) => finding.recommendedAction);
  const hasCredentialAsk = findings.some((finding) => finding.ruleId === "credential_request");
  const extras = DEFAULT_NEXT_STEPS.filter((step) => {
    if (hasCredentialAsk && step.includes("passwords, OTPs")) return false;
    return !fromFindings.includes(step);
  });
  const merged: string[] = [];
  for (const step of [...fromFindings, ...extras]) {
    if (!merged.includes(step)) merged.push(step);
  }
  return merged.slice(0, 5);
}

export function analyzeMessage(message: string): AnalysisResult | null {
  const text = message.replace(/\u00a0/g, " ").trim();
  if (!text) return null;

  const findings = collectFindings(text);
  const { score, riskLevel } = scoreFindings(findings);

  return {
    riskLevel,
    score,
    summary: buildSummary(riskLevel, findings),
    findings,
    nextSteps: buildNextSteps(findings),
    limitation: ANALYSIS_LIMITATION,
  };
}
