"use client";

import { useEffect, useState } from "react";
import { LiveWorkout } from "@/components/live-workout";
import { ACTIVITY_TYPES, TYPE_ORDER, type ActivityType, type Units } from "@/lib/activity";
import { readLive, writeLive, type LiveState } from "@/lib/live-workout";

// מסך 2 — אימון חדש: שישה סוגי פעילות. לחיצה מתחילה אימון מיד, בלי מסך ביניים.
// אם יש אימון פעיל שלא הסתיים (רענון, חזרה לאתר) — הוא נפתח שוב, מאיפה שהיה
export function WorkoutPicker({ units }: { units: Units }) {
  const [live, setLive] = useState<LiveState | null>(null);

  useEffect(() => {
    setLive(readLive());
  }, []);

  function start(type: ActivityType) {
    const state: LiveState = { type, startedAt: Date.now(), pausedAt: null, pausedTotal: 0 };
    writeLive(state);
    setLive(state);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {TYPE_ORDER.map(key => {
          const type = ACTIVITY_TYPES[key];
          return (
            <button
              key={key}
              onClick={() => start(key)}
              className="flex flex-col items-start gap-2.5 rounded-[20px] border border-card-border bg-card px-4 py-5 text-start transition-colors hover:border-brand/40 hover:bg-brand-soft/40"
            >
              <span className="ms text-[26px] text-brand-icon" aria-hidden>{type.icon}</span>
              <span className="text-[15.5px] font-medium">{type.name}</span>
              <span className="min-h-4 text-[11.5px] text-ink-3">{type.hint}</span>
            </button>
          );
        })}
      </div>
      {live && <LiveWorkout state={live} units={units} onChange={setLive} />}
    </>
  );
}
