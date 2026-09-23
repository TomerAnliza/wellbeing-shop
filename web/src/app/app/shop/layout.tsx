import { ShopTabs } from "@/components/shop-tabs";
import { TabBar } from "@/components/tab-bar";
import { WhatsAppFab } from "@/components/whatsapp-fab";

// מסגרת החנות: כותרת, טאבים פנימיים, FAB לוואטסאפ ושורת הטאבים התחתונה.
// רוחב מובייל (430px) גם בדסקטופ — העיצוב מובייל בלבד (docs/spec-mvp-screens.md)
export default function ShopLayout({ children }: LayoutProps<"/app/shop">) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-screen">
      <main className="flex flex-1 flex-col gap-4 px-5 pt-8 pb-28">
        <header>
          <h1 className="text-[23px] font-semibold tracking-tight">חנות</h1>
          <p className="mt-0.5 text-[13px] text-ink-2">ציוד לאימונים שלך</p>
        </header>
        <ShopTabs />
        {children}
      </main>
      <WhatsAppFab />
      <TabBar active="/app/shop" />
    </div>
  );
}
