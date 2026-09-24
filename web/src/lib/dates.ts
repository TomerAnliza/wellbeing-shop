// תאריכים לפי אזור הזמן של המשתמש (ברירת מחדל Asia/Jerusalem).
// "יום" הוא תאריך מקומי בפורמט YYYY-MM-DD — כך אימון ב-23:30 שייך ליום הנכון.
// השבוע מתחיל ביום ראשון, כמו בישראל.

/** חותמת זמן → "2026-09-23" באזור הזמן הנתון */
export function localDay(date: Date | string, timeZone: string): string {
  return new Date(date).toLocaleDateString("en-CA", { timeZone });
}

/** "2026-09-23" + n ימים */
export function addDays(day: string, n: number): string {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = ראשון ... 6 = שבת */
export function weekday(day: string): number {
  return new Date(day + "T12:00:00Z").getUTCDay();
}

/** יום ראשון של השבוע שבו נמצא היום הנתון */
export function weekStart(day: string): string {
  return addDays(day, -weekday(day));
}

export const DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

/** "רביעי, 23 בספטמבר" */
export function longDate(date: Date, timeZone: string): string {
  const day = localDay(date, timeZone);
  const dayMonth = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", timeZone }).format(date);
  return `${DAY_NAMES[weekday(day)]}, ${dayMonth}`;
}

/** ברכה לפי שעה מקומית */
export function greeting(date: Date, timeZone: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(date));
  if (hour >= 5 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 17) return "צהריים טובים";
  if (hour >= 17 && hour < 22) return "ערב טוב";
  return "לילה טוב";
}

/** מתי היה האימון: "07:10" היום, "אתמול", "שישי" בשבוע האחרון, אחרת "12 בספטמבר" */
export function whenLabel(startedAt: string, now: Date, timeZone: string): string {
  const day = localDay(startedAt, timeZone);
  const today = localDay(now, timeZone);
  if (day === today) {
    return new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone })
      .format(new Date(startedAt));
  }
  if (day === addDays(today, -1)) return "אתמול";
  if (day > addDays(today, -7)) return DAY_NAMES[weekday(day)];
  return new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", timeZone }).format(new Date(startedAt));
}

/** טווח השבוע: "21–27 בספטמבר", או "28 בספטמבר – 4 באוקטובר" */
export function weekRangeLabel(start: string): string {
  const end = addDays(start, 6);
  const fmt = (day: string, withMonth: boolean) =>
    new Intl.DateTimeFormat("he-IL", { day: "numeric", ...(withMonth ? { month: "long" } : {}), timeZone: "UTC" })
      .format(new Date(day + "T12:00:00Z"));
  return start.slice(5, 7) === end.slice(5, 7)
    ? `${fmt(start, false)}–${fmt(end, true)}`
    : `${fmt(start, true)} – ${fmt(end, true)}`;
}
