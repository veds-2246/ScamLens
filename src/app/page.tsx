"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import AppNavigation, { type AppView } from "@/components/AppNavigation";
import AnalyzePage from "@/features/analyzer/AnalyzerPage";
import LearnPage from "@/features/learning/LearnPage";

export default function Home() {
  const [view, setView] = useState<AppView>("analyze");

  return (
    <main className="app-shell">
      <AppHeader />
      <AppNavigation activeView={view} onChange={setView} />
      <div className="page-content">{view === "analyze" ? <AnalyzePage /> : <LearnPage />}</div>
    </main>
  );
}
