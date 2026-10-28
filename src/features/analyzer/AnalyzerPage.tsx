"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { sampleMessages } from "@/data/sampleMessages";
import { analyzeMessage } from "@/lib/analyzeMessage";
import type { AnalysisResult } from "@/types/analysis";
import AnalysisReport from "./AnalysisReport";
import { saveHistory } from "@/lib/localStorage";

type AnalyzerStatus = "idle" | "loading" | "ready" | "error";

export default function AnalyzerPage() {
  const [message, setMessage] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalyzerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const errorId = useId();
  const isAnalyzing = status === "loading";

  const selectedSample = useMemo(
    () => sampleMessages.find((sample) => sample.id === selectedSampleId) ?? null,
    [selectedSampleId],
  );

  function applySample(sampleId: (typeof sampleMessages)[number]["id"]) {
    const sample = sampleMessages.find((item) => item.id === sampleId);
    if (!sample) return;
    setSelectedSampleId(sample.id);
    setMessage(sample.content);
    setError(null);
  }

  function handleMessageChange(value: string) {
    setMessage(value);
    setError(null);
    if (selectedSample && value !== selectedSample.content) {
      setSelectedSampleId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Paste a message to analyze before running a check.");
      setStatus("error");
      return;
    }

    setError(null);
    setStatus("loading");

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      const analysis = analyzeMessage(trimmed);
      if (!analysis) {
        setResult(null);
        setError("Paste a message to analyze before running a check.");
        setStatus("error");
        return;
      }
      setResult(analysis);
      saveHistory({
        id: crypto.randomUUID(),
        kind: "message",
        createdAt: new Date().toISOString(),
        label: "Message analysis",
        riskLevel: analysis.riskLevel,
        score: analysis.score,
        result: analysis,
      });
      setStatus("ready");
      window.requestAnimationFrame(() => {
        document.getElementById("signal-report")?.focus();
      });
    } catch {
      setResult(null);
      setError("The local analyzer could not finish. Try again with the same text.");
      setStatus("error");
    }
  }

  return (
    <div className="view-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Message lab / 01</p>
          <h1>See what a message is really saying.</h1>
          <p className="intro-copy">Practice spotting the signals that social engineers use to earn trust and prompt quick action.</p>
        </div>
        <span className="tech-label">ANALYZER / LOCAL</span>
      </div>
      <div className="dashboard-grid">
        <Card className="analyzer-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Input</p>
              <h2>Bring a message</h2>
            </div>
            <Badge tone="neutral">Fictional practice</Badge>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="message">
              Message text
            </label>
            <textarea
              id="message"
              name="message"
              className="message-input"
              placeholder="Paste a fictional SMS, email, or chat message here…"
              rows={7}
              value={message}
              onChange={(event) => handleMessageChange(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            {error ? (
              <p className="form-error" id={errorId} role="alert">
                {error}
              </p>
            ) : null}
            <div className="analyzer-actions">
              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing ? "Reading the message…" : "Analyze message"}
              </Button>
            </div>
            <div className="sample-heading">
              <span className="field-label">Or try a sample</span>
              <span className="supporting-text">{sampleMessages.length} examples</span>
            </div>
            <div className="sample-list">
              {sampleMessages.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    className={`sample-option${isSelected ? " is-selected" : ""}`}
                    type="button"
                    key={sample.id}
                    onClick={() => applySample(sample.id)}
                    aria-pressed={isSelected}
                    disabled={isAnalyzing}
                  >
                    <span>
                      <strong>{sample.label}</strong>
                      <small>{sample.content}</small>
                    </span>
                    <span className="sample-channel">{sample.channel}</span>
                  </button>
                );
              })}
            </div>
          </form>
        </Card>
        <Card className="results-card" id="signal-report" tabIndex={-1} aria-live="polite">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Signal report</p>
              <h2>
                {status === "ready" && result
                  ? "What this message is signalling"
                  : status === "loading"
                    ? "Reading the wording"
                    : status === "error" && !result
                      ? "Nothing to show yet"
                      : "Results will appear here"}
              </h2>
            </div>
            <span
              className={`risk-orb${status === "loading" ? " is-loading" : ""}${result && status === "ready" ? ` risk-${result.riskLevel}` : ""}`}
              aria-hidden="true"
            />
          </div>
          {status === "loading" ? (
            <EmptyState
              eyebrow="Local check"
              title="Looking for pressure, bait, and risky asks"
              description="This run stays on your device. No network, account, or AI service is used."
            />
          ) : status === "ready" && result ? (
            <AnalysisReport result={result} />
          ) : status === "error" && !result ? (
            <EmptyState
              eyebrow="Need a message"
              title="The analyzer is waiting on text"
              description={error ?? "Paste a message or choose a sample, then run the check."}
            />
          ) : (
            <EmptyState
              eyebrow="Waiting for a message"
              title="Your first read is one step away"
              description="The report will highlight pressure, impersonation, suspicious links, and other signals, plus a clear limit on what this tool can claim."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
