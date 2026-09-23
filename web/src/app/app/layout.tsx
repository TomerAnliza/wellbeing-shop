import { TabBar, TopNav } from "@/components/tab-bar";
import { WhatsAppFab } from "@/components/whatsapp-fab";

// מסגרת האפליקציה: ניווט, FAB לוואטסאפ ורוחב התוכן.
// מובייל: עמודה של 430px כמו בעיצוב. דסקטופ: ניווט עליון ותוכן ברוחב 6xl (docs/web-shop.md)
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex min-h-screen flex-col bg-screen">
      <TopNav />
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col lg:max-w-6xl">
        <main className="flex flex-1 flex-col gap-4 px-5 pt-8 pb-28 lg:px-8 lg:pt-10 lg:pb-16">{children}</main>
        <TabBar />
      </div>
      <WhatsAppFab />
    </div>
  );
}
