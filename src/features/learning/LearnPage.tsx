import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { quizQuestions } from "@/data/quizQuestions";

export default function LearnPage() {
  return (
    <div className="view-stack">
      <div className="page-intro">
        <div><p className="eyebrow">Learning studio / 02</p><h1>Build your scam-spotting instincts.</h1><p className="intro-copy">Short lessons and realistic examples make the invisible patterns easier to recognize.</p></div>
        <span className="tech-label">LESSONS / PREVIEW</span>
      </div>
      <div className="dashboard-grid learning-grid">
        <Card className="lesson-card"><span className="lesson-number">01</span><p className="eyebrow">Core concept</p><h2>Slow down the story.</h2><p className="body-copy">Scams often combine a believable story with a reason you must act immediately. Learning to pause is a powerful first step.</p><div className="lesson-footer"><span className="badge badge-teal">Starter lesson</span><span className="supporting-text">5 min read</span></div></Card>
        <Card className="quiz-card"><div className="card-heading"><div><p className="eyebrow">Knowledge check</p><h2>Quick quiz</h2></div><span className="badge badge-neutral">Coming soon</span></div><EmptyState eyebrow="Quiz placeholder" title={quizQuestions[0].prompt} description="Interactive questions will be added once the learning content is ready." /></Card>
      </div>
    </div>
  );
}
