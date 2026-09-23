import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile, safeNext } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "כניסה · Wellbeing" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  const target = safeNext(next);

  // כבר מחובר — אין סיבה לראות את הטופס
  if (await getProfile()) redirect(target);

  return (
    <div className="rounded-[26px] border border-card-border bg-card p-6 shadow-[0_18px_40px_-28px_rgba(28,27,25,0.35)]">
      <h1 className="text-[23px] font-semibold tracking-tight">שמחים לראות אותך</h1>
      <p className="mt-1 mb-6 text-[14px] text-ink-2">נכנסים כדי להמשיך מאיפה שעצרת.</p>
      <LoginForm next={target} />
    </div>
  );
}
