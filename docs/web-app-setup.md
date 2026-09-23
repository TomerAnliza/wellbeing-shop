# אפליקציית ה-Web — שלד, הרצה ודיפלוי

- **תאריך:** 7 בספטמבר 2026
- **סטטוס:** שלד נקי, בלי פיצ'רים. מממש את [tech-stack.md](tech-stack.md)
  בשכבת ה-Framework בלבד. Supabase עדיין לא מחובר.
- **מיקום בריפו:** `web/`

## מה הוקם

| פרט | ערך |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, `src/`) |
| עיצוב | Tailwind CSS 4 |
| גופן | Assistant מ-Google Fonts דרך `next/font`, עם תת-קבוצת עברית |
| כיווניות | `<html lang="he" dir="rtl">` ב-`src/app/layout.tsx`, פעם אחת לכל הדפים |
| דף בית | placeholder בעברית ב-`src/app/page.tsx`. יוחלף בדף התדמית מהאפיון |

הקבצים `web/AGENTS.md` ו-`web/CLAUDE.md` נוצרים ומתעדכנים על ידי Next
עצמו (`next dev`). הם מזהירים שגרסה זו של Next שונה ממה שסוכנים מכירים,
ומפנים לתיעוד המקומי ב-`web/node_modules/next/dist/docs/`. **קרא שם לפני
שכותבים קוד Next**, ואל תמחק את הקבצים.

## איך מריצים

```bash
cd web
npm install
npm run dev
```

בדפדפן, ב-`http://localhost:3000`, מופיע דף placeholder עם משפט ההבטחה
של המוצר, מיושר לימין.

בדיקת build כמו בפרודקשן:

```bash
npm run build
```

הפלט מסתיים בטבלת נתיבים עם `/` ו-`/_not-found` מסומנים כסטטיים.

## דיפלוי ל-Vercel

| פרט | ערך |
|---|---|
| חשבון | `tomeranliza`, החשבון של tomer@analiza-college.co.il |
| Team | `TMX` (מזהה `tmx-aa90`). Vercel אינו מאפשר פרויקטים תחת חשבון אישי, ולכן זה ה-scope |
| פרויקט | `wellbeing-app` |
| כתובת פרודקשן | https://wellbeing-app-tmx-aa90.vercel.app (וגם https://wellbeing-app-jade.vercel.app) |
| הרצה | מתוך `web/`: `vercel deploy --prod --scope tmx-aa90` |
| חיבור מקומי | `web/.vercel/project.json`, מחוץ ל-Git |

**הגנת דיפלוי.** ברירת המחדל של ה-Team היא Vercel Authentication, שמפנה כל
מבקר למסך התחברות של Vercel. היא כובתה לפרויקט הזה ב-7 בספטמבר 2026 כדי
שהאתר יהיה פתוח. Preview deployments של ענפים יירשו את אותה הגדרה.

**חיבור Git אוטומטי עדיין לא פעיל.** `vercel git connect` נכשל, כנראה כי
אפליקציית GitHub של Vercel לא מותקנת על ה-Team. עד שזה יוסדר, דיפלוי הוא
ידני בפקודה שלמעלה. כשמחברים, יש להגדיר Root Directory = `web`.

התחברות ממחשב אחר: `vercel login` פעם אחת בחשבון הזה. הטוקן נשמר אצל
ה-CLI, לא בריפו.

## משתני סביבה

עדיין אין. כשייכנס Supabase, הוא יוגדר ב-Vercel דרך `vercel env`
וב-`web/.env.local` מקומית. `.env*` חסום ב-`.gitignore`.

## מה הלאה

1. עיצוב המסכים החסרים — ראו "מה חסר בעיצוב" ב-[spec-mvp-screens.md](spec-mvp-screens.md).
2. תוכנית מימוש למסכים, עם חוות דעת של צחי.
3. חיבור Supabase: פרויקט, סכמה, RLS, Auth.
