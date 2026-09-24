import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מדיניות פרטיות · Wellbeing",
  description: "מה Wellbeing אוסף, למה, איפה זה נשמר, ומי עוד רואה את זה.",
};

// מדיניות הפרטיות — נכתבה לפי מה שהמערכת עושה בפועל (docs/spec-gps-map-share.md, "מדיניות פרטיות").
// כל שינוי במה שנאסף או במי שמעבד — מעדכנים גם כאן, ואת התאריך
const UPDATED = "24 בספטמבר 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-screen px-5 py-10">
      <main className="mx-auto max-w-2xl">
        <Link href="/" className="mb-8 flex items-center gap-2 text-[17px] font-semibold tracking-tight">
          <span className="ms text-[24px] text-brand" aria-hidden>favorite</span>
          Wellbeing
        </Link>

        <article className="flex flex-col gap-7 rounded-[26px] border border-card-border bg-card p-6 text-[15px] leading-relaxed lg:p-10">
          <header>
            <h1 className="text-[26px] font-semibold tracking-tight">מדיניות פרטיות</h1>
            <p className="mt-1 text-[13px] text-ink-2">עודכן לאחרונה: {UPDATED}</p>
          </header>

          <p>
            Wellbeing הוא אתר למעקב אחרי אימונים, עם חנות ציוד ועוזר בוואטסאפ. הוא נבנה ומופעל כפרויקט הדגמה
            בקורס &quot;מטמיע AI&quot; במכללת אנליזה. כאן מפורט מה אנחנו אוספים, למה, איפה זה נשמר ומי עוד רואה את זה.
          </p>

          <Section title="מה אנחנו אוספים, ולמה">
            <Item title="חשבון">שם, אימייל, סיסמה ומספר טלפון — כדי שתוכלו להיכנס, ולזהות אתכם גם בוואטסאפ. הסיסמה לא נשמרת כמו שהיא, אלא מוצפנת בצורה שאי אפשר לשחזר.</Item>
            <Item title="אימות טלפון">הודעת וואטסאפ אחת עם קוד, שאתם שולחים מהטלפון שלכם — כדי לוודא שהמספר באמת שלכם.</Item>
            <Item title="אימונים">סוג, זמן התחלה וסיום, משך, מרחק וקלוריות. הקלוריות תמיד הערכה, בלי משקל ודופק.</Item>
            <Item title="מיקום">
              רק בזמן אימון חי של ריצה, הליכה או אופניים, רק אם אישרתם בדפדפן, ורק כשהעמוד פתוח. המסלול נשמר בחשבון שלכם,
              ורק אתם רואים אותו — עד שבוחרים לשתף. כשהמדידה לא אמינה (למשל בתוך בניין), המסלול לא נשמר בכלל.
            </Item>
            <Item title="שיחות עם העוזר בוואטסאפ">ההודעות, שם הפרופיל שלכם בוואטסאפ, הזמנות, פניות לשירות, ותמונות שאתם שולחים — כדי לענות, לטפל בהזמנה ולחזור אליכם.</Item>
            <Item title="מידע טכני">
              עוגייה של התחברות בלבד — כדי שתישארו מחוברים. אימון שעוד לא הסתיים נשמר בדפדפן שלכם, כדי שרענון לא יאבד אותו.
              אין פרסומות, אין מעקב שיווקי ואין כלי סטטיסטיקה חיצוניים.
            </Item>
          </Section>

          <Section title="מי עוד מעבד את המידע">
            <p>כדי שהשירות יעבוד, המידע עובר דרך ספקים חיצוניים. חלקם שומרים אותו מחוץ לישראל:</p>
            <ul className="flex list-disc flex-col gap-1.5 ps-5">
              <li><b>Supabase</b> — חשבונות, אימונים, מסלולים ותמונות שנשלחו לשירות. השרתים באוסטרליה.</li>
              <li><b>Vercel</b> — אחסון האתר.</li>
              <li><b>Meta (וואטסאפ)</b> — ההודעות עם העוזר.</li>
              <li><b>OpenAI</b> — תוכן ההודעות שלכם לעוזר נשלח למודל שפה, כדי להבין מה ביקשתם ולנסח תשובה.</li>
              <li><b>Google</b> — גיליונות של לקוחות, הזמנות, פניות ויומן שיחות, ומיילים (למשל איפוס סיסמה).</li>
              <li><b>OpenStreetMap</b> — אריחי המפה. כשאתם מסתכלים על מפת מסלול, הדפדפן מוריד מהם את אזור המפה.</li>
              <li><b>שרת האוטומציה שלנו (n8n)</b> — מעביר את ההודעות בין הספקים האלה.</li>
            </ul>
            <p>אנחנו לא מוכרים מידע, ולא מעבירים אותו לאף אחד לשיווק.</p>
          </Section>

          <Section title="שיתוף אימון">
            <p>
              אימון נהיה ציבורי רק כשאתם לוחצים &quot;שיתוף&quot;. מי שיש לו את הקישור רואה את השם הפרטי שלכם, סוג האימון,
              התאריך (בלי שעה), המשך, המרחק והמסלול — <b>בלי 200 המטרים הראשונים והאחרונים</b>, כי מסלול מתחיל ונגמר בדרך כלל
              ליד הבית. אפשר להפסיק שיתוף בכל רגע, והקישור מפסיק לעבוד מיד.
            </p>
          </Section>

          <Section title="כמה זמן שומרים">
            <ul className="flex list-disc flex-col gap-1.5 ps-5">
              <li>חשבון, אימונים ומסלולים — עד שמוחקים את החשבון.</li>
              <li>קוד אימות טלפון — תקף 15 דקות.</li>
              <li>קישור לתמונה ששלחתם לשירות — תקף 30 יום. התמונה עצמה נשמרת עד שתבקשו למחוק.</li>
              <li>שיחות, הזמנות ופניות בגיליונות Google — נשמרים לצורך טיפול, ולא נמחקים אוטומטית.</li>
            </ul>
          </Section>

          <Section title="מחיקה, עיון ותיקון">
            <p>
              <b>מחיקת חשבון</b> — בעמוד הפרופיל. היא מוחקת מיד את החשבון, הפרופיל, כל האימונים, המסלולים והשיתופים.
            </p>
            <p>
              שיחות, הזמנות, פניות ותמונות מהעוזר בוואטסאפ לא נמחקות מהכפתור הזה. כדי למחוק גם אותן, או לעיין במידע שלכם
              ולתקן אותו — כתבו לעוזר בוואטסאפ &quot;נציג&quot;, או למייל{" "}
              <a href="mailto:tomer@analiza-college.co.il" dir="ltr" className="text-brand-hover underline underline-offset-2">tomer@analiza-college.co.il</a>.
            </p>
          </Section>

          <Section title="אבטחה">
            <p>
              כל משתמש רואה רק את המידע שלו — זה נאכף במסד הנתונים עצמו, לא רק באתר. הודעות לעוזר ובקשות למשלוח מיילים
              נבדקות בחתימה דיגיטלית, כדי שאף אחד לא יוכל להתחזות. ובכל זאת, אין מערכת מוגנת לגמרי — אם אתם חושבים שמשהו
              דלף, כתבו לנו.
            </p>
          </Section>

          <Section title="שינויים">
            <p>כשנשנה את מה שנאסף או את הספקים, נעדכן את העמוד הזה ואת התאריך בראשו.</p>
          </Section>
        </article>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[18px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <p>
      <b>{title}.</b> {children}
    </p>
  );
}
