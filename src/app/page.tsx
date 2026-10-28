"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import AppNavigation, { type AppView } from "@/components/AppNavigation";
import AnalyzePage from "@/features/analyzer/AnalyzerPage";
import LearnPage from "@/features/learning/LearnPage";
import UrlCheckerPage from "@/features/url/UrlCheckerPage";
import HistoryPage from "@/features/history/HistoryPage";
import DashboardPage from "@/features/dashboard/DashboardPage";

export default function Home() {
  const [view, setView] = useState<AppView>("dashboard");

  return (
    <main className="app-shell">
      <AppHeader />
      <AppNavigation activeView={view} onChange={setView} />
      <div className="page-content">
        {view === "dashboard" ? <DashboardPage onOpenHistory={() => setView("history")} /> : view === "analyze" ? <AnalyzePage /> : view === "url" ? <UrlCheckerPage /> : view === "history" ? <HistoryPage /> : <LearnPage />}
      </div>
    </main>
  );
}
