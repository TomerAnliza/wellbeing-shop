"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// הניווט הראשי של האפליקציה, ארבעה טאבים כמו בעיצוב.
// במובייל: שורת טאבים בתחתית. בדסקטופ (lg ומעלה): ניווט אופקי בכותרת העליונה.
export const TABS = [
  { href: "/app", icon: "today", label: "היום" },
  { href: "/app/new", icon: "add_circle", label: "אימון" },
  { href: "/app/shop", icon: "storefront", label: "חנות" },
  { href: "/app/progress", icon: "insights", label: "התקדמות" },
] as const;

// "/app" פעיל רק בדיוק בו; שאר הטאבים פעילים גם בתתי-עמודים (/app/shop/orders)
function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));
}

export function TabBar() {
  const isActive = useActive();
  return (
    <nav
      aria-label="ניווט ראשי"
      className="sticky bottom-0 z-20 flex border-t border-card-border bg-screen/90 px-2 pt-2 pb-6 backdrop-blur-md lg:hidden"
    >
      {TABS.map((t) => {
        const active = isActive(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-1 text-[10.5px] font-medium ${
              active ? "text-brand-hover" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            <span className="ms text-[23px]" aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function TopNav() {
  const isActive = useActive();
  return (
    <header className="sticky top-0 z-20 hidden border-b border-card-border bg-screen/90 backdrop-blur-md lg:block">
      <div className="mx-auto flex max-w-6xl items-center gap-10 px-8 py-4">
        <Link href="/app" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
          <span className="ms text-[26px] text-brand" aria-hidden>favorite</span>
          Wellbeing
        </Link>
        <nav aria-label="ניווט ראשי" className="flex gap-1">
          {TABS.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium ${
                  active ? "bg-brand-soft text-brand-soft-ink" : "text-ink-2 hover:bg-ink/5"
                }`}
              >
                <span className="ms text-[20px]" aria-hidden>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
