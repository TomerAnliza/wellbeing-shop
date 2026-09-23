import { createBrowserClient } from "@supabase/ssr";

// לקוח Supabase לדפדפן (Client Components). משתמש רק במפתח הציבורי — ההגנה על הנתונים היא RLS
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
