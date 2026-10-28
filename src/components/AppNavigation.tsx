export type AppView = "dashboard" | "analyze" | "url" | "history" | "learn";

type AppNavigationProps = {
  activeView: AppView;
  onChange: (view: AppView) => void;
};

export default function AppNavigation({ activeView, onChange }: AppNavigationProps) {
  return (
    <nav className="app-navigation" aria-label="Primary navigation">
      {(["dashboard", "analyze", "url", "history", "learn"] as const).map((view) => (
        <button
          className={`nav-item ${activeView === view ? "is-active" : ""}`}
          key={view}
          onClick={() => onChange(view)}
          type="button"
          aria-current={activeView === view ? "page" : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{view === "dashboard" ? "◈" : view === "analyze" ? "⌁" : view === "url" ? "↗" : view === "history" ? "◷" : "✦"}</span>
          {view === "dashboard" ? "Dashboard" : view === "analyze" ? "Analyze" : view === "url" ? "URL checker" : view === "history" ? "History" : "Learn"}
        </button>
      ))}
    </nav>
  );
}
