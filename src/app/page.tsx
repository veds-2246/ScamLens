"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AppHeader from "@/components/AppHeader";
import AppNavigation, { type AppView } from "@/components/AppNavigation";

const PageLoader = () => <div className="loading-panel" role="status" aria-label="Loading page" />;

const AnalyzePage = dynamic(() => import("@/features/analyzer/AnalyzerPage"), { loading: PageLoader });
const LearnPage = dynamic(() => import("@/features/learning/LearnPage"), { loading: PageLoader });
const UrlCheckerPage = dynamic(() => import("@/features/url/UrlCheckerPage"), { loading: PageLoader });
const HistoryPage = dynamic(() => import("@/features/history/HistoryPage"), { loading: PageLoader });
const DashboardPage = dynamic(() => import("@/features/dashboard/DashboardPage"), { loading: PageLoader });

const APP_VIEWS: readonly AppView[] = ["dashboard", "analyze", "url", "history", "learn"];

function getViewFromHash(): AppView {
  const hash = window.location.hash.slice(1);
  return APP_VIEWS.includes(hash as AppView) ? (hash as AppView) : "dashboard";
}

export default function Home() {
  const [view, setView] = useState<AppView>("dashboard");

  useEffect(() => {
    const syncViewFromHash = () => setView(getViewFromHash());
    syncViewFromHash();
    window.addEventListener("hashchange", syncViewFromHash);
    return () => window.removeEventListener("hashchange", syncViewFromHash);
  }, []);

  const handleViewChange = useCallback((nextView: AppView) => {
    setView(nextView);
    if (window.location.hash !== `#${nextView}`) window.location.hash = nextView;
  }, []);

  return (
    <main className="app-shell">
      <AppHeader />
      <AppNavigation activeView={view} onChange={handleViewChange} />
      <div className="page-content" key={view}>
        {view === "dashboard" ? <DashboardPage onOpenHistory={() => handleViewChange("history")} /> :
          view === "analyze" ? <AnalyzePage /> :
          view === "url" ? <UrlCheckerPage /> :
          view === "history" ? <HistoryPage /> : <LearnPage />}
      </div>
    </main>
  );
}
