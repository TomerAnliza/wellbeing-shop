import type { Metadata } from "next";
import Link from "next/link";
import { RouteMapLazy } from "@/components/route-map-lazy";
import { ACTIVITY_TYPES } from "@/lib/activity";
import { getSharedActivity } from "@/lib/shared-activity";

// עמוד ציבורי של אימון משותף — בלי התחברות. רק מה שהבעלים בחר לשתף, בלי אזור הפרטיות
// (docs/spec-gps-map-share.md, "שיתוף")

export async function generateMetadata(props: PageProps<"/share/[token]">): Promise<Metadata> {
  const { token } = await props.params;
  const activity = await getSharedActivity(token);
  if (!activity) return { title: "Wellbeing" };
  const type = ACTIVITY_TYPES[activity.type];
  const distance = activity.distance_km ? `${activity.distance_km} ק״מ · ` : "";
  return {
    title: `${type.name} של ${activity.first_name} · Wellbeing`,
    description: `${distance}${activity.duration_minutes} דקות`,
    robots: { index: false }, // קישור שיתוף אישי — לא למנועי חיפוש
  };
}

export default async function SharedActivityPage(props: PageProps<"/share/[token]">) {
  const { token } = await props.params;
  const activity = await getSharedActivity(token);

  if (!activity) {
    return (
      <Shell>
        <div className="rounded-[26px] border border-card-border bg-card px-6 py-10 text-center">
          <span className="ms text-[38px] text-ink-3" aria-hidden>link_off</span>
          <h1 className="mt-2 text-[18px] font-semibold">האימון הזה כבר לא משותף</h1>
          <p className="mt-1 text-[13px] text-ink-2">מי ששיתף אותו הפסיק את השיתוף, או שהקישור לא נכון.</p>
        </div>
      </Shell>
    );
  }

  const type = ACTIVITY_TYPES[activity.type];
  const day = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(activity.day + "T12:00:00Z"));
  const km = activity.distance_km;
  const pace = km && activity.distance_source === "gps" ? paceOf(activity.duration_minutes, km) : null;

  return (
    <Shell>
      <header className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-[15px] bg-brand-soft">
          <span className="ms text-[25px] text-brand-icon" aria-hidden>{type.icon}</span>
        </div>
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">{type.name} של {activity.first_name}</h1>
          <p className="text-[13px] text-ink-2">{day}</p>
        </div>
      </header>

      {activity.route.length > 0 && <RouteMapLazy route={activity.route} className="h-[320px]" />}

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="דקות" value={String(activity.duration_minutes)} />
        <Stat label={activity.distance_source === "gps" ? "ק״מ · GPS" : "ק״מ · מוערך"} value={km ? String(km) : "—"} />
        <Stat label="קצב לק״מ" value={pace ?? "—"} />
      </div>

      {activity.route.length > 0 && (
        <p className="text-center text-[12px] text-ink-3">
          לשמירה על הפרטיות, תחילת המסלול וסופו לא מוצגים.
        </p>
      )}

      <Link href="/" className="rounded-[18px] bg-brand py-3.5 text-center text-[15px] font-semibold text-white hover:bg-brand-hover">
        גם אני רוצה לעקוב אחרי האימונים שלי
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-screen px-5 py-8">
      <main className="mx-auto flex max-w-lg flex-col gap-4">
        <Link href="/" className="flex items-center gap-2 self-start text-[17px] font-semibold tracking-tight">
          <span className="ms text-[24px] text-brand" aria-hidden>favorite</span>
          Wellbeing
        </Link>
        {children}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-card-border bg-card px-2 py-3.5">
      <div dir="ltr" className="text-[22px] font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-2">{label}</div>
    </div>
  );
}

function paceOf(minutes: number, km: number) {
  const perKm = minutes / km;
  if (!Number.isFinite(perKm) || perKm >= 60) return null;
  const whole = Math.floor(perKm);
  const secs = Math.round((perKm - whole) * 60);
  return secs === 60 ? `${whole + 1}׳00` : `${whole}׳${String(secs).padStart(2, "0")}`;
}
