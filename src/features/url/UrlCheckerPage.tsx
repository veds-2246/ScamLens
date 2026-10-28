"use client";
import { useState, type FormEvent } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { checkUrl } from "@/lib/urlHeuristics";
import { saveHistory } from "@/lib/localStorage";
import type { UrlCheckResult } from "@/types/url";
import { downloadJsonReport, downloadReport, printReport } from "@/lib/exportReport";

export default function UrlCheckerPage() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<UrlCheckResult | null>(null);
  const [error, setError] = useState("");
  const [sample, setSample] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    const checked = checkUrl(value);
    if (!checked) { setError("Enter a complete web address, such as example.com."); setResult(null); return; }
    setError(""); setResult(checked);
    saveHistory({ id: crypto.randomUUID(), kind: "url", createdAt: new Date().toISOString(), label: checked.host, riskLevel: checked.riskLevel, score: checked.score, result: checked });
  }
  return <div className="view-stack">
    <div className="page-intro"><div><p className="eyebrow">Link lab / 03</p><h1>Check a link before you open it.</h1><p className="intro-copy">A local URL structure check highlights clues commonly used by phishing links. Nothing is sent anywhere.</p></div><span className="tech-label">URL CHECK / LOCAL</span></div>
    <Card className="url-card"><form onSubmit={submit}><label className="field-label" htmlFor="url">Web address</label><input id="url" className="message-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder="https://example.com/login" />{error && <p className="form-error" role="alert">{error}</p>}<div className="analyzer-actions"><Button type="submit">Check URL</Button></div><p className="field-label">Try a sample</p><div className="sample-list">{["https://example.com", "http://bit.ly/verify-account", "javascript:alert(1)"].map((item) => <button className="sample-option" type="button" key={item} onClick={() => { setValue(item); setSample(item); }}>{item}</button>)}</div>{sample && <p className="supporting-text">Sample loaded. Check it when ready.</p>}</form>
      {result ? <section className="url-result" aria-live="polite"><p className="supporting-text">Normalized address: <code>{result.normalizedUrl}</code></p><div className="score-row"><div><p className={`score-value risk-${result.riskLevel}`}>{result.score}</p><p className="supporting-text">Risk score / 100</p></div><Badge tone={result.riskLevel === "high" ? "high" : result.riskLevel === "medium" ? "warning" : "teal"}>{result.riskLevel} signal</Badge></div><p className="body-copy">{result.summary}</p><h3>Signals to review</h3>{result.signals.length ? <ul className="findings-list">{result.signals.map((item) => <li className="finding-item" key={item.id}><div className="finding-header"><p className="finding-title">{item.title}</p><Badge tone={item.severity === "high" ? "high" : item.severity === "medium" ? "warning" : "teal"}>{item.severity}</Badge></div><p className="supporting-text">{item.explanation}</p></li>)}</ul> : <p className="supporting-text">No obvious structural signals found.</p>}<h3>Safer next steps</h3><ol className="next-steps">{result.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol><p className="limitation-note">{result.limitation}</p><div className="history-actions"><Button variant="secondary" type="button" onClick={() => { const entry = { id: crypto.randomUUID(), kind: "url" as const, createdAt: new Date().toISOString(), label: result.host, riskLevel: result.riskLevel, score: result.score, result }; downloadReport(entry); }}>TXT</Button><Button variant="secondary" type="button" onClick={() => { const entry = { id: crypto.randomUUID(), kind: "url" as const, createdAt: new Date().toISOString(), label: result.host, riskLevel: result.riskLevel, score: result.score, result }; downloadJsonReport(entry); }}>JSON</Button><Button variant="secondary" type="button" onClick={() => { const entry = { id: crypto.randomUUID(), kind: "url" as const, createdAt: new Date().toISOString(), label: result.host, riskLevel: result.riskLevel, score: result.score, result }; printReport(entry); }}>Print</Button></div></section> : <p className="supporting-text">Tip: hover or long-press links to inspect their destination before opening.</p>}
    </Card>
  </div>;
}
