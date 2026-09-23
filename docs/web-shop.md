# מסך החנות באתר — Next.js

- **תאריך:** 23 בספטמבר 2026
- **מממש את:** [spec-shop-and-agent.md](spec-shop-and-agent.md) — טאב "חנות", שני הטאבים
  הפנימיים, באנר הנחת הכושר ו-FAB לוואטסאפ
- **קוד:** `web/src/app/app/shop/`, `web/src/components/`, `web/src/lib/shop.ts`

## מה במסך

| כתובת | מה |
|---|---|
| `/app/shop` | באנר הנחת כושר, גלולות קטגוריה, רשת מוצרים (תמונה, שם, מחיר, סטטוס מלאי, "שאל בוואטסאפ") |
| `/app/shop/orders` | הסבר שההזמנות מנוהלות בוואטסאפ + כפתור "לבדוק את ההזמנה שלי" |
| `/` | מפנה ל-`/app/shop` עד שייבנה דף התדמית |

שורת הטאבים התחתונה מוצגת כמו בעיצוב. רק "חנות" פעיל; השאר מסומנים "בקרוב".

## מאיפה המוצרים

```text
גיליון החנות (products) ──► n8n: GET /webhook/wellbeing-products ──► Next.js (שרת, revalidate 60s)
```

- **למה דרך n8n:** זו אותה טבלה שהבוט קורא, עם אותו credential של Google שכבר
  קיים ב-n8n. אין צורך ב-Service Account נפרד לאתר. תרחיש: `wellbeing — קטלוג לאתר`,
  קוד המקור ב-[`n8n/build_products_api_workflow.py`](../n8n/build_products_api_workflow.py)
- **מה נחשף:** רק מוצרים פעילים, ורק סטטוס מלאי (`in` / `low` / `out`) — לא כמויות
- **משתנה סביבה:** `PRODUCTS_URL` — הכתובת המלאה של ה-webhook. מקומית ב-`web/.env.local`
  (מחוץ ל-Git), ובפרודקשן במשתני הסביבה של Vercel
- **כשהשירות לא זמין:** המסך מציג הודעה ולא קורס

## הקשר לבוט

"שאל בוואטסאפ" פותח `wa.me/972554680476` עם "שאלה על <מוצר> (P-004)". הבוט מזהה
את קוד המוצר בסוגריים ופותח ישר את כרטיס המוצר עם כפתור "להזמין".

## עיצוב

טוקנים מ-[design-system.md](design-system.md) ב-`web/src/app/globals.css`: פלטת oklch
סביב גוון 300, גופן Rubik (הוחלף מ-Assistant כדי להתאים לעיצוב), אייקוני Material
Symbols Rounded, רדיוסים 26/20/18. רוחב מובייל 430px גם בדסקטופ.
`prefers-reduced-motion` מכובד.

## איך מריצים

```bash
cd web
npm install
npm run dev
```

ב-`http://localhost:3000/app/shop` מופיעים 10 מוצרים עם תמונות. בלי `PRODUCTS_URL`
ב-`.env.local` מופיעה הודעת "לא הצלחנו לטעון את המוצרים".

`node_modules` ו-`.next` מסומנים ב-Dropbox כ-ignored (`xattr com.dropbox.ignored`),
כדי שלא יסונכרנו מאות מגה.

## נבדק — 23 בספטמבר 2026

- `npm run build` עובר; `/app/shop` נבנה סטטי עם revalidate של דקה
- בדפדפן, ברוחב מובייל: 10 מוצרים עם תמונות, סינון "כוח" מחזיר 3 מוצרים,
  קישורי "שאל" וה-FAB נכונים, טאב "ההזמנות שלי" מוצג
- הודעה עם `(P-004)` לבוט מחזירה את כרטיס המוצר

## פריסה — Vercel

- **כתובת:** https://wellbeing-shop.vercel.app (מפנה ל-`/app/shop`)
- **פרויקט:** `wellbeing-shop` בחשבון `tmx-aa90`, תוכנית חינמית. זה פרויקט חדש;
  הפרויקט הישן `wellbeing-app` לא נגעו בו
- **משתנה סביבה:** `PRODUCTS_URL` מוגדר ל-Production
- **`web/vercel.json`** קובע `framework: nextjs`. בלעדיו פרויקט שנוצר מה-CLI נבנה
  כאתר סטטי ונכשל ב-"Output Directory public is empty"
- **פריסה ידנית**, מתוך `web/`:

  ```bash
  vercel deploy --prod --scope tmx-aa90
  ```

- **פריסה אוטומטית בכל push — עוד לא מחוברת.** החיבור ל-GitHub מה-CLI נכשל, כי
  אפליקציית Vercel ב-GitHub עוד לא קיבלה גישה לריפו החדש. לחיבור:
  Vercel → wellbeing-shop → Settings → Git → Connect → `TomerAnliza/wellbeing-shop`,
  ובהגדרות Build: **Root Directory = `web`**

נבדק ב-23 בספטמבר 2026: 10 מוצרים עם תמונות מ-Supabase, דרך `next/image` של Vercel.
