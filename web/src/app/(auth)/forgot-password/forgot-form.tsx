"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "@/app/actions/auth";
import { Field, FormError, SubmitButton } from "@/components/form";

export function ForgotForm() {
  const [state, action, pending] = useActionState<FormState & { sent?: boolean }, FormData>(requestPasswordReset, {});

  if (state.sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center" role="status">
        <span className="ms text-[40px] text-brand-icon" aria-hidden>mark_email_read</span>
        <p className="text-[14px] leading-relaxed">
          אם יש חשבון עם <b dir="ltr" className="break-all">{state.values?.email}</b>, שלחנו אליו קישור. הוא תקף לשעה.
        </p>
        <p className="text-[12.5px] text-ink-2">לא הגיע? כדאי לבדוק בספאם.</p>
        <Link href="/login" className="mt-2 text-[13px] font-semibold text-brand-hover">חזרה לכניסה</Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="אימייל" name="email" type="email" autoComplete="email" dir="ltr" inputMode="email"
             defaultValue={state.values?.email} />
      <FormError message={state.error} />
      <SubmitButton pending={pending}>לשלוח קישור</SubmitButton>
      <Link href="/login" className="text-center text-[13px] text-ink-2">חזרה לכניסה</Link>
    </form>
  );
}
