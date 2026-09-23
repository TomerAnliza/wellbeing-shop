"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type FormState } from "@/app/actions/auth";
import { Field, FormError, SubmitButton } from "@/components/form";

export function SignupForm({ phone }: { phone?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signUp, {});
  const values = state.values ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="איך קוראים לך?" name="name" autoComplete="given-name" defaultValue={values.name} />
      <Field label="אימייל" name="email" type="email" autoComplete="email" dir="ltr" inputMode="email"
             defaultValue={values.email} />
      <Field label="סיסמה" name="password" type="password" autoComplete="new-password" dir="ltr"
             hint="8 תווים לפחות" />
      <Field label="טלפון נייד" name="phone" type="tel" autoComplete="tel" dir="ltr" inputMode="tel"
             placeholder="050-123-4567" defaultValue={values.phone ?? phone}
             hint="נאמת אותו בהודעת וואטסאפ אחת. כך העוזר בוואטסאפ מזהה אותך, ואת ההנחה שלך." />
      <FormError message={state.error} />
      <SubmitButton pending={pending}>להרשמה</SubmitButton>
      <p className="text-center text-[13px] text-ink-2">
        כבר יש חשבון? <Link href="/login" className="font-semibold text-brand-hover">כניסה</Link>
      </p>
    </form>
  );
}
