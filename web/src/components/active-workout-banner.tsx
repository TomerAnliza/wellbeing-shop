"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ACTIVITY_TYPES, clock } from "@/lib/activity";
import { activeSeconds, LIVE_EVENT, readLive, type LiveState } from "@/lib/live-workout";

// פס "יש אימון פעיל" בכל מסכי האפליקציה, כשהמשתמש יצא מהאימון החי בלי לסיים.
// לחיצה מחזירה ל"אימון", שם השכבה נפתחת שוב
export function ActiveWorkoutBanner() {
  const pathname = usePathname();
  const [live, setLive] = useState<LiveState | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const sync = () => setLive(readLive());
    sync();
    window.addEventListener(LIVE_EVENT, sync);
    window.addEventListener("storage", sync); // טאב אחר
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => {
      window.removeEventListener(LIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
      clearInterval(timer);
    };
  }, [pathname]);

  if (!live || pathname === "/app/new") return null;

  return (
    <Link
      href="/app/new"
      className="fixed inset-x-5 bottom-[184px] z-[70] mx-auto flex max-w-[390px] items-center gap-3 rounded-2xl bg-[#1a1820] px-4 py-3 text-white shadow-lg lg:bottom-28"
    >
      <span className={`size-2 rounded-full bg-[oklch(0.72_0.15_300)] ${live.pausedAt ? "" : "animate-pulse"}`} aria-hidden />
      <span className="flex-1 text-[14px] font-medium">
        {ACTIVITY_TYPES[live.type].name} · {live.pausedAt ? "מושהה" : "פעיל"}
      </span>
      <span className="text-[14px] tabular-nums">{clock(activeSeconds(live))}</span>
      <span className="ms text-[20px] text-white/60" aria-hidden>chevron_left</span>
    </Link>
  );
}
