import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// לקוח Supabase לצד השרת (Server Components, Server Actions, Route Handlers).
// ה-session נשמר בעוגיות. מקור: הדוגמה הרשמית של Supabase ל-Next.js (docs/spec-auth-and-app.md)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // נקרא מתוך Server Component, שאינו יכול לכתוב עוגיות.
            // תקין: ה-proxy מרענן את ה-session בכל בקשה
          }
        },
      },
    },
  );
}
