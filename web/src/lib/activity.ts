// סוגי הפעילות, והחישובים של מדדי האימון. פונקציות טהורות — רצות גם בשרת וגם בדפדפן.
//
// המדדים הם הערכה בלבד: מחושבים מזמן האימון, בלי GPS, דופק או משקל.
// לכן כל מרחק, קצב וקלוריות מסומנים בממשק "מוערך" (docs/spec-auth-and-app.md, "חוב אמינות").

export type ActivityType = "run" | "walk" | "bike" | "swim" | "yoga" | "strength";
export type Units = "metric" | "imperial";

type TypeInfo = {
  name: string;
  icon: string; // Material Symbols
  hint: string;
  speedKmh: number | null; // מהירות להערכת מרחק. null = אין מרחק לסוג הזה
  kcalPerMinute: number;
};

// קלוריות לדקה — מהעיצוב. מהירויות לכל סוג — במקום 9.6 קמ"ש קבוע לכולם (חוב אמינות 1).
// הרמזים בלי "GPS" — אין GPS (חוב אמינות 2)
export const ACTIVITY_TYPES: Record<ActivityType, TypeInfo> = {
  run: { name: "ריצה", icon: "directions_run", hint: "מרחק וקצב מוערכים", speedKmh: 9.6, kcalPerMinute: 10.6 },
  walk: { name: "הליכה", icon: "directions_walk", hint: "מרחק מוערך", speedKmh: 5, kcalPerMinute: 4.5 },
  bike: { name: "אופניים", icon: "pedal_bike", hint: "מרחק מוערך", speedKmh: 18, kcalPerMinute: 9.2 },
  swim: { name: "שחייה", icon: "pool", hint: "זמן וקלוריות", speedKmh: null, kcalPerMinute: 8.8 },
  yoga: { name: "יוגה", icon: "self_improvement", hint: "גמישות", speedKmh: null, kcalPerMinute: 3.4 },
  strength: { name: "כוח", icon: "fitness_center", hint: "סטים וחזרות", speedKmh: null, kcalPerMinute: 6.4 },
};

export const TYPE_ORDER: ActivityType[] = ["run", "walk", "bike", "swim", "yoga", "strength"];

export function isActivityType(value: unknown): value is ActivityType {
  return typeof value === "string" && value in ACTIVITY_TYPES;
}

/** הערכת מרחק וקלוריות לפי משך. מרחק null לסוג בלי מהירות */
export function estimate(type: ActivityType, minutes: number) {
  const info = ACTIVITY_TYPES[type];
  return {
    calories: Math.round(minutes * info.kcalPerMinute),
    distanceKm: info.speedKmh === null ? null : Math.round((minutes / 60) * info.speedKmh * 100) / 100,
  };
}

// ── יחידות ──
const KM_TO_MILES = 0.621;

export function distanceUnit(units: Units) {
  return units === "imperial" ? "מייל" : "ק״מ";
}

/** ק"מ → מספר ביחידה של המשתמש, עם ספרה אחת אחרי הנקודה */
export function convertDistance(km: number, units: Units) {
  const value = units === "imperial" ? km * KM_TO_MILES : km;
  return Math.round(value * 10) / 10;
}

/**
 * קצב מוערך: דקות לק"מ (או למייל), בפורמט 6′15. סימן הדקות הלטיני (′), לא הגרש העברי (׳):
 * הגרש הוא תו מימין-לשמאל, ובתוך מספר הוא מתהפך — "6׳15" מוצג "15׳6". "—" לסוג בלי מרחק.
 * המהירות קבועה לכל סוג, ולכן גם הקצב — מחשבים אותו ישר מהמהירות, ולא מהמרחק
 * המעוגל (בתחילת אימון, מרחק של 0.02 ק"מ מעוות את הקצב)
 */
export function paceLabel(type: ActivityType, units: Units) {
  const speed = ACTIVITY_TYPES[type].speedKmh;
  if (!speed) return "—";
  const minutesPerUnit = 60 / (units === "imperial" ? speed * KM_TO_MILES : speed);
  let whole = Math.floor(minutesPerUnit);
  let seconds = Math.round((minutesPerUnit - whole) * 60);
  if (seconds === 60) {
    whole += 1;
    seconds = 0;
  }
  return `${whole}′${String(seconds).padStart(2, "0")}`;
}

/** שעון: 05:42, או 1:05:42 אחרי שעה */
export function clock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** שורת המטא ברשימה: "4.8 ק״מ · 30 דק׳" או "20 דק׳" */
export function activityMeta(minutes: number, km: number | null, units: Units) {
  return km ? `${convertDistance(km, units)} ${distanceUnit(units)} · ${minutes} דק׳` : `${minutes} דק׳`;
}
