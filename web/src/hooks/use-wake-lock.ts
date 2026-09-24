"use client";

import { useEffect, useState } from "react";

// שומר את המסך דלוק כל עוד הרכיב פעיל (Screen Wake Lock API).
// הדפדפן משחרר את הנעילה כשהעמוד מוסתר, ולכן מבקשים אותה שוב כשחוזרים (visibilitychange) — לפי MDN.
// מחזיר אם הנעילה פעילה כרגע. בדפדפן בלי תמיכה — false, והאימון עובד כרגיל
export function useWakeLock(enabled: boolean) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire() {
      if (document.visibilityState !== "visible") return;
      try {
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await lock.release();
          return;
        }
        setActive(true);
        lock.addEventListener("release", () => setActive(false));
      } catch {
        setActive(false); // למשל: מצב חיסכון בסוללה
      }
    }

    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", acquire);
      lock?.release().catch(() => {});
    };
  }, [enabled]);

  return active;
}
