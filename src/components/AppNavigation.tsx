export type AppView = "analyze" | "learn";

type AppNavigationProps = {
  activeView: AppView;
  onChange: (view: AppView) => void;
};

export default function AppNavigation({ activeView, onChange }: AppNavigationProps) {
  return (
    <nav className="app-navigation" aria-label="Primary navigation">
      {(["analyze", "learn"] as const).map((view) => (
        <button
          className={`nav-item ${activeView === view ? "is-active" : ""}`}
          key={view}
          onClick={() => onChange(view)}
          type="button"
          aria-current={activeView === view ? "page" : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{view === "analyze" ? "⌁" : "✦"}</span>
          {view === "analyze" ? "Analyze" : "Learn"}
        </button>
      ))}
    </nav>
  );
}
