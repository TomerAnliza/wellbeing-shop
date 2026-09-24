// מצב האימון החי — נשמר ב-localStorage, כדי שרענון או סגירת הדפדפן לא יאבדו אותו.
// נשמרות רק חותמות זמן: הזמן שעבר מחושב מהן, ולא מספירת שניות — setInterval לא מדויק,
// ולא רץ כשהטאב ברקע (tech-stack.md, נקודת זהירות 3).
import type { ActivityType } from "@/lib/activity";

export type LiveState = {
  type: ActivityType;
  startedAt: number; // ms
  pausedAt: number | null; // ms, כשהאימון מושהה
  pausedTotal: number; // ms של השהיות שהסתיימו
};

const KEY = "wellbeing.liveWorkout";
export const LIVE_EVENT = "wellbeing:live-workout"; // עדכון בין רכיבים באותו טאב

export function readLive(): LiveState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as LiveState;
    // אימון בן יותר מיממה כנראה נשכח — לא מחזירים אותו
    if (!state.startedAt || Date.now() - state.startedAt > 24 * 60 * 60 * 1000) return null;
    return state;
  } catch {
    return null;
  }
}

export function writeLive(state: LiveState | null) {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
    else localStorage.removeItem(KEY);
  } catch {
    // מצב פרטי / אחסון חסום — האימון עדיין רץ, רק לא ישרוד רענון
  }
  window.dispatchEvent(new Event(LIVE_EVENT));
}

/** שניות אימון נטו — בלי השהיות */
export function activeSeconds(state: LiveState, now = Date.now()) {
  const end = state.pausedAt ?? now;
  return Math.max(0, (end - state.startedAt - state.pausedTotal) / 1000);
}

export function pause(state: LiveState, now = Date.now()): LiveState {
  return state.pausedAt ? state : { ...state, pausedAt: now };
}

export function resume(state: LiveState, now = Date.now()): LiveState {
  return state.pausedAt ? { ...state, pausedAt: null, pausedTotal: state.pausedTotal + (now - state.pausedAt) } : state;
}
