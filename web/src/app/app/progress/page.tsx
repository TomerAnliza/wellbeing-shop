import type { Metadata } from "next";
import { Card, PageHeader, StatCard } from "@/components/app-ui";
import { convertDistance, distanceUnit } from "@/lib/activity";
import { getDashboard } from "@/lib/activities";
import { requireVerifiedProfile } from "@/lib/auth";
import { addDays, DAY_LETTERS, localDay, weekRangeLabel } from "@/lib/dates";

export const metadata: Metadata = { title: "התקדמות · Wellbeing" };

// מסך 4 — התקדמות: סך הדקות, שבע עמודות (ראשון–שבת) וארבעה מדדים.
// בעיצוב הגבהים קבועים והרצף מקובע ל-6 — כאן הכול מחושב מנתוני אמת
export default async function ProgressPage() {
  const profile = await requireVerifiedProfile("/app/progress");
  const { week, streak } = await getDashboard(profile);
  const today = localDay(new Date(), profile.timezone);
  const peak = Math.max(...week.minutesPerDay, 1);

  return (
    <>
      <PageHeader title="התקדמות" subtitle={`השבוע · ${weekRangeLabel(week.start)}`} />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
        <Card className="p-5">
          <div className="flex items-baseline gap-2">
            <div className="text-[28px] leading-none font-semibold">{week.minutes}</div>
            <div className="text-[13px] text-ink-2">דקות פעילות השבוע</div>
          </div>
          <div className="mt-5 flex h-[150px] items-end justify-between gap-2" role="img"
               aria-label={`דקות לפי יום: ${week.minutesPerDay.map((m, i) => `${DAY_LETTERS[i]} ${m}`).join(", ")}`}>
            {week.minutesPerDay.map((minutes, i) => {
              const day = addDays(week.start, i);
              const future = day > today;
              // יום בלי אימון — עמודה נמוכה בצבע ניטרלי, לא אדום (תמיכה במקום אשמה)
              const height = minutes > 0 ? Math.max(14, Math.round((minutes / peak) * 112)) : 8;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  {minutes > 0 && <div className="text-[10.5px] text-ink-3 tabular-nums">{minutes}</div>}
                  <div
                    className={`w-full max-w-[26px] rounded-lg ${minutes > 0 ? "bg-brand" : "bg-brand-neutral"} ${future ? "opacity-40" : ""}`}
                    style={{ height }}
                  />
                  <div className={`text-[11px] ${day === today ? "font-semibold text-ink" : "text-ink-3"}`}>{DAY_LETTERS[i]}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="מרחק" value={convertDistance(week.km, profile.units)} unit={distanceUnit(profile.units)} estimated />
          <StatCard label="קלוריות" value={week.calories} estimated />
          <StatCard label="אימונים" value={`${week.count}/${profile.weekly_goal}`} />
          <StatCard label="רצף" value={streak} unit={streak === 1 ? "יום" : "ימים"} />
        </div>
      </div>

      {week.count === 0 && (
        <p className="text-center text-[13px] text-ink-2">
          השבוע רק התחיל. האימון הראשון ימלא את העמודה של היום.
        </p>
      )}
    </>
  );
}
