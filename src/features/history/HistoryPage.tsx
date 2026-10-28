"use client";
import { useEffect, useState } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { clearHistory, deleteHistory, getHistory } from "@/lib/localStorage";
import { downloadJsonReport, downloadReport, printReport, shareReport } from "@/lib/exportReport";
import type { HistoryEntry } from "@/types/history";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HistoryEntry | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const refresh = () => setEntries(getHistory());
    refresh();
    window.addEventListener("scamlens-storage", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("scamlens-storage", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function removeAll() {
    clearHistory();
    setEntries([]);
    setSelected(null);
    setConfirmClear(false);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteHistory(pendingDelete.id);
    setEntries(getHistory());
    if (selected?.id === pendingDelete.id) setSelected(null);
    setPendingDelete(null);
  }

  return (
    <div className="view-stack">
      <div className="page-intro">
        <div><p className="eyebrow">Your trail / 04</p><h1>Local history, on your terms.</h1>
          <p className="intro-copy">Only reports are saved here. Raw text is excluded by default and everything stays in this browser.</p>
        </div>
        <span className="tech-label">STORAGE / PRIVATE</span>
      </div>
      <Card>
        <div className="card-heading">
          <div><p className="eyebrow">Saved checks</p><h2>{entries.length ? `${entries.length} recent report${entries.length === 1 ? "" : "s"}` : "No saved checks yet"}</h2></div>
          {entries.length > 0 && <Button variant="secondary" type="button" onClick={() => setConfirmClear(true)}>Clear history</Button>}
        </div>
        {entries.length ? (
          <div className="history-list">
            {entries.map((entry) => (
              <article className="history-item" key={entry.id}>
                <div className="history-item-main">
                  <p className="eyebrow">{entry.kind} · {new Date(entry.createdAt).toLocaleDateString()}</p>
                  <h3>{entry.label}</h3>
                  <p className="supporting-text">{entry.result.summary}</p>
                </div>
                <div className="history-actions">
                  <Badge tone={entry.riskLevel === "high" ? "high" : entry.riskLevel === "medium" ? "warning" : "teal"}>{entry.riskLevel} · {entry.score}</Badge>
                  <Button variant="secondary" type="button" onClick={() => setSelected(selected?.id === entry.id ? null : entry)}>
                    {selected?.id === entry.id ? "Close report" : "Open"}
                  </Button>
                  <Button variant="secondary" type="button" onClick={() => downloadReport(entry)}>TXT</Button>
                  <Button variant="secondary" type="button" onClick={() => downloadJsonReport(entry)}>JSON</Button>
                  <Button variant="secondary" type="button" onClick={() => printReport(entry)}>Print / Save PDF</Button>
                  <Button variant="secondary" type="button" onClick={async () => { if (await shareReport(entry)) setSharedId(entry.id); }}>
                    {sharedId === entry.id ? "Copied" : "Share"}
                  </Button>
                  <Button variant="secondary" type="button" onClick={() => setPendingDelete(entry)}>Delete</Button>
                </div>
                {selected?.id === entry.id && (
                  <div className="history-detail" aria-live="polite">
                    <Card>
                      <div className="history-detail-heading">
                        <div><p className="eyebrow">Report detail</p><h2>{selected.label}</h2></div>
                        <Button variant="secondary" type="button" onClick={() => setSelected(null)}>Close</Button>
                      </div>
                      <p className="body-copy">{selected.result.summary}</p>
                      <p className="limitation-note">{selected.result.limitation}</p>
                    </Card>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : <p className="supporting-text">Run a message or URL check and it will appear here. Saving is local and can be cleared at any time.</p>}
      </Card>
      {(pendingDelete || confirmClear) && (
        <div className="confirm-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setPendingDelete(null);
            setConfirmClear(false);
          }
        }}>
          <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
            <div className="confirm-dialog-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></svg>
            </div>
            <p className="eyebrow">Please confirm</p>
            <h2 id="confirm-title">{confirmClear ? "Clear all history?" : "Delete this report?"}</h2>
            <p id="confirm-description" className="confirm-description">
              {confirmClear
                ? "This will permanently remove all saved checks from this browser. This action cannot be undone."
                : <>“{pendingDelete?.label}” will be removed from your saved checks. This action cannot be undone.</>}
            </p>
            <div className="confirm-actions">
              <Button variant="secondary" type="button" onClick={() => { setPendingDelete(null); setConfirmClear(false); }}>Cancel</Button>
              <Button variant="primary" className="button-danger" type="button" onClick={confirmClear ? removeAll : confirmDelete}>Delete {confirmClear ? "all" : "report"}</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
