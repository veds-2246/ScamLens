"use client";

import { useCallback, useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import AppNavigation, { type AppView } from "@/components/AppNavigation";
import AnalyzePage from "@/features/analyzer/AnalyzerPage";
import LearnPage from "@/features/learning/LearnPage";
import UrlCheckerPage from "@/features/url/UrlCheckerPage";
import HistoryPage from "@/features/history/HistoryPage";
import DashboardPage from "@/features/dashboard/DashboardPage";

const APP_VIEWS: readonly AppView[] = ["dashboard", "analyze", "url", "history", "learn"];

function getViewFromHash(): AppView {
  const hash = window.location.hash.slice(1);
  return APP_VIEWS.includes(hash as AppView) ? (hash as AppView) : "dashboard";
}

export default function Home() {
  // Keep the server and first client render consistent, then restore the view from the URL.
  const [view, setView] = useState<AppView>("dashboard");

  useEffect(() => {
    const syncViewFromHash = () => setView(getViewFromHash());
    syncViewFromHash();
    window.addEventListener("hashchange", syncViewFromHash);
    return () => window.removeEventListener("hashchange", syncViewFromHash);
  }, []);

  const handleViewChange = useCallback((nextView: AppView) => {
    setView(nextView);
    if (window.location.hash !== `#${nextView}`) {
      window.location.hash = nextView;
    }
  }, []);

  return (
    <main className="app-shell">
      <AppHeader />
      <AppNavigation activeView={view} onChange={handleViewChange} />
      <div className="page-content">
        {view === "dashboard" ? <DashboardPage onOpenHistory={() => handleViewChange("history")} /> : view === "analyze" ? <AnalyzePage /> : view === "url" ? <UrlCheckerPage /> : view === "history" ? <HistoryPage /> : <LearnPage />}
      </div>
    </main>
  );
}
