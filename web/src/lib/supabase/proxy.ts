import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// מרענן את ה-session של Supabase בכל בקשה, וכותב את העוגיות המעודכנות לתשובה.
// מבוסס על הדוגמה הרשמית של Supabase, עם שינוי אחד: אין כאן הפניה ל-/login.
// ההחלטה אם להכניס נעשית בכל עמוד, בשרת (lib/auth.ts) — ה-proxy אינו מנגנון הרשאה.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // אסור להריץ קוד בין יצירת הלקוח לבין getClaims() — לפי Supabase, זה גורם לניתוקים אקראיים
  await supabase.auth.getClaims();

  return response;
}
