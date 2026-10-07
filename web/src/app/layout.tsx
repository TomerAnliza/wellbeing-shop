import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { Clarity } from "@/components/clarity";
import "./globals.css";

// Rubik — הגופן שבעיצוב (docs/design-system.md), בתת-קבוצה עברית
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Wellbeing",
  description: "מעקב אחרי פעילות ספורטיבית, וחנות ציוד עם עוזר בוואטסאפ.",
};

export const viewport: Viewport = { themeColor: "#f7f4ef" };

// Microsoft Clarity — רק בפרודקשן של Vercel, לא בפיתוח מקומי ולא ב-Preview.
// VERCEL_ENV זמין בשרת בזמן build ובזמן ריצה. המזהה ציבורי (docs/web-analytics-clarity.md)
const CLARITY_PROJECT_ID = process.env.VERCEL_ENV === "production" ? "ytw3b7uf8r" : undefined;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // האפליקציה כולה בעברית ו-RTL. כיווניות נקבעת כאן, פעם אחת, לכל הדפים
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`}>
      <head>
        {/* אייקוני Material Symbols Rounded, כמו בעיצוב */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
      </head>
      <body className="min-h-full">
        {children}
        <Clarity projectId={CLARITY_PROJECT_ID} />
      </body>
    </html>
  );
}
