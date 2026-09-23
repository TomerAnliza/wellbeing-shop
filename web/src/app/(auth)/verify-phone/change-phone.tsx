"use client";

import { useActionState, useState } from "react";
import { changePhone, type FormState } from "@/app/actions/auth";
import { Field, FormError, SubmitButton } from "@/components/form";

// "המספר לא נכון?" — פותח טופס קטן לעדכון הטלפון
export function ChangePhone({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await changePhone(prev, formData);
    if (!result.error) setOpen(false);
    return result;
  }, {});

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-start text-[13px] text-ink-2 underline-offset-2 hover:underline">
        המספר <span dir="ltr">{current}</span> לא נכון?
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <Field label="מספר נייד" name="phone" type="tel" dir="ltr" inputMode="tel" placeholder="050-123-4567"
             defaultValue={state.values?.phone} />
      <FormError message={state.error} />
      <SubmitButton pending={pending}>לעדכן את המספר</SubmitButton>
    </form>
  );
}
