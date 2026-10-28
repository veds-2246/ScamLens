type BadgeProps = { children: React.ReactNode; tone?: "teal" | "warning" | "neutral" };

export default function Badge({ children, tone = "teal" }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
