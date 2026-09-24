import type { Metadata } from "next";
import Link from "next/link";
import { ActivityRow, Card, GoalRing } from "@/components/app-ui";
import { Toast } from "@/components/toast";
import { convertDistance, distanceUnit } from "@/lib/activity";
import { getDashboard } from "@/lib/activities";
import { requireVerifiedProfile } from "@/lib/auth";
import { greeting, longDate, whenLabel } from "@/lib/dates";

export const metadata: Metadata = { title: "היום · Wellbeing" };

// מסך 1 — היום: ברכה, רצף, טבעת היעד השבועי, "התחל אימון" והפעילויות האחרונות.
// docs/spec-mvp-screens.md + ההחלטות ב-docs/spec-auth-and-app.md
export default async function TodayPage(props: PageProps<"/app">) {
  const profile = await requireVerifiedProfile("/app");
  const { saved } = await props.searchParams;
  const now = new Date();
  const { recent, week, streak } = await getDashboard(profile, now);
  const tz = profile.timezone;
  const firstName = profile.display_name.split(" ")[0];

  return (
    <>
      <header className="flex items-start justify-between gap-3 pe-12 lg:pe-0">
        <div>
          <h1 className="text-[23px] font-semibold tracking-tight lg:text-[30px]">
            {greeting(now, tz)}, {firstName}
          </h1>
          <p className="mt-0.5 text-[13px] text-ink-2 lg:text-[15px]">{longDate(now, tz)}</p>
        </div>
        {profile.show_streak && streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-ink/8 bg-card py-1.5 ps-2.5 pe-3">
            <span className="ms text-[17px] text-brand" aria-hidden>local_fire_department</span>
            <span className="text-[13px] font-semibold">{streak} {streak === 1 ? "יום" : "ימים"}</span>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-4">
          {/* היעד השבועי */}
          <Card className="flex items-center gap-5 p-5">
            <GoalRing done={week.count} goal={profile.weekly_goal} />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="text-[14px] font-semibold">היעד השבועי</div>
              <div className="flex gap-4">
                <div>
                  <div className="text-[19px] leading-tight font-semibold">{week.minutes}</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-2">דקות</div>
                </div>
                <div className="w-px bg-ink/10" />
                <div>
                  <div className="text-[19px] leading-tight font-semibold">{convertDistance(week.km, profile.units)}</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-2">{distanceUnit(profile.units)} · מוערך</div>
                </div>
              </div>
            </div>
          </Card>

          {/* הפעולה הראשית במסך */}
          <Link
            href="/app/new"
            className="flex items-center justify-center gap-2 rounded-[18px] bg-brand py-4 text-[16px] font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            <span className="ms text-[21px]" aria-hidden>play_arrow</span>
            התחל אימון
          </Link>
        </div>

        <section className="flex flex-col gap-2.5">
          <h2 className="px-0.5 text-[13px] font-semibold text-ink-2">הפעילויות שלי</h2>
          {recent.length === 0 ? (
            // מצב ריק: תומך, בלי "0" מאיים
            <Card className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="ms text-[34px] text-brand-icon" aria-hidden>directions_run</span>
              <div className="text-[15px] font-semibold">עוד אין אימונים</div>
              <p className="text-[13px] text-ink-2">הראשון במרחק שתי לחיצות.</p>
            </Card>
          ) : (
            recent.map(activity => (
              <ActivityRow key={activity.id} activity={activity} units={profile.units} when={whenLabel(activity.started_at, now, tz)} />
            ))
          )}
        </section>
      </div>

      {saved === "1" && <Toast message="האימון נשמר" />}
    </>
  );
}
