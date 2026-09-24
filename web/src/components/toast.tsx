"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// הודעה קצרה בתחתית המסך ("האימון נשמר"), 2600ms כמו בעיצוב.
// אחרי שהיא נעלמת מנקים את ?saved=1 מהכתובת, כדי שרענון לא יציג אותה שוב
export function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace(pathname, { scroll: false });
    }, 2600);
    return () => clearTimeout(timer);
  }, [router, pathname]);

  if (!visible) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-5 bottom-[184px] z-[90] mx-auto flex max-w-[390px] items-center gap-2.5 rounded-2xl bg-ink px-4 py-3.5 text-white shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)] lg:bottom-28"
    >
      <span className="ms text-[19px] text-[oklch(0.78_0.13_300)]" aria-hidden>check_circle</span>
      <span className="text-[14px] font-medium">{message}</span>
    </div>
  );
}
