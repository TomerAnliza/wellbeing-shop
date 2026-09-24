"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveActivity } from "@/app/actions/activity";
import { Estimated } from "@/components/app-ui";
import { useGpsTracker, type GpsStatus } from "@/hooks/use-gps-tracker";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { ACTIVITY_TYPES, clock, convertDistance, distanceUnit, estimate, paceLabel, type Units } from "@/lib/activity";
import { pointCount, routeKm, type Route } from "@/lib/geo";
import { activeSeconds, pause, resume, writeLive, type LiveState } from "@/lib/live-workout";

// מסך 3 — אימון חי: שכבה כהה מעל הכול, שעון, שלושה מדדים, ושלושה כפתורים:
// השהה/המשך, סיום ושמירה, וביטול עם אישור.
// ריצה, הליכה ואופניים: מרחק וקצב מה-GPS, והמסך נשאר דלוק (docs/spec-gps-map-share.md)
export function LiveWorkout({ state, units, onChange }: { state: LiveState; units: Units; onChange: (state: LiveState | null) => void }) {
  const router = useRouter();
  const [, setTick] = useState(0);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  // המצב העדכני — ה-GPS מעדכן אותו מתוך callback, בלי לחכות לרינדור
  const latest = useRef(state);
  latest.current = state;

  function update(next: LiveState | null) {
    if (next) latest.current = next;
    writeLive(next);
    onChange(next);
  }

  const paused = state.pausedAt !== null;
  const route = state.route ?? [];
  const gps = useGpsTracker({
    type: state.type,
    running: !paused && !saving,
    route,
    seconds: () => activeSeconds(latest.current),
    onRoute: next => update({ ...latest.current, route: next }),
  });
  const screenOn = useWakeLock(true);

  // רינדור מחדש פעמיים בשנייה. הזמן עצמו מחושב מחותמות הזמן, לא מהטיימר הזה
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(timer);
  }, [paused]);

  const type = ACTIVITY_TYPES[state.type];
  const seconds = activeSeconds(state);
  const minutes = seconds / 60;
  const estimated = estimate(state.type, minutes);

  // מרחק: מהמסלול כשיש GPS, אחרת הערכה מזמן
  const gpsKm = gps.tracked && pointCount(route) >= 2 ? routeKm(route, state.type) : null;
  const km = gpsKm ?? estimated.distanceKm;
  const measured = gpsKm !== null;
  const pace = measured && gpsKm > 0.05 ? paceFromDistance(minutes, gpsKm, units) : paceLabel(state.type, units);

  function finish() {
    setError(null);
    const endedAt = Date.now();
    const final = latest.current;
    startSaving(async () => {
      const result = await saveActivity({
        type: final.type,
        startedAt: final.startedAt,
        endedAt,
        activeSeconds: activeSeconds(final, endedAt),
        route: final.route ?? [],
      });
      if (!result.ok) {
        // כשל בשמירה — האימון לא נמחק, ואפשר לנסות שוב
        setError(result.error);
        return;
      }
      writeLive(null);
      router.push("/app?saved=1");
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`אימון ${type.name}`}
      className="fixed inset-0 z-[80] flex flex-col bg-[#1a1820] px-6 pt-14 pb-10 text-white lg:pt-24"
    >
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col">
        <div className="flex items-center justify-center gap-2.5">
          <span className={`size-[7px] rounded-full bg-[oklch(0.72_0.15_300)] ${paused ? "" : "animate-pulse"}`} aria-hidden />
          <span className="text-[13px] tracking-[0.08em] text-white/60">
            {type.name} · {paused ? "מושהה" : "פעיל"}
          </span>
        </div>
        {gps.tracked && <GpsBadge status={gps.status} />}

        <div className="flex flex-1 flex-col items-center justify-center gap-7">
          <div className="text-[68px] leading-none font-light tracking-tight tabular-nums" aria-live="off">
            {clock(seconds)}
          </div>
          <div className="flex gap-8 text-center">
            <Metric
              value={km === null ? "—" : convertDistance(km, units).toFixed(2)}
              label={distanceUnit(units)}
              tag={km === null ? null : measured ? "gps" : "estimated"}
            />
            <Metric value={String(estimated.calories)} label="קלוריות" tag="estimated" />
            <Metric value={pace} label="קצב" tag={pace === "—" ? null : measured ? "gps" : "estimated"} />
          </div>
          <p className="max-w-[320px] text-center text-[11.5px] leading-relaxed text-white/40">
            {gps.tracked
              ? `${screenOn ? "המסך יישאר דלוק. " : ""}נעילת הטלפון או מעבר לאפליקציה אחרת עוצרים את מדידת המסלול.`
              : "מרחק, קצב וקלוריות מחושבים מזמן האימון — בלי GPS ובלי דופק"}
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-3 rounded-xl bg-[oklch(0.35_0.08_30)] px-4 py-3 text-center text-[13px]">
            {error}
          </p>
        )}

        {confirmCancel ? (
          <div className="flex flex-col gap-3 rounded-[20px] bg-white/6 p-4">
            <p className="text-center text-[14px]">לבטל את האימון? הוא לא יישמר.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancel(false)} className="flex-1 rounded-[16px] border border-white/20 py-3.5 text-[15px] font-medium hover:bg-white/10">
                להמשיך באימון
              </button>
              <button onClick={() => { update(null); router.push("/app"); }} className="flex-1 rounded-[16px] bg-[oklch(0.55_0.12_30)] py-3.5 text-[15px] font-semibold hover:brightness-110">
                לבטל
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => update(paused ? resume(latest.current) : pause(latest.current))}
                disabled={saving}
                className="flex-1 rounded-[18px] border border-white/18 bg-white/6 py-4 text-[15.5px] font-medium hover:bg-white/12 disabled:opacity-50"
              >
                {paused ? "המשך" : "השהה"}
              </button>
              <button
                onClick={finish}
                disabled={saving}
                className="flex-1 rounded-[18px] bg-brand py-4 text-[15.5px] font-semibold hover:bg-brand-hover disabled:opacity-60"
              >
                {saving ? "שומרים..." : error ? "לנסות שוב" : "סיום ושמירה"}
              </button>
            </div>
            <button onClick={() => setConfirmCancel(true)} disabled={saving} className="py-2 text-[13px] text-white/50 hover:text-white/80">
              ביטול בלי שמירה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** קצב אמיתי: דקות לק"מ (או למייל) מהמרחק הנמדד, בפורמט 6׳15 */
function paceFromDistance(minutes: number, km: number, units: Units) {
  const perUnit = minutes / (units === "imperial" ? km * 0.621 : km);
  if (!Number.isFinite(perUnit) || perUnit >= 60) return "—";
  let whole = Math.floor(perUnit);
  let secs = Math.round((perUnit - whole) * 60);
  if (secs === 60) {
    whole += 1;
    secs = 0;
  }
  return `${whole}׳${String(secs).padStart(2, "0")}`;
}

const GPS_LABELS: Record<GpsStatus, { text: string; tone: string }> = {
  off: { text: "", tone: "" },
  searching: { text: "מחפשים אות GPS…", tone: "text-white/50" },
  active: { text: "GPS פעיל", tone: "text-[oklch(0.8_0.12_150)]" },
  weak: { text: "אות GPS חלש", tone: "text-[oklch(0.8_0.12_70)]" },
  denied: { text: "אין הרשאת מיקום — המרחק יוערך מזמן", tone: "text-white/50" },
  unavailable: { text: "אין GPS בדפדפן — המרחק יוערך מזמן", tone: "text-white/50" },
};

function GpsBadge({ status }: { status: GpsStatus }) {
  const label = GPS_LABELS[status];
  return (
    <div className={`mt-2 flex items-center justify-center gap-1.5 text-[12px] ${label.tone}`} aria-live="polite">
      <span className="ms text-[15px]" aria-hidden>{status === "active" ? "my_location" : "location_searching"}</span>
      {label.text}
    </div>
  );
}

function Metric({ value, label, tag }: { value: string; label: string; tag: "gps" | "estimated" | null }) {
  return (
    <div>
      <div dir="ltr" className="text-[22px] font-medium tabular-nums">{value}</div>
      <div className="mt-1 flex items-center justify-center gap-1 text-[11.5px] text-white/45">
        {label}
        {tag === "estimated" && <Estimated dark />}
        {tag === "gps" && <span className="rounded-full bg-[oklch(0.45_0.1_150)]/40 px-1.5 py-px text-[10px] font-medium text-[oklch(0.85_0.1_150)]">GPS</span>}
      </div>
    </div>
  );
}
