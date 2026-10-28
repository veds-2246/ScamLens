import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2, Fingerprint, ScanSearch, ShieldCheck, Sparkles, Activity, LockKeyhole, Globe, MessageSquareWarning, History, Zap } from "@/components/LucideIcons";
import RevealOnScroll from "@/components/RevealOnScroll";
import "./landing.css";

const features = [
  { icon: MessageSquareWarning, title: "Read the message", text: "Spot urgency, impersonation, suspicious requests and social-engineering patterns before you act." },
  { icon: Globe, title: "Inspect a link", text: "Review URL structure and risk signals locally, with an optional known-malware lookup." },
  { icon: History, title: "Keep your trail", text: "Revisit past reports on this device and, once signed in, sync your analysis history to your account." },
  { icon: Sparkles, title: "Learn the signals", text: "Build your instincts with approachable explanations and short security-awareness challenges." },
];

export default function LandingPage() {
  return <main className="landing">
    <RevealOnScroll/>
    <header className="landing-nav">
      <Link className="landing-brand" href="/" aria-label="ScamLens home"><span className="brand-symbol"><ShieldCheck size={22}/></span><span>ScamLens<span className="brand-dot">.</span></span></Link>
      <nav className="landing-nav-links" aria-label="Main navigation"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a></nav>
      <div className="landing-nav-actions"><Link className="nav-login" href="/auth/sign-in">Sign in</Link><Link className="button button-small" href="/auth/sign-up">Get started <ArrowRight size={16}/></Link></div>
    </header>
    <section className="hero-section">
      <div className="hero-glow hero-glow-one"/><div className="hero-glow hero-glow-two"/>
      <div className="hero-copy reveal">
        <div className="eyebrow-pill"><span className="pulse-dot"/> YOUR EVERYDAY SCAM-SAFETY COMPANION</div>
        <h1>Pause the panic.<br/><span>See the signal.</span></h1>
        <p className="hero-description">Scams move fast. ScamLens helps you slow down, spot the warning signs and make a more informed decision before you click, reply or share.</p>
        <div className="hero-actions"><Link className="button button-large" href="/auth/sign-up">Start protecting yourself <ArrowRight size={18}/></Link><a className="text-link" href="#how-it-works">Explore how it works <ArrowDown size={16}/></a></div>
        <div className="trust-row"><span><CheckCircle2 size={16}/> Clear, explainable signals</span><span><LockKeyhole size={16}/> Privacy-conscious by design</span></div>
      </div>
      <div className="hero-visual reveal reveal-delay">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <div className="scanner-card">
          <div className="scanner-top"><span className="scanner-label"><span className="status-dot"/> SCAMLENS / MESSAGE LAB</span><span className="scanner-live">LIVE PREVIEW</span></div>
          <div className="message-bubble"><div className="sender-avatar"><Fingerprint size={18}/></div><div><span className="message-sender">Unknown sender</span><p>Your account will be suspended today. Verify now to avoid losing access.</p></div></div>
          <div className="scan-line"/>
          <div className="signal-header"><div><span className="mini-label">SIGNAL REPORT</span><h3>Pressure tactics detected</h3></div><span className="risk-badge"><Activity size={14}/> Elevated risk</span></div>
          <div className="signal-list"><div><span className="signal-icon signal-red"><Zap size={15}/></span><div><b>Urgency and fear</b><small>Pushes you to act before thinking</small></div><span className="signal-check">!</span></div><div><span className="signal-icon signal-amber"><Fingerprint size={15}/></span><div><b>Unverified identity</b><small>Sender claims authority without proof</small></div><span className="signal-check">!</span></div><div><span className="signal-icon signal-green"><ShieldCheck size={15}/></span><div><b>Next step</b><small>Verify through an official channel</small></div><CheckCircle2 size={17} className="safe-check"/></div></div>
          <div className="scanner-footer"><span><ShieldCheck size={14}/> Educational analysis, not a guarantee</span><span className="footer-dot"/></div>
        </div>
        <div className="floating-chip chip-top"><span className="chip-icon"><ScanSearch size={17}/></span><span><b>Signals explained</b><small>Understand the why</small></span></div>
        <div className="floating-chip chip-bottom"><span className="chip-icon chip-icon-green"><LockKeyhole size={17}/></span><span><b>Your choices matter</b><small>Keep control of your data</small></span></div>
      </div>
      <a href="#features" className="hero-scroll" aria-label="Scroll to features"><span/> SCROLL TO EXPLORE <ArrowDown size={13}/></a>
    </section>
    <section className="proof-strip reveal"><div><span className="proof-icon"><ScanSearch size={19}/></span><span><b>Message analysis</b><small>Understand suspicious language</small></span></div><div><span className="proof-icon"><Globe size={19}/></span><span><b>URL inspection</b><small>Check links before opening</small></span></div><div><span className="proof-icon"><Activity size={19}/></span><span><b>Risk signals</b><small>See the reasons, not just a score</small></span></div><div><span className="proof-icon"><LockKeyhole size={19}/></span><span><b>Privacy first</b><small>Raw input is not saved by default</small></span></div></section>
    <section className="section features-section" id="features"><div className="section-heading reveal"><span className="section-kicker">A CLEARER WAY TO CHECK</span><h2>Less guesswork.<br/><span>More awareness.</span></h2><p>One calm place to inspect suspicious messages, review links and strengthen your scam-spotting instincts.</p></div><div className="feature-grid">{features.map((feature, i) => <article className="feature-card reveal" key={feature.title} style={{"--reveal-delay": `${i * 90}ms`} as React.CSSProperties}><span className="feature-icon"><feature.icon size={22}/></span><span className="feature-number">0{i+1}</span><h3>{feature.title}</h3><p>{feature.text}</p><span className="feature-arrow"><ArrowRight size={17}/></span></article>)}</div></section>
    <section className="how-section" id="how-it-works"><div className="how-inner"><div className="section-heading reveal"><span className="section-kicker">A SIMPLE ROUTINE</span><h2>Stop. Check.<br/><span>Choose wisely.</span></h2><p>ScamLens gives you a repeatable process for the moments when something feels off.</p><Link className="button button-large" href="/auth/sign-up">Try ScamLens <ArrowRight size={18}/></Link></div><div className="steps-list"><article className="step-card reveal"><span className="step-index">01</span><div className="step-icon"><MessageSquareWarning size={22}/></div><div><h3>Bring the message or link</h3><p>Paste a message or enter a URL you want to examine. Avoid sharing passwords, one-time codes or private reset links.</p></div></article><article className="step-card reveal"><span className="step-index">02</span><div className="step-icon"><ScanSearch size={22}/></div><div><h3>Review the signals</h3><p>Explore explainable indicators and practical next steps. A risk score is a heuristic, not proof that something is safe or malicious.</p></div></article><article className="step-card reveal"><span className="step-index">03</span><div className="step-icon"><ShieldCheck size={22}/></div><div><h3>Make a considered choice</h3><p>Verify with an official source, keep a record of reports and learn which tactics to watch for next time.</p></div></article></div></div></section>
    <section className="privacy-section section" id="privacy"><div className="privacy-card reveal"><div className="privacy-art"><div className="privacy-ring"><LockKeyhole size={43}/></div><span className="privacy-orbit-dot dot-a"/><span className="privacy-orbit-dot dot-b"/><span className="privacy-orbit-dot dot-c"/></div><div className="privacy-copy"><span className="section-kicker">YOUR DATA. YOUR CALL.</span><h2>Security awareness<br/>should respect <span>privacy.</span></h2><p>Local checks run on your device. Raw message input is excluded from saved reports by default. If you sign in, your report history can sync to your account, protected by database access rules.</p><div className="privacy-points"><span><CheckCircle2 size={17}/> Local history remains available</span><span><CheckCircle2 size={17}/> Cloud history tied to your account</span><span><CheckCircle2 size={17}/> You control what you submit</span></div><p className="privacy-note">ScamLens is an educational aid. It cannot guarantee that a message or link is safe.</p></div></div></section>
    <section className="final-cta"><div className="cta-orb"/><div className="reveal"><span className="section-kicker">YOUR NEXT CLICK CAN WAIT</span><h2>Make room for<br/><span>a second look.</span></h2><p>Build a calmer habit around suspicious messages, one check at a time.</p><Link className="button button-large button-light" href="/auth/sign-up">Create your free account <ArrowRight size={18}/></Link><span className="cta-login">Already have an account? <Link href="/auth/sign-in">Sign in</Link></span></div></section>
    <footer className="landing-footer"><Link className="landing-brand" href="/"><span className="brand-symbol"><ShieldCheck size={20}/></span><span>ScamLens<span className="brand-dot">.</span></span></Link><p>Understand the signal. Avoid the scam.</p><span>© {new Date().getFullYear()} ScamLens · Learn to pause before you trust.</span><Link href="/app" className="footer-app-link">Open app <ArrowRight size={14}/></Link></footer>
  </main>;
}
