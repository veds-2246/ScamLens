export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          S
        </div>
        <div>
          <p className="brand-name">ScamLens</p>
          <p className="brand-tagline">Understand the signal. Avoid the scam.</p>
        </div>
      </div>
      <span className="header-status"><span className="status-dot" /> Learning mode</span>
    </header>
  );
}
