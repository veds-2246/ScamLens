import type { SVGProps, ReactNode } from "react";
type IconProps = SVGProps<SVGSVGElement> & { size?: number };
function Icon({ size = 24, children, ...props }: IconProps & { children: ReactNode }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>; }
export const ArrowRight = (p: IconProps) => <Icon {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></Icon>;
export const ArrowDown = (p: IconProps) => <Icon {...p}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></Icon>;
export const ShieldCheck = (p: IconProps) => <Icon {...p}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></Icon>;
export const Fingerprint = (p: IconProps) => <Icon {...p}><path d="M12 11a2 2 0 0 0-2 2c0 1.8-.2 3.5-.7 5"/><path d="M14 13c0 3-.3 5.5-1 7"/><path d="M6.7 16.5c.3-1.2.5-2.5.5-3.5a4.8 4.8 0 0 1 9.6 0c0 2.1-.1 4.1-.5 6"/><path d="M4.5 13a7.5 7.5 0 0 1 15 0"/><path d="M12 3a10 10 0 0 0-10 10c0 2.1-.3 4.2-1 6"/><path d="M22 13c0 2.4-.2 4.6-.7 6.5"/></Icon>;
export const ScanSearch = (p: IconProps) => <Icon {...p}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="11" cy="11" r="3"/><path d="m20 20-4-4"/></Icon>;
export const Sparkles = (p: IconProps) => <Icon {...p}><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/></Icon>;
export const Activity = (p: IconProps) => <Icon {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></Icon>;
export const LockKeyhole = (p: IconProps) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/><path d="M12 17v2"/></Icon>;
export const Globe = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M12 2a15 15 0 0 0 0 20"/></Icon>;
export const MessageSquareWarning = (p: IconProps) => <Icon {...p}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></Icon>;
export const History = (p: IconProps) => <Icon {...p}><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></Icon>;
export const Zap = (p: IconProps) => <Icon {...p}><path d="M13 2 3 14h8l-1 8 11-13h-8l0-7Z"/></Icon>;
export const CheckCircle2 = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></Icon>;
