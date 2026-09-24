import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// הקישור מהמייל: /auth/confirm?token_hash=…&type=recovery&next=/reset-password
// האימות נעשה כאן, בשרת (verifyOtp), ויוצר session בעוגיות. כך הקישור עובד
// גם כשפותחים את המייל במכשיר אחר מזה שביקש את השחזור
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(safeNext(params.get("next")));
  }

  redirect("/forgot-password?error=link");
}
