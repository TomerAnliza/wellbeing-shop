import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
