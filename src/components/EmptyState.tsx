type EmptyStateProps = { eyebrow: string; title: string; description: string };

export default function EmptyState({ eyebrow, title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">✦</span>
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p className="supporting-text">{description}</p>
    </div>
  );
}
