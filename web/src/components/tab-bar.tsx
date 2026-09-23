import Link from "next/link";

// שורת הטאבים התחתונה, כמו בעיצוב. רק החנות בנויה כרגע — השאר מסומנים "בקרוב"
const TABS = [
  { href: "/app", icon: "today", label: "היום", ready: false },
  { href: "/app/new", icon: "add_circle", label: "אימון", ready: false },
  { href: "/app/shop", icon: "storefront", label: "חנות", ready: true },
  { href: "/app/progress", icon: "insights", label: "התקדמות", ready: false },
] as const;

export function TabBar({ active }: { active: string }) {
  return (
    <nav
      aria-label="ניווט ראשי"
      className="sticky bottom-0 z-20 flex border-t border-card-border bg-screen/90 px-2 pt-2 pb-6 backdrop-blur-md"
    >
      {TABS.map((t) => {
        const isActive = t.href === active;
        const cls = `flex flex-1 flex-col items-center gap-1 py-1 text-[10.5px] font-medium ${
          isActive ? "text-brand-hover" : "text-ink-3"
        }`;
        const inner = (
          <>
            <span className="ms text-[23px]" aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </>
        );
        return t.ready ? (
          <Link key={t.href} href={t.href} className={cls} aria-current={isActive ? "page" : undefined}>
            {inner}
          </Link>
        ) : (
          <span key={t.href} className={`${cls} opacity-50`} aria-disabled title="בקרוב">
            {inner}
          </span>
        );
      })}
    </nav>
  );
}
