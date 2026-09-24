"use client";

import { useActionState } from "react";
import { setNewPassword, type FormState } from "@/app/actions/auth";
import { Field, FormError, SubmitButton } from "@/components/form";

export function ResetForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(setNewPassword, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="סיסמה חדשה" name="password" type="password" autoComplete="new-password" dir="ltr" hint="8 תווים לפחות" />
      <Field label="שוב, לאימות" name="confirm" type="password" autoComplete="new-password" dir="ltr" />
      <FormError message={state.error} />
      <SubmitButton pending={pending}>לשמור סיסמה</SubmitButton>
    </form>
  );
}
