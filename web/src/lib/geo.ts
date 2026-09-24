// גיאומטריה של מסלול — פונקציות טהורות, רצות גם בדפדפן (תצוגה חיה) וגם בשרת (החישוב הקובע).
// אפיון: docs/spec-gps-map-share.md
import type { ActivityType } from "@/lib/activity";

/** נקודה: [קו רוחב, קו אורך, שניות אימון נטו מההתחלה] */
export type RoutePoint = [number, number, number];
/** מסלול: קטעים. השהיה או פער של יותר מ-30 שניות פותחים קטע חדש — בלי קו ישר ביניהם */
export type Route = RoutePoint[][];

export const MAX_ACCURACY_M = 30; // נקודה פחות מדויקת מזה — נזרקת
export const MIN_STEP_M = 3; // תזוזה קטנה מזה — רעש של GPS כשעומדים
export const GAP_SECONDS = 30; // בלי נקודות יותר מזה — קטע חדש
const MIN_POINTS = 10;
const MIN_KM = 0.1;
const MAX_POINTS = 20_000;

/** מהירות מקסימלית סבירה לכל סוג, בקמ"ש. מעבר לזה — קפיצת GPS, לא תנועה */
export const MAX_SPEED_KMH: Partial<Record<ActivityType, number>> = { run: 30, walk: 12, bike: 70 };

/** מרחק בין שתי נקודות, במטרים (נוסחת Haversine) */
export function distanceM(a: RoutePoint, b: RoutePoint): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * האם לקבל נקודה חדשה, ביחס לקודמת בקטע. משמש בדפדפן בזמן האימון.
 * "gap" — הנקודה תקינה, אבל עבר יותר מדי זמן: היא פותחת קטע חדש.
 */
export function judgePoint(prev: RoutePoint | undefined, next: RoutePoint, accuracyM: number, type: ActivityType):
  "accept" | "reject" | "gap" {
  if (!(accuracyM <= MAX_ACCURACY_M)) return "reject";
  if (!prev) return "accept";
  const seconds = next[2] - prev[2];
  if (seconds > GAP_SECONDS) return "gap";
  const meters = distanceM(prev, next);
  if (meters < MIN_STEP_M) return "reject";
  if (seconds > 0 && (meters / seconds) * 3.6 > (MAX_SPEED_KMH[type] ?? 70)) return "reject";
  return "accept";
}

/** מרחק כולל בק"מ. בתוך קטע בלבד; צעד עם פער זמן או מהירות בלתי אפשרית — לא נספר */
export function routeKm(route: Route, type: ActivityType): number {
  const maxSpeed = MAX_SPEED_KMH[type] ?? 70;
  let meters = 0;
  for (const segment of route) {
    for (let i = 1; i < segment.length; i++) {
      const step = distanceM(segment[i - 1], segment[i]);
      const seconds = segment[i][2] - segment[i - 1][2];
      if (seconds <= 0 || seconds > GAP_SECONDS) continue;
      if ((step / seconds) * 3.6 > maxSpeed) continue;
      meters += step;
    }
  }
  return meters / 1000;
}

export function pointCount(route: Route): number {
  return route.reduce((sum, segment) => sum + segment.length, 0);
}

/**
 * המרחק הנמדד, או null אם המדידה לא אמינה: מעט מדי נקודות, פחות מ-100 מ',
 * או ממוצע מהיר מהאפשרי לסוג (ואז חוזרים להערכה מזמן, "מוערך")
 */
export function measuredKm(route: Route, type: ActivityType, activeMinutes: number): number | null {
  const maxSpeed = MAX_SPEED_KMH[type];
  if (!maxSpeed || pointCount(route) < MIN_POINTS) return null;
  const km = routeKm(route, type);
  if (km < MIN_KM) return null;
  if (activeMinutes > 0 && km / (activeMinutes / 60) > maxSpeed) return null;
  return Math.round(km * 100) / 100;
}

/**
 * ניקוי קלט מהדפדפן: מבנה, מספרים סופיים, טווחי קואורדינטות, זמן עולה. לא סומכים על הדפדפן.
 * מחזיר מסלול תקין (אולי ריק) — אף פעם לא זורק
 */
export function sanitizeRoute(input: unknown): Route {
  if (!Array.isArray(input)) return [];
  const route: Route = [];
  let total = 0;
  for (const rawSegment of input) {
    if (!Array.isArray(rawSegment)) continue;
    const segment: RoutePoint[] = [];
    for (const raw of rawSegment) {
      if (total >= MAX_POINTS) break;
      if (!Array.isArray(raw) || raw.length < 3) continue;
      const [lat, lng, t] = raw.map(Number);
      const valid = Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(t) &&
        Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && t >= 0 &&
        (segment.length === 0 || t >= segment[segment.length - 1][2]);
      if (!valid) continue;
      segment.push([lat, lng, t]);
      total += 1;
    }
    if (segment.length > 0) route.push(segment);
  }
  return route;
}

/** דילול לשמירה ולמפה: נקודה כל 10 מ' לפחות (הראשונה והאחרונה נשמרות), 5 ספרות אחרי הנקודה (~1 מ') */
export function simplifyRoute(route: Route, minMeters = 10): Route {
  const round = (n: number) => Math.round(n * 1e5) / 1e5;
  return route
    .map(segment => {
      const kept: RoutePoint[] = [];
      segment.forEach((point, i) => {
        const last = kept[kept.length - 1];
        if (!last || i === segment.length - 1 || distanceM(last, point) >= minMeters) {
          kept.push([round(point[0]), round(point[1]), Math.round(point[2])]);
        }
      });
      return kept;
    })
    .filter(segment => segment.length > 1);
}

/**
 * אזור פרטיות לשיתוף: מוריד את `meters` הראשונים והאחרונים של המסלול.
 * מסלול קצר מפעמיים המרחק הזה — לא נשאר ממנו כלום, וזה בכוונה
 */
export function trimRoute(route: Route, meters = 200): Route {
  const flat = route.flatMap((segment, s) => segment.map(point => ({ point, s })));
  if (flat.length < 2) return [];

  const cutFromStart = (items: typeof flat) => {
    let walked = 0;
    for (let i = 1; i < items.length; i++) {
      if (items[i].s === items[i - 1].s) walked += distanceM(items[i - 1].point, items[i].point);
      if (walked >= meters) return items.slice(i);
    }
    return [];
  };

  const trimmed = cutFromStart(cutFromStart(flat).reverse()).reverse();
  const result: Route = [];
  for (const { point, s } of trimmed) {
    const current = result[result.length - 1] as (RoutePoint[] & { s?: number }) | undefined;
    if (current && current.s === s) current.push(point);
    else result.push(Object.assign([point], { s }));
  }
  return result.map(segment => [...segment]).filter(segment => segment.length > 1);
}
