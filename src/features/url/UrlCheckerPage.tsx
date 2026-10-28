"use client";
import { useRef, useState, type FormEvent } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { checkUrl } from "@/lib/urlHeuristics";
import { saveHistory } from "@/lib/localStorage";
import type { ThreatIntelResult, UrlCheckResult } from "@/types/url";
import { downloadJsonReport, downloadReport, printReport } from "@/lib/exportReport";

export default function UrlCheckerPage() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<UrlCheckResult | null>(null);
  const [error, setError] = useState("");
  const [sample, setSample] = useState("");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [threatIntel, setThreatIntel] = useState<ThreatIntelResult | null>(null);
  const [threatIntelLoading, setThreatIntelLoading] = useState(false);
  const lookupSequence = useRef(0);
  function submit(event: FormEvent) {
    event.preventDefault();
    const checked = checkUrl(value);
    lookupSequence.current += 1;
    setThreatIntelLoading(false);
    if (!checked) { setError("Enter a complete web address, such as example.com."); setResult(null); setThreatIntel(null); setHistoryId(null); return; }
    const id = crypto.randomUUID();
    setError(""); setResult(checked); setThreatIntel(null); setHistoryId(id);
    saveHistory({ id, kind: "url", createdAt: new Date().toISOString(), label: checked.host, riskLevel: checked.riskLevel, score: checked.score, result: checked });
  }
  async function lookupThreatIntel() {
    if (!result || threatIntelLoading) return;
    const requestId = ++lookupSequence.current;
    setThreatIntelLoading(true);
    setThreatIntel(null);
    try {
      const response = await fetch("/api/threat-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: result.normalizedUrl }),
      });
      const payload: unknown = await response.json();
      if (requestId !== lookupSequence.current) return;
      if (typeof payload === "object" && payload !== null && "provider" in payload && "status" in payload && "message" in payload) {
        const lookup = payload as ThreatIntelResult;
        setThreatIntel(lookup);
        const enrichedResult = { ...result, threatIntel: lookup };
        setResult(enrichedResult);
        if (historyId) {
          saveHistory({ id: historyId, kind: "url", createdAt: new Date().toISOString(), label: result.host, riskLevel: result.riskLevel, score: result.score, result: enrichedResult });
        }
      } else {
        const message = typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "URLhaus could not complete the lookup. Local URL analysis is still available.";
        setThreatIntel({ provider: "URLhaus", status: "unavailable", checkedAt: new Date().toISOString(), message });
      }
    } catch {
      if (requestId === lookupSequence.current) {
        setThreatIntel({ provider: "URLhaus", status: "unavailable", checkedAt: new Date().toISOString(), message: "The reputation service could not be reached. Local URL analysis is still available." });
      }
    } finally {
      if (requestId === lookupSequence.current) setThreatIntelLoading(false);
    }
  }
  return <div className="view-stack">
    <div className="page-intro"><div><p className="eyebrow">Link lab / 03</p><h1>Check a link before you open it.</h1><p className="intro-copy">Local URL checks run without network requests. If you choose the optional URLhaus lookup, the normalized URL is sent to an external malware-intelligence provider.</p></div><span className="tech-label">URL CHECK / OPTIONAL INTEL</span></div>
    <Card className="url-card"><form onSubmit={submit}><label className="field-label" htmlFor="url">Web address</label><input id="url" className="message-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder="https://example.com/login" />{error && <p className="form-error" role="alert">{error}</p>}<div className="analyzer-actions"><Button type="submit">Check URL</Button></div><p className="field-label">Try a sample</p><div className="sample-list">{["https://example.com", "http://bit.ly/verify-account", "javascript:alert(1)"].map((item) => <button className="sample-option" type="button" key={item} onClick={() => { setValue(item); setSample(item); }}>{item}</button>)}</div>{sample && <p className="supporting-text">Sample loaded. Check it when ready.</p>}</form>
      {result ? <section className="url-result" aria-live="polite"><p className="supporting-text">Normalized address: <code>{result.normalizedUrl}</code></p><div className="score-row"><div><p className={`score-value risk-${result.riskLevel}`}>{result.score}</p><p className="supporting-text">Risk score / 100</p></div><Badge tone={result.riskLevel === "high" ? "high" : result.riskLevel === "medium" ? "warning" : "teal"}>{result.riskLevel} signal</Badge></div><p className="body-copy">{result.summary}</p><h3>Signals to review</h3>{result.signals.length ? <ul className="findings-list">{result.signals.map((item) => <li className="finding-item" key={item.id}><div className="finding-header"><p className="finding-title">{item.title}</p><Badge tone={item.severity === "high" ? "high" : item.severity === "medium" ? "warning" : "teal"}>{item.severity}</Badge></div><p className="supporting-text">{item.explanation}</p></li>)}</ul> : <p className="supporting-text">No obvious structural signals found.</p>}<h3>Safer next steps</h3><ol className="next-steps">{result.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol><p className="limitation-note">{result.limitation}</p><section className="threat-intel-panel" aria-labelledby="threat-intel-heading"><div><h3 id="threat-intel-heading">Known malware URL check</h3><p className="supporting-text">Optional lookup with URLhaus. Clicking this sends the full normalized URL, including its path and query string, to URLhaus. Do not submit private, password-reset or one-time links. URLhaus focuses on known malware-distribution URLs and does not cover every phishing site.</p></div><Button variant="secondary" type="button" onClick={lookupThreatIntel} disabled={threatIntelLoading}>{threatIntelLoading ? "Checking URLhaus…" : threatIntel ? "Check again with URLhaus" : "Check URLhaus reputation"}</Button>{threatIntel && <div className={`threat-intel-result threat-intel-${threatIntel.status}`} role="status" aria-live="polite"><div className="finding-header"><strong>{threatIntel.status === "match" ? "Known malware URL match" : threatIntel.status === "no_match" ? "No URLhaus match found" : threatIntel.status === "unconfigured" ? "Reputation lookup not configured" : "Reputation lookup unavailable"}</strong><Badge tone={threatIntel.status === "match" ? "high" : threatIntel.status === "no_match" ? "teal" : "warning"}>{threatIntel.provider}</Badge></div><p className="supporting-text">{threatIntel.message}</p>{threatIntel.threat && <p className="supporting-text">Threat category: {threatIntel.threat}</p>}{threatIntel.urlStatus && <p className="supporting-text">Provider URL status: {threatIntel.urlStatus}</p>}{threatIntel.dateAdded && <p className="supporting-text">Record added: {threatIntel.dateAdded}</p>}{threatIntel.tags?.length ? <p className="supporting-text">Tags: {threatIntel.tags.join(", ")}</p> : null}<p className="supporting-text">Checked at {new Date(threatIntel.checkedAt).toLocaleString()}.</p></div>}</section><div className="history-actions"><Button variant="secondary" type="button" onClick={() => { const entry = { id: crypto.randomUUID(), kind: "url" as const, createdAt: new Date().toISOString(), label: result.host, riskLevel: result.riskLevel, score: result.score, result }; downloadReport(entry); }}>TXT</Button><Button variant="secondary" type="button" onClick={() => { const entry = { id: crypto.randomUUID(), kind: "url" as const, createdAt: new Date().toISOString(), label: result.host, riskLevel: result.riskLevel, score: result.score, result }; downloadJsonReport(entry); }}>JSON</Button><Button variant="secondary" type="button" onClick={() => { const entry = { id: crypto.randomUUID(), kind: "url" as const, createdAt: new Date().toISOString(), label: result.host, riskLevel: result.riskLevel, score: result.score, result }; printReport(entry); }}>Print</Button></div></section> : <p className="supporting-text">Tip: hover or long-press links to inspect their destination before opening.</p>}
    </Card>
  </div>;
}
