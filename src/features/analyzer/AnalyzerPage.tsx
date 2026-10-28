import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { sampleMessages } from "@/data/sampleMessages";

export default function AnalyzerPage() {
  return (
    <div className="view-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Message lab / 01</p>
          <h1>See what a message is really saying.</h1>
          <p className="intro-copy">Practice spotting the signals that social engineers use to earn trust and prompt quick action.</p>
        </div>
        <span className="tech-label">ANALYZER / PREVIEW</span>
      </div>
      <div className="dashboard-grid">
        <Card className="analyzer-card">
          <div className="card-heading">
            <div><p className="eyebrow">Input</p><h2>Bring a message</h2></div>
            <span className="badge badge-neutral">Fictional practice</span>
          </div>
          <label className="field-label" htmlFor="message">Message text</label>
          <textarea id="message" className="message-input" placeholder="Paste a fictional SMS, email, or chat message here…" rows={7} />
          <div className="sample-heading"><span className="field-label">Or try a sample</span><span className="supporting-text">3 examples</span></div>
          <div className="sample-list">
            {sampleMessages.map((sample) => <button className="sample-option" type="button" key={sample.id}><span><strong>{sample.label}</strong><small>{sample.content}</small></span><span className="sample-channel">{sample.channel}</span></button>)}
          </div>
        </Card>
        <Card className="results-card">
          <div className="card-heading"><div><p className="eyebrow">Signal report</p><h2>Results will appear here</h2></div><span className="risk-orb" aria-hidden="true" /></div>
          <EmptyState eyebrow="Waiting for a message" title="Your first read is one step away" description="This preview will later highlight pressure, impersonation, suspicious links, and other signals." />
        </Card>
      </div>
    </div>
  );
}
