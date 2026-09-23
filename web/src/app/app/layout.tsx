import { AccountLink, TabBar, TopNav } from "@/components/tab-bar";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { getProfile } from "@/lib/auth";

// מסגרת האפליקציה: ניווט, אווטאר (או "כניסה"), FAB לוואטסאפ ורוחב התוכן.
// מובייל: עמודה של 430px כמו בעיצוב. דסקטופ: ניווט עליון ותוכן ברוחב 6xl (docs/web-shop.md).
// החנות פתוחה לכולם; שאר העמודים בודקים התחברות בעצמם (requireVerifiedProfile)
export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const profile = await getProfile();
  const account = profile ? { name: profile.display_name || "?" } : null;

  return (
    <div className="flex min-h-screen flex-col bg-screen">
      <TopNav account={account} />
      <div className="relative mx-auto flex w-full max-w-[430px] flex-1 flex-col lg:max-w-6xl">
        {/* במובייל האווטאר בפינה העליונה, כמו בעיצוב. בדסקטופ הוא בניווט העליון */}
        <div className="absolute top-7 left-5 z-10 lg:hidden">
          <AccountLink account={account} />
        </div>
        <main className="flex flex-1 flex-col gap-4 px-5 pt-8 pb-28 lg:px-8 lg:pt-10 lg:pb-16">{children}</main>
        <TabBar />
      </div>
      <WhatsAppFab />
    </div>
  );
}
