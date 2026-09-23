"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// הטאבים הפנימיים של החנות. כל טאב הוא כתובת משלו — "אחורה" וקישור ישיר עובדים
const TABS = [
  { href: "/app/shop", label: "מוצרים" },
  { href: "/app/shop/orders", label: "ההזמנות שלי" },
];

export function ShopTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-6 border-b border-card-border">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 px-0.5 pb-2.5 text-[14.5px] font-semibold ${
              active ? "border-brand text-ink" : "border-transparent text-ink-3"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
