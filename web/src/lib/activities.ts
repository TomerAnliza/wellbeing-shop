import "server-only";
import { addDays, localDay, weekStart } from "@/lib/dates";
import type { ActivityType } from "@/lib/activity";
import type { Profile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type Activity = {
  id: string;
  type: ActivityType;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  distance_km: number | null;
  calories: number;
  is_estimated: boolean;
  distance_source: "estimated" | "gps";
};

export type Dashboard = {
  recent: Activity[];
  week: {
    start: string; // יום ראשון, YYYY-MM-DD
    count: number;
    minutes: number;
    km: number;
    calories: number;
    minutesPerDay: number[]; // 7 ימים, ראשון עד שבת
  };
  streak: number;
};

// כל המדדים נגזרים מ-activities ואינם נשמרים — אחרת היו שני מקורות אמת (spec-mvp-screens.md).
// שליפה אחת של 60 הימים האחרונים מספיקה לרשימה, לשבוע ולרצף. RLS מחזיר רק אימונים של המשתמש
export async function getDashboard(profile: Profile, now = new Date()): Promise<Dashboard> {
  const supabase = await createClient();
  const since = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("activities")
    .select("id, type, started_at, ended_at, duration_minutes, distance_km, calories, is_estimated, distance_source")
    .gte("started_at", since)
    .order("started_at", { ascending: false });
  if (error) throw new Error("activities query failed: " + error.message);

  const activities = (data ?? []).map(row => ({
    ...row,
    distance_km: row.distance_km === null ? null : Number(row.distance_km),
  })) as Activity[];
  const tz = profile.timezone;
  const today = localDay(now, tz);
  const start = weekStart(today);

  // ── השבוע ──
  const minutesPerDay = [0, 0, 0, 0, 0, 0, 0];
  let count = 0, minutes = 0, km = 0, calories = 0;
  for (const activity of activities) {
    const day = localDay(activity.started_at, tz);
    if (day < start || day > addDays(start, 6)) continue;
    const index = Math.round((Date.parse(day) - Date.parse(start)) / 86_400_000);
    minutesPerDay[index] += activity.duration_minutes;
    count += 1;
    minutes += activity.duration_minutes;
    km += activity.distance_km ?? 0;
    calories += activity.calories;
  }

  // ── רצף: ימים רצופים עם אימון, עד היום. אם היום עוד אין — סופרים עד אתמול (בלי "שברת רצף") ──
  const activeDays = new Set(activities.map(a => localDay(a.started_at, tz)));
  let day = activeDays.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (activeDays.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }

  return {
    recent: activities.slice(0, 10),
    week: { start, count, minutes, km: Math.round(km * 100) / 100, calories, minutesPerDay },
    streak,
  };
}
