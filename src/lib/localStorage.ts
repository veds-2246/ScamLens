import type { HistoryEntry, QuizAttempt } from "@/types/history";

const HISTORY_KEY = "scamlens.history.v1";
const QUIZ_KEY = "scamlens.quiz.v1";
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const hasCloudSyncConfig = () =>
  typeof process !== "undefined" &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

function runCloudHistorySync(task: (cloudHistory: typeof import("./supabase/history")) => Promise<unknown>) {
  if (!hasCloudSyncConfig()) return;
  void import("./supabase/history")
    .then(task)
    .catch(() => { /* Cloud sync must never interrupt a local analysis. */ });
}

function read<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  if (typeof window === "undefined") return fallback;
  try { const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "null"); return validate(parsed) ? parsed : fallback; }
  catch { return fallback; }
}
function notifyStorage() { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("scamlens-storage")); }
const historyList = (value: unknown): value is HistoryEntry[] => Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.createdAt === "string" && (item.kind === "message" || item.kind === "url") && typeof item.score === "number" && isRecord(item.result));
const quizList = (value: unknown): value is QuizAttempt[] => Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.createdAt === "string" && typeof item.score === "number" && typeof item.total === "number");
export function getHistory(): HistoryEntry[] { return read(HISTORY_KEY, [], historyList); }
export function replaceHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 50))); notifyStorage(); } catch { /* Local storage remains optional. */ }
}
export function saveHistory(entry: HistoryEntry, includeInput = false) {
  if (typeof window === "undefined") return;
  const safeEntry: HistoryEntry = includeInput ? entry : {
    ...entry, input: undefined,
    result: entry.kind === "url"
      ? { ...entry.result, url: "[redacted]", normalizedUrl: `https://${entry.label}/` }
      : "findings" in entry.result
        ? { ...entry.result, findings: entry.result.findings.map((finding) => ({ ...finding, matchedPhrase: "[redacted]" })) }
        : entry.result,
  };
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([safeEntry, ...getHistory().filter((item) => item.id !== safeEntry.id)].slice(0, 50)));
    notifyStorage();
    runCloudHistorySync((cloudHistory) => cloudHistory.saveCloudHistory(safeEntry));
  } catch { /* Private mode and exhausted storage should never interrupt a local analysis. */ }
}
export function deleteHistory(id: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter((entry) => entry.id !== id))); notifyStorage(); }
  catch { /* Storage is optional. */ }
  runCloudHistorySync((cloudHistory) => cloudHistory.deleteCloudHistory(id));
}
export function clearHistory() {
  if (typeof window !== "undefined") { try { window.localStorage.removeItem(HISTORY_KEY); notifyStorage(); } catch { /* Storage is optional. */ } }
  runCloudHistorySync((cloudHistory) => cloudHistory.clearCloudHistory());
}
export function getQuizAttempts(): QuizAttempt[] { return read(QUIZ_KEY, [], quizList); }
export function saveQuizAttempt(attempt: QuizAttempt) {
  if (typeof window !== "undefined") { try { window.localStorage.setItem(QUIZ_KEY, JSON.stringify([attempt, ...getQuizAttempts()].slice(0, 30))); notifyStorage(); } catch { /* Storage is optional. */ } }
}
