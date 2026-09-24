// רכיבי תצוגה משותפים למסכי האפליקציה, לפי העיצוב (docs/design-system.md)
import Link from "next/link";
import { ACTIVITY_TYPES, activityMeta, type Units } from "@/lib/activity";
import type { Activity } from "@/lib/activities";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 pe-12 lg:pe-0">
      <div>
        <h1 className="text-[23px] font-semibold tracking-tight lg:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-ink-2 lg:text-[15px]">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-[26px] border border-card-border bg-card ${className}`}>{children}</div>;
}

/** סימון "מוערך" — ליד כל מרחק, קצב וקלוריות. המדדים מחושבים מזמן, לא נמדדו */
export function Estimated({ dark = false }: { dark?: boolean }) {
  return (
    <span
      title="מחושב מזמן האימון — בלי GPS ובלי דופק"
      className={`rounded-full px-1.5 py-px text-[10px] font-medium ${dark ? "bg-white/10 text-white/55" : "bg-ink/5 text-ink-3"}`}
    >
      מוערך
    </span>
  );
}

/** סימון "GPS" — מרחק שנמדד מהמסלול, לא הוערך */
export function Measured() {
  return (
    <span title="נמדד מהמסלול ב-GPS" className="rounded-full bg-[oklch(0.94_0.04_150)] px-1.5 py-px text-[10px] font-medium text-[oklch(0.42_0.1_150)]">
      GPS
    </span>
  );
}

/** טבעת היעד השבועי: done מתוך goal. SVG, r=45 (היקף 282.7) — כמו בעיצוב */
export function GoalRing({ done, goal }: { done: number; goal: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - circumference * Math.min(1, done / goal);
  return (
    <div className="relative size-[104px] flex-none">
      <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90" aria-hidden>
        <circle cx="52" cy="52" r="45" fill="none" stroke="rgba(28,27,25,0.08)" strokeWidth="11" />
        <circle
          cx="52" cy="52" r="45" fill="none" stroke="var(--brand)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-label={`${done} מתוך ${goal} אימונים`}>
        <div className="text-[26px] leading-none font-semibold">{done}</div>
        <div className="mt-0.5 text-[11px] text-ink-2">מתוך {goal}</div>
      </div>
    </div>
  );
}

export function ActivityRow({ activity, when, units }: { activity: Activity; when: string; units: Units }) {
  const type = ACTIVITY_TYPES[activity.type];
  return (
    <Link href={`/app/activity/${activity.id}`} className="flex items-center gap-3 rounded-[18px] border border-card-border bg-card px-4 py-3.5 transition-colors hover:border-brand/30">
      <div className="flex size-10 flex-none items-center justify-center rounded-[13px] bg-brand-soft">
        <span className="ms text-[21px] text-brand-icon" aria-hidden>{type.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium">{type.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-2">
          <span>{activityMeta(activity.duration_minutes, activity.distance_km, units)}</span>
          {activity.distance_km !== null && (activity.distance_source === "gps" ? <Measured /> : <Estimated />)}
        </div>
      </div>
      <div className="text-[12px] text-ink-3">{when}</div>
    </Link>
  );
}

export function StatCard({ label, value, unit, estimated }: { label: string; value: string | number; unit?: string; estimated?: boolean }) {
  return (
    <div className="rounded-[20px] border border-card-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
        {label}
        {estimated && <Estimated />}
      </div>
      <div className="mt-1 text-[22px] font-semibold">
        {value} {unit && <span className="text-[12px] font-normal text-ink-2">{unit}</span>}
      </div>
    </div>
  );
}
