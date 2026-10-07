# Microsoft Clarity — הקלטות ומפות חום

- **תאריך:** 7 באוקטובר 2026
- **מי:** הסוכן הראשי (Claude), לפי בקשת תומר
- **פרויקט Clarity:** `ytw3b7uf8r` (המזהה ציבורי — הוא מופיע בכל דף שנטען)

## למה

עד היום ראינו מה משתמשים **שמרו** (אימונים במסד), אבל לא איך הם **הגיעו** לשם: איפה
נתקעו בהרשמה, אם מוצאים את "התחל אימון", אם לוחצים על דברים שאינם כפתורים. Clarity מקליט
את התנועה בדף — לחיצות, גלילה, מעברים — ומציג הקלטות ומפות חום. הוא חינמי ואין בו פרסום.

המחיר: **ספק חיצוני נוסף שרואה את מה שקורה במסך.** לכן רוב המסמך הזה עוסק במה ש-Clarity
**לא** יראה.

## מה נטען, ואיפה

| מה | איפה |
|---|---|
| הרכיב `Clarity` | `web/src/components/clarity.tsx`, נטען פעם אחת ב-`web/src/app/layout.tsx` |
| קוד ההטמעה | הקוד הרשמי מלוח הבקרה של Clarity, בתוך `next/script` עם `strategy="afterInteractive"` |
| מזהה הפרויקט | קבוע ב-`layout.tsx`. הוא ציבורי, ואין טעם להסתיר אותו במשתנה סביבה |
| מתי נטען | רק כש-`VERCEL_ENV` הוא `production` |

**רק בפרודקשן.** ה-layout רץ בשרת וקורא את `VERCEL_ENV`, משתנה ש-Vercel ממלא בעצמו, זמין
בזמן build ובזמן ריצה. בפרודקשן הוא מעביר לרכיב את המזהה, ובכל מקום אחר — כלום. כך `npm run dev`
מקומי ו-Preview של ענפים לא שולחים הקלטות, ולא מלכלכים את הנתונים בבדיקות שלנו.

למה לא משתנה סביבה משלנו: הגדרה ב-Vercel דורשת גישה ללוח הבקרה של הפרויקט, והיא לא נראית
בקוד. `VERCEL_ENV` כבר קיים. **תנאי אחד:** בהגדרות הפרויקט ב-Vercel, Environment Variables,
צריך להיות מסומן "Enable access to System Environment Variables". בלעדיו `VERCEL_ENV` ריק,
ו-Clarity פשוט לא נטען. הבדיקה בפרודקשן (למטה) תופסת את זה.

`next/script` ולא `<script>` רגיל: Next מבטיח שהסקריפט רץ פעם אחת גם כשעוברים בין דפים,
וסקריפט inline חייב `id` כדי ש-Next יעקוב אחריו (תיעוד Next המקומי:
`node_modules/next/dist/docs/01-app/02-guides/scripts.md`, "Inline Scripts").

## מה Clarity לא רואה

### שלוש שכבות

1. **שדות קלט ותפריטים נפתחים — מוסתרים תמיד**, בכל מצב, ואי אפשר לשנות את זה. סיסמה,
   מייל וטלפון שמקלידים בטפסים לא יוצאים מהדפדפן.
2. **מצב ההסתרה של הפרויקט — Balanced** (ברירת המחדל). מסתיר מספרים וכתובות מייל בכל הדף.
   המשמעות אצלנו: גם המרחק, הקצב והקלוריות יופיעו בהקלטה כ-`▫▫▫`. זה מכוון.
3. **`data-clarity-mask="true"` בקוד** — על כל מה שמזהה אדם או מקום. התכונה גוברת על הגדרות
   לוח הבקרה, ולכן ההגנה נשארת גם אם מישהו יחליף שם את מצב ההסתרה ל-Relaxed.

### מה מסומן בקוד

| מה | קובץ | למה |
|---|---|---|
| מפת המסלול | `components/route-map.tsx` | מסלול מתחיל ונגמר ליד הבית. אריחי המפה הם תמונות, והתיעוד של Balanced מזכיר רק מספרים ומיילים |
| השם בברכה | `app/app/page.tsx` | שם הוא טקסט, ו-Balanced לא מסתיר טקסט |
| השם, האות הראשונה והטלפון | `app/app/profile/page.tsx` | כנ"ל |
| השם בהגדרות | `app/app/profile/profile-settings.tsx` | כנ"ל |
| האות הראשונה בכפתור הפרופיל | `components/tab-bar.tsx` | כנ"ל |
| הטלפון | `app/(auth)/verify-phone/page.tsx`, `change-phone.tsx` | Balanced כבר מסתיר מספרים — כאן ליתר ביטחון |
| המייל | `app/(auth)/forgot-password/forgot-form.tsx` | Balanced כבר מסתיר מיילים — כאן ליתר ביטחון |

**כלל לקוד חדש:** כל אלמנט שמציג שם, טלפון, מייל, מיקום או תמונה של משתמש — מקבל
`data-clarity-mask="true"`. שימו לב: `data-clarity-mask="false"` **לא** חושף. לחשיפה יש
תכונה נפרדת, `data-clarity-unmask="true"`, ואנחנו לא משתמשים בה.

### דפי שיתוף — בלי Clarity בכלל

ב-`/share/<token>` ה-token הוא המפתח לאימון, והוא נמצא בכתובת. Clarity מציג הקלטות ומפות חום
לפי כתובת הדף, ולכן מי שנכנס ללוח הבקרה היה יכול לפתוח אימונים משותפים. הרכיב בודק את הנתיב ולא נטען שם.

**מקרה קצה ידוע:** אם Clarity כבר נטען, ומשתמש עובר ל-`/share/...` **בלי טעינה מלאה של הדף**
(ניווט פנימי של Next), הסקריפט שכבר רץ ממשיך לרוץ. היום אין באתר קישור פנימי לדף שיתוף —
הקישור נשלח דרך תפריט השיתוף של הטלפון או מועתק — ולכן זה לא קורה בפועל.

## עוגיות והסכמה

- **עוגיות צד ראשון:** `_clck` (משתמש) ו-`_clsk` (ביקור), כדי לחבר כמה דפים להקלטה אחת.
- **עוגיות צד שלישי של Microsoft:** `CLID`, `MUID`, `MR`, `SM`, `ANONCHK`. לפי התיעוד, `MUID` מזהה
  דפדפנים באתרי Microsoft ומשמש אותה "לפרסום, אנליטיקה ומטרות תפעוליות". בבדיקה ראינו את הבקשה
  `GET https://c.bing.com/c.gif` — זו הדרך שבה העוגייה נקבעת. לכן מדיניות הפרטיות כבר לא אומרת
  "אין מעקב שיווקי", אלא "אנחנו לא משתמשים במידע לשיווק", ומפרטת את `MUID`.
- **לכבות את כל העוגיות:** בלוח הבקרה, Settings → Setup → Cookies. אז Clarity לא שומר עוגיות
  עד שמקבל אות הסכמה, וכל דף הופך להקלטה נפרדת. היום העוגיות פועלות (ברירת המחדל).
- **מבקרים מהאיחוד האירופי, מבריטניה ומשווייץ:** מ-31 באוקטובר 2025 Clarity דורש מהם אות
  הסכמה, ובלעדיו לא שומר עוגיות. זה פועל אצל Clarity, בלי קוד מצדנו.
- **מבקרים מישראל ומשאר העולם:** אין באנר הסכמה. המידע מפורט במדיניות הפרטיות (`/privacy`).
  באנר הסכמה הוא החלטה פתוחה — ראו "מה הלאה".

## Clarity ומשתמשים מתחת לגיל 18

התיעוד של Clarity קובע שאין להשתמש בו באתרים שמיועדים לקטינים. Wellbeing מיועד למבוגרים.
אם זה ישתנה, Clarity יוצא.

## איך בודקים שזה עובד

מקומית, מדמים פרודקשן. `VERCEL_ENV` צריך להיות גם ב-build (דפים סטטיים נבנים מראש) וגם
בהרצה (דפים דינמיים):

```bash
cd web
VERCEL_ENV=production npm run build
VERCEL_ENV=production npm run start
```

פותחים את `http://localhost:3000`, ובכלי המפתחים, בלשונית Network, מסננים לפי `clarity`. כשזה
עובד רואים, בסדר הזה:

```text
GET  https://www.clarity.ms/tag/ytw3b7uf8r          ← קוד ההטמעה
GET  https://scripts.clarity.ms/0.8.70/clarity.js   ← Clarity עצמו (הגרסה משתנה)
GET  https://c.clarity.ms/c.gif                     ← עוגיות
GET  https://c.bing.com/c.gif                       ← עוגיות Microsoft
POST https://l.clarity.ms/collect                   ← ההקלטה. האות הראשונה משתנה (a., j., l. …)
```

התיעוד של Clarity מזכיר `www.clarity.ms/collect`. בפועל, ב-7 באוקטובר 2026, הבקשות הלכו לתת-דומיין
באות אחת. בדף `/share/...` לא אמורה להופיע אף בקשה ל-`clarity.ms`. בלי `VERCEL_ENV=production` —
אף בקשה, בשום דף. אחרי כמה שניות הביקור מופיע בלוח הבקרה של Clarity.

בפרודקשן: אותה בדיקה על https://wellbeing-shop.vercel.app, ובלוח הבקרה — Recordings.

### תוצאות — 7 באוקטובר 2026

`npm run lint` על הקבצים ששונו: אפס שגיאות. `VERCEL_ENV=production npm run build`: עובר.
בדיקה בדפדפן (Playwright + Chrome, סקריפט מחוץ לריפו) מול `next start` מקומי:

```text
/                        tag=True   window.clarity=function   collect=2
/login                   tag=True   window.clarity=function   collect=2
/privacy                 tag=True   window.clarity=function   collect=2
/share/not-a-real-token  tag=False  window.clarity=undefined  requests=0
```

ואותה בדיקה אחרי build **בלי** `VERCEL_ENV`: בארבעת הדפים `tag=False` ו-`requests=0`.

**בפרודקשן**, אחרי הדיפלוי של `df132d0`, אותה בדיקה מול https://wellbeing-shop.vercel.app: אותן
תוצאות בדיוק — `POST /collect` ב-`/`, `/login` ו-`/privacy`, ואפס בקשות ב-`/share/...`. דף
הפרטיות החי מציג את התאריך 7 באוקטובר 2026 ואת הסעיף על Clarity ו-`MUID`.

## הגדרות בלוח הבקרה של Clarity

| הגדרה | ערך | איפה |
|---|---|---|
| Masking mode | **Balanced** (ברירת המחדל — לא לשנות ל-Relaxed) | Settings → Masking |
| Cookies | פועל (ברירת המחדל) | Settings → Setup |
| Bot detection | פועל (ברירת המחדל) | Settings → Setup |

## לא אומת

- **האם Clarity מסתיר גם תכונות כמו `aria-label`** בתוך אלמנט מוסתר. בכפתור הפרופיל ה-`aria-label`
  מכיל את השם המלא. התיעוד מדבר על "התוכן" של האלמנט ושל ילדיו, ולא מזכיר תכונות.

## מה הלאה

1. **באנר הסכמה** — אם רוצים לתת לכל מבקר לסרב, ולא רק למבקרים מאירופה. Clarity מקבל את
   ההחלטה דרך Consent API (`clarity-consent-api-v2` בתיעוד).
2. **אירועים מותאמים** (`window.clarity("event", "...")`) — למשל "אימון נשמר", כדי לסנן
   הקלטות של מי שהשלים אימון מול מי שנטש. לא נכלל עכשיו: קודם רוצים לראות מה ההקלטות מראות.

## מקורות — נבדקו ב-7 באוקטובר 2026

| מקור | מה נלקח ממנו |
|---|---|
| [Clarity — How to setup manually](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup) | מיקום הקוד ב-`<head>`, בדיקה דרך `POST` ל-`clarity.ms/collect`, הגבלת גיל 18 |
| [Clarity — Client API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api) | `data-clarity-mask` ו-`data-clarity-unmask`, ש-`false` לא משפיע, API של אירועים ותגיות |
| [Clarity — Masking content](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking) | שלושת מצבי ההסתרה, Balanced כברירת מחדל, שדות קלט מוסתרים תמיד, תכונה בקוד גוברת על לוח הבקרה |
| [Clarity — Consent Mode](https://learn.microsoft.com/en-us/clarity/setup-and-installation/cookie-consent) | אכיפת הסכמה ל-EEA, בריטניה ושווייץ מ-31 באוקטובר 2025, העוגיות `_clck` ו-`_clsk` |
| [Clarity — Cookies](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-cookies) | רשימת העוגיות, צד ראשון ושלישי, ומטרת `MUID`. ש-Clarity לא שומר עוגיות כשהדפדפן חוסם אותן |
| [Vercel — System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables) | `VERCEL_ENV` וערכיו, זמינות בזמן build ובזמן ריצה, ההגדרה שמפעילה אותם |
| תיעוד Next.js 16.3.4 המקומי, `scripts.md` | `next/script`, אסטרטגיית `afterInteractive`, `id` חובה לסקריפט inline |
| קוד ההטמעה מלוח הבקרה של הפרויקט `ytw3b7uf8r` | הסקריפט עצמו, כפי שתומר העתיק אותו |
