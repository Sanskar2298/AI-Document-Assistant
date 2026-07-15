import { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent";

const TONE_STYLES: Record<Tone, string> = {
  neutral: "bg-white/[0.06] text-slate-300",
  success: "bg-emerald-500/15 text-emerald-400",
  warning: "bg-amber-500/15 text-amber-400",
  danger: "bg-red-500/15 text-red-400",
  accent: "bg-violet-500/15 text-violet-400",
};

export default function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONE_STYLES[tone]}`}>
      {children}
    </span>
  );
}