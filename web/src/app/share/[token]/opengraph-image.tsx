import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ACTIVITY_TYPES } from "@/lib/activity";
import { getSharedActivity } from "@/lib/shared-activity";

// תמונת התצוגה המקדימה של קישור שיתוף (וואטסאפ, טלגרם...). קו המסלול ומדדים — בלי אריחי מפה,
// כי אריחים חיצוניים לא נטענים בזמן יצירת התמונה (docs/spec-gps-map-share.md)
export const alt = "אימון ב-Wellbeing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/@fontsource/rubik/files");

/**
 * satori (המנוע של ImageResponse) לא תומך בכיווניות מימין לשמאל: הוא מצייר תווים משמאל לימין.
 * לכן הופכים ידנית: מילים עבריות — בסדר תווים הפוך, וסדר המילים הפוך. מספרים נשארים כמו שהם.
 * מתאים לביטויים קצרים בלבד
 */
function visual(text: string) {
  return text
    .split(" ")
    .reverse()
    .map(word => (/[֐-׿]/.test(word) ? [...word].reverse().join("") : word))
    .join(" ");
}

export default async function Image(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const [hebrew, latin] = await Promise.all([
    readFile(join(fontDir, "rubik-hebrew-600-normal.woff")),
    readFile(join(fontDir, "rubik-latin-600-normal.woff")),
  ]);
  const activity = await getSharedActivity(token);

  // המסלול, מוקרן לריבוע של 470×470 פיקסלים
  const points = activity?.route.flat() ?? [];
  let path = "";
  if (points.length > 1) {
    const lats = points.map(p => p[0]);
    const lngs = points.map(p => p[1]);
    const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const cos = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180); // קו אורך מתכווץ ככל שמתרחקים מקו המשווה
    const spanX = (maxLng - minLng) * cos || 1e-9;
    const spanY = maxLat - minLat || 1e-9;
    const scale = 430 / Math.max(spanX, spanY);
    const offsetX = (470 - spanX * scale) / 2;
    const offsetY = (470 - spanY * scale) / 2;
    path = activity!.route
      .map(segment =>
        segment
          .map(([lat, lng], i) => `${i ? "L" : "M"}${(offsetX + (lng - minLng) * cos * scale).toFixed(1)} ${(offsetY + (maxLat - lat) * scale).toFixed(1)}`)
          .join(" "),
      )
      .join(" ");
  }

  const type = activity ? ACTIVITY_TYPES[activity.type] : null;
  const km = activity?.distance_km;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f4ef", fontFamily: "Rubik", padding: 60 }}>
        <div style={{ display: "flex", width: 470, height: 470, background: "#efe9f7", borderRadius: 36 }}>
          {path ? (
            <svg width="470" height="470" viewBox="0 0 470 470">
              <path d={path} stroke="#8f6fc6" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", flex: 1, paddingLeft: 40 }}>
          <div style={{ fontSize: 34, color: "#8f6fc6" }}>Wellbeing</div>
          <div style={{ fontSize: 64, color: "#1c1b19", marginTop: 12 }}>
            {activity && type ? visual(`${type.name} של ${activity.first_name}`) : visual("אימון")}
          </div>
          {activity && (
            <div style={{ display: "flex", fontSize: 48, color: "#1c1b19", marginTop: 28, gap: 40 }}>
              <span>{`${activity.duration_minutes} ${visual("דק׳")}`}</span>
              {km ? <span>{`${km} ${visual("ק״מ")}`}</span> : null}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Rubik", data: latin, weight: 600, style: "normal" },
        { name: "Rubik", data: hebrew, weight: 600, style: "normal" },
      ],
    },
  );
}
