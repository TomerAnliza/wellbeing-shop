"use client";

import { useEffect, useRef, useState } from "react";
import type { ActivityType } from "@/lib/activity";
import { judgePoint, MAX_ACCURACY_M, MAX_SPEED_KMH, type Route, type RoutePoint } from "@/lib/geo";

export type GpsStatus = "off" | "searching" | "active" | "weak" | "denied" | "unavailable";

/**
 * מעקב GPS בזמן אימון חי. כל נקודה מקבלת את זמן האימון נטו (בלי השהיות) — כך השהיה לא
 * נראית כמו עמידה במקום, ופער אמיתי (טלפון נעול) פותח קטע חדש.
 * הסינון (דיוק, רעש, קפיצות) — ב-lib/geo.ts, אותו קוד שהשרת מריץ.
 *
 * @param running  האם לאסוף כרגע (לא בהשהיה)
 * @param seconds  פונקציה שמחזירה את זמן האימון נטו, ברגע הקריאה
 * @param onRoute  נקרא עם המסלול המעודכן אחרי כל נקודה שהתקבלה
 */
export function useGpsTracker({ type, running, route, seconds, onRoute }: {
  type: ActivityType;
  running: boolean;
  route: Route;
  seconds: () => number;
  onRoute: (route: Route) => void;
}) {
  const tracked = MAX_SPEED_KMH[type] !== undefined; // רק ריצה, הליכה ואופניים
  const [status, setStatus] = useState<GpsStatus>(tracked ? "searching" : "off");

  // הערכים העדכניים, בלי להפעיל מחדש את watchPosition בכל שינוי
  const latest = useRef({ route, seconds, onRoute });
  latest.current = { route, seconds, onRoute };

  useEffect(() => {
    if (!tracked || !running) return;
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        setStatus(accuracy <= MAX_ACCURACY_M ? "active" : "weak");

        const { route: current, seconds: now, onRoute: emit } = latest.current;
        const point: RoutePoint = [latitude, longitude, Math.round(now() * 10) / 10];
        const segments = current.length ? current : [[]];
        const last = segments[segments.length - 1];
        const verdict = judgePoint(last[last.length - 1], point, accuracy, type);

        if (verdict === "reject") return;
        const next: Route =
          verdict === "gap"
            ? [...segments, [point]] // פער — קטע חדש, בלי קו ישר
            : [...segments.slice(0, -1), [...last, point]];
        emit(next);
      },
      error => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "weak"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracked, running, type]);

  return { status, tracked };
}
