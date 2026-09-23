import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: "Proxy" (לשעבר Middleware). רץ לפני כל בקשה ומרענן את ה-session
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // כל הבקשות, חוץ מקבצים סטטיים ותמונות
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
