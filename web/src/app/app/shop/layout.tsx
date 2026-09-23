import { ShopTabs } from "@/components/shop-tabs";

// כותרת החנות והטאבים הפנימיים. הניווט הראשי וה-FAB יושבים ב-app/app/layout.tsx
export default function ShopLayout({ children }: LayoutProps<"/app/shop">) {
  return (
    <>
      <header>
        <h1 className="text-[23px] font-semibold tracking-tight lg:text-[30px]">חנות</h1>
        <p className="mt-0.5 text-[13px] text-ink-2 lg:text-[15px]">ציוד לאימונים שלך</p>
      </header>
      <ShopTabs />
      {children}
    </>
  );
}
