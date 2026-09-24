"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type FormState } from "@/app/actions/auth";
import { Field, FormError, SubmitButton } from "@/components/form";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field label="אימייל" name="email" type="email" autoComplete="email" dir="ltr" inputMode="email"
             defaultValue={state.values?.email} />
      <Field label="סיסמה" name="password" type="password" autoComplete="current-password" dir="ltr" />
      <Link href="/forgot-password" className="-mt-2 self-start text-[12.5px] text-ink-2 hover:text-ink">שכחתי סיסמה</Link>
      <FormError message={state.error} />
      <SubmitButton pending={pending}>כניסה</SubmitButton>
      <p className="text-center text-[13px] text-ink-2">
        עוד אין חשבון?{" "}
        <Link href={`/signup${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-brand-hover">להרשמה</Link>
      </p>
    </form>
  );
}
