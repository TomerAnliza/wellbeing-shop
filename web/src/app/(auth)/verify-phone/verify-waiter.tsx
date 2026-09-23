"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isPhoneVerified } from "@/app/actions/auth";

// בודק כל 3 שניות אם הבוט כבר אימת את הטלפון, ועובר ל"היום" לבד.
// עוצר אחרי 15 דקות — תוקף הקוד
export function VerifyWaiter() {
  const router = useRouter();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(async () => {
      if (Date.now() - started > 15 * 60 * 1000) {
        clearInterval(timer);
        setExpired(true);
        return;
      }
      if (await isPhoneVerified()) {
        clearInterval(timer);
        router.replace("/app");
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [router]);

  if (expired) {
    return (
      <p className="mt-4 text-center text-[13px] text-ink-2">
        הקוד פג. <button onClick={() => router.refresh()} className="font-semibold text-brand-hover">לקבל קוד חדש</button>
      </p>
    );
  }

  return (
    <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-ink-2" aria-live="polite">
      <span className="size-2 animate-pulse rounded-full bg-brand" aria-hidden />
      מחכים להודעה שלך… הדף יתקדם לבד.
    </p>
  );
}
