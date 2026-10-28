"use client";
import { useEffect, useState } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { getHistory, getQuizAttempts } from "@/lib/localStorage";
import type { HistoryEntry } from "@/types/history";

type DashboardPageProps = {
  onOpenHistory: () => void;
};

export default function DashboardPage({ onOpenHistory }: DashboardPageProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [attempts, setAttempts] = useState<ReturnType<typeof getQuizAttempts>>([]);
  useEffect(() => {
    const refresh = () => { setEntries(getHistory()); setAttempts(getQuizAttempts()); };
    window.addEventListener("scamlens-storage", refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("scamlens-storage", refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const messageCount = entries.filter((entry) => entry.kind === "message").length;
  const urlCount = entries.filter((entry) => entry.kind === "url").length;
  const distribution = { low: entries.filter((entry) => entry.riskLevel === "low").length, medium: entries.filter((entry) => entry.riskLevel === "medium").length, high: entries.filter((entry) => entry.riskLevel === "high").length };
  const average = entries.length ? Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length) : 0;
  const attemptCount = attempts.length;
  const quizBest = attempts.length ? Math.max(...attempts.map((attempt) => Math.round((attempt.score / attempt.total) * 100))) : 0;
  return <div className="view-stack"><div className="page-intro"><div><p className="eyebrow">Personal signals / 05</p><h1>A calmer view of your practice.</h1><p className="intro-copy">Simple, local insights from the checks and quiz attempts you choose to keep.</p></div><span className="tech-label">INSIGHTS / LOCAL</span></div><div className="insight-grid"><Card><p className="eyebrow">Message checks</p><p className="metric-value">{messageCount}</p></Card><Card><p className="eyebrow">URL checks</p><p className="metric-value">{urlCount}</p></Card><Card><p className="eyebrow">Average signal</p><p className="metric-value">{average}<span>/100</span></p></Card><Card><p className="eyebrow">Quiz best</p><p className="metric-value">{quizBest}<span>%</span></p><p className="supporting-text">{attemptCount} saved attempt{attemptCount === 1 ? "" : "s"}</p></Card></div><Card><div className="card-heading"><div><p className="eyebrow">Risk distribution</p><h2>What your saved checks show</h2></div><Badge tone={distribution.high ? "high" : "teal"}>{distribution.high} high</Badge></div><div className="history-actions"><span>Low: {distribution.low}</span><span>Medium: {distribution.medium}</span><span>High: {distribution.high}</span></div></Card><Card><div className="card-heading"><p className="eyebrow">Recent activity</p><Button variant="secondary" type="button" onClick={onOpenHistory}>Open history</Button></div>{entries.length ? <ul className="findings-list">{entries.slice(0, 5).map((entry) => <li className="finding-item" key={entry.id}><div className="finding-header"><span><strong>{entry.kind === "url" ? "URL check" : "Message check"}</strong> · {entry.label}<span className="supporting-text">{new Date(entry.createdAt).toLocaleString()} · {entry.riskLevel} signal</span></span><Button variant="secondary" type="button" onClick={onOpenHistory}>Open report</Button></div></li>)}</ul> : <p className="supporting-text">Your recent checks will appear here.</p>}</Card><Card><p className="eyebrow">A useful habit</p><h2>Pause, verify, protect.</h2><p className="body-copy">The strongest pattern is not a score: pause when a request creates urgency, verify through a trusted channel, and protect secrets like OTPs and passwords.</p></Card></div>;
}
