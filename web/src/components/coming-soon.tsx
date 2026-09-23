import Link from "next/link";

// עמוד זמני לטאב שעוד לא נבנה: אומר מה יהיה כאן, ומפנה למה שכבר עובד
export function ComingSoon({ title, icon, text }: { title: string; icon: string; text: string }) {
  return (
    <>
      <h1 className="text-[23px] font-semibold tracking-tight lg:text-[30px]">{title}</h1>
      <div className="flex flex-col items-center gap-4 rounded-[20px] border border-card-border bg-card px-6 py-10 text-center lg:mx-auto lg:w-full lg:max-w-lg">
        <span className="ms text-[44px] text-brand-icon" aria-hidden>{icon}</span>
        <div>
          <h2 className="text-[15px] font-semibold">המסך הזה בבנייה</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{text}</p>
        </div>
        <Link
          href="/app/shop"
          className="flex items-center gap-2 rounded-[18px] bg-brand px-5 py-3 text-[15px] font-semibold text-white hover:bg-brand-hover"
        >
          <span className="ms text-xl" aria-hidden>storefront</span>
          בינתיים — לחנות
        </Link>
      </div>
    </>
  );
}
