import type { HistoryEntry } from "@/types/history";

export function reportText(entry: HistoryEntry): string {
  const result = entry.result;
  const lines = [`ScamLens ${entry.kind} report`, `Checked: ${new Date(entry.createdAt).toLocaleString()}`, `Risk: ${entry.riskLevel} (${entry.score}/100)`, `Summary: ${result.summary}`];
  if ("signals" in result) lines.push("Signals:", ...result.signals.map((signal) => `- ${signal.title}: ${signal.explanation}`));
  if ("findings" in result) lines.push("Evidence:", ...result.findings.map((finding) => `- ${finding.title}: ${finding.matchedPhrase}`));
  if ("threatIntel" in result && result.threatIntel) {
    lines.push(
      "",
      `External reputation: ${result.threatIntel.provider} / ${result.threatIntel.status}`,
      `Reputation checked: ${new Date(result.threatIntel.checkedAt).toLocaleString()}`,
      result.threatIntel.message,
    );
    if (result.threatIntel.threat) lines.push(`Threat category: ${result.threatIntel.threat}`);
    if (result.threatIntel.tags?.length) lines.push(`Threat tags: ${result.threatIntel.tags.join(", ")}`);
  }
  lines.push("", result.limitation);
  return lines.join("\n");
}

export function downloadReport(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const blob = new Blob([reportText(entry)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `scamlens-${entry.kind}-report.txt`; anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonReport(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(entry, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `scamlens-${entry.kind}-report.json`; anchor.click();
  URL.revokeObjectURL(url);
}

export function printReport(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) return;
  printWindow.document.write(`<html><head><title>ScamLens report</title><style>.scamlens-print-report{white-space:pre-wrap;font:16px/1.5 sans-serif;max-width:760px;margin:2rem auto}</style></head><body><pre class="scamlens-print-report">${reportText(entry).replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[char] ?? char)}</pre></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export async function shareReport(entry: HistoryEntry): Promise<boolean> {
  const text = reportText(entry);
  if (typeof navigator === "undefined") return false;
  if (navigator.share) {
    await navigator.share({ title: "ScamLens report", text });
    return true;
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
