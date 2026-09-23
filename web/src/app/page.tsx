import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Wellbeing — מתחילים אימון בלחיצה",
  description: "מעקב פשוט אחרי אימונים, יעד שבועי, וחנות ציוד עם עוזר בוואטסאפ.",
};

const FEATURES = [
  { icon: "play_circle", title: "אימון בשתי לחיצות", text: "בוחרים סוג פעילות, והטיימר כבר רץ." },
  { icon: "flag", title: "יעד שבועי אמיתי", text: "רואים מה באמת עשית השבוע — בלי אשמה, בלי אדום." },
  { icon: "storefront", title: "10% הנחת כושר", text: "משלימים את היעד — ומקבלים הנחה בחנות הציוד." },
];

// דף תדמית למי שלא מחובר. מחובר עובר ישר ל"היום" (docs/spec-auth-and-app.md)
export default async function LandingPage() {
  if (await getProfile()) redirect("/app");

  return (
    <div className="min-h-screen bg-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 lg:px-8">
        <span className="flex items-center gap-2 text-[18px] font-semibold tracking-tight">
          <span className="ms text-[26px] text-brand" aria-hidden>favorite</span>
          Wellbeing
        </span>
        <Link href="/login" className="text-[14px] font-semibold text-brand-hover">כניסה</Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 pt-10 pb-20 lg:px-8 lg:pt-20">
        <section className="max-w-2xl">
          <h1 className="text-[34px] leading-tight font-semibold tracking-tight lg:text-[52px]">
            להתחיל אימון בלחיצה.
            <br />
            <span className="text-brand">לדעת מה באמת עשית.</span>
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-2 lg:text-[18px]">
            טיימר, יעד שבועי והתקדמות — בעברית, בלי הגדרות מסובכות. ועוזר בוואטסאפ לשאלות על ציוד.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-[18px] bg-brand px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-brand-hover">
              להרשמה
            </Link>
            <Link href="/app/shop" className="rounded-[18px] border border-ink/10 bg-card px-6 py-3.5 text-[15px] font-semibold hover:bg-ink/5">
              לחנות
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(feature => (
            <div key={feature.title} className="rounded-[22px] border border-card-border bg-card p-5">
              <span className="ms text-[28px] text-brand-icon" aria-hidden>{feature.icon}</span>
              <h2 className="mt-3 text-[16px] font-semibold">{feature.title}</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{feature.text}</p>
            </div>
          ))}
        </section>

        <p className="mt-10 text-[12px] text-ink-3">
          מרחק, קצב וקלוריות מחושבים מזמן האימון, ומסומנים כהערכה. אין כאן GPS ואין ייעוץ רפואי.
        </p>
      </main>
    </div>
  );
}
