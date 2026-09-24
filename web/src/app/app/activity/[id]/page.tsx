import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, Estimated, Measured, StatCard } from "@/components/app-ui";
import { RouteMapLazy } from "@/components/route-map-lazy";
import { ACTIVITY_TYPES, convertDistance, distanceUnit, paceLabel } from "@/lib/activity";
import { requireVerifiedProfile } from "@/lib/auth";
import { longDate } from "@/lib/dates";
import { sanitizeRoute } from "@/lib/geo";
import { createClient } from "@/lib/supabase/server";
import { ActivityActions } from "./activity-actions";

export const metadata: Metadata = { title: "אימון · Wellbeing" };

// עמוד אימון: מפה (אם נמדד מסלול), מדדים, שיתוף ומחיקה (docs/spec-gps-map-share.md)
export default async function ActivityPage(props: PageProps<"/app/activity/[id]">) {
  const { id } = await props.params;
  const profile = await requireVerifiedProfile(`/app/activity/${id}`);
  const supabase = await createClient();

  // RLS: אימון של משתמש אחר פשוט לא יחזור — ואז 404, בלי לחשוף שהוא קיים
  const { data: activity } = await supabase
    .from("activities")
    .select("id, type, started_at, duration_minutes, distance_km, distance_source, calories, route")
    .eq("id", id)
    .maybeSingle();
  if (!activity) notFound();

  const { data: share } = await supabase.from("activity_shares").select("token").eq("activity_id", id).maybeSingle();

  const type = ACTIVITY_TYPES[activity.type as keyof typeof ACTIVITY_TYPES];
  const route = activity.route ? sanitizeRoute(activity.route) : [];
  const km = activity.distance_km === null ? null : Number(activity.distance_km);
  const gps = activity.distance_source === "gps";
  const time = new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: profile.timezone })
    .format(new Date(activity.started_at));
  const pace = km && gps ? paceOf(activity.duration_minutes, km, profile.units) : km ? paceLabel(activity.type, profile.units) : "—";

  return (
    <>
      <header className="flex items-center gap-3 pe-12 lg:pe-0">
        <div className="flex size-11 items-center justify-center rounded-[14px] bg-brand-soft">
          <span className="ms text-[23px] text-brand-icon" aria-hidden>{type.icon}</span>
        </div>
        <div>
          <h1 className="text-[23px] font-semibold tracking-tight lg:text-[30px]">{type.name}</h1>
          <p className="text-[13px] text-ink-2">{longDate(new Date(activity.started_at), profile.timezone)} · {time}</p>
        </div>
      </header>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
        {route.length ? (
          <RouteMapLazy route={route} className="h-[300px] lg:h-[460px]" />
        ) : (
          <Card className="flex items-center gap-3 p-5 text-[13px] text-ink-2">
            <span className="ms text-[22px] text-ink-3" aria-hidden>location_off</span>
            {km === null ? "באימון הזה אין מרחק." : "אין מסלול לאימון הזה — המרחק הוערך מזמן האימון."}
          </Card>
        )}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="משך" value={activity.duration_minutes} unit="דק׳" />
            <div className="rounded-[20px] border border-card-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
                מרחק {km !== null && (gps ? <Measured /> : <Estimated />)}
              </div>
              <div className="mt-1 text-[22px] font-semibold">
                {km === null ? "—" : convertDistance(km, profile.units)}{" "}
                {km !== null && <span className="text-[12px] font-normal text-ink-2">{distanceUnit(profile.units)}</span>}
              </div>
            </div>
            <div className="rounded-[20px] border border-card-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
                קצב {pace !== "—" && (gps ? <Measured /> : <Estimated />)}
              </div>
              <div dir="ltr" className="mt-1 text-end text-[22px] font-semibold">{pace}</div>
            </div>
            <StatCard label="קלוריות" value={activity.calories} estimated />
          </div>
          <ActivityActions activityId={activity.id} sharedToken={share?.token ?? null} hasRoute={route.length > 0} />
        </div>
      </div>
    </>
  );
}

function paceOf(minutes: number, km: number, units: "metric" | "imperial") {
  const perUnit = minutes / (units === "imperial" ? km * 0.621 : km);
  if (!Number.isFinite(perUnit) || perUnit >= 60) return "—";
  const whole = Math.floor(perUnit);
  const secs = Math.round((perUnit - whole) * 60);
  return secs === 60 ? `${whole + 1}׳00` : `${whole}׳${String(secs).padStart(2, "0")}`;
}
