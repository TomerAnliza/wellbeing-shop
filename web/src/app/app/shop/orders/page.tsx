import type { Metadata } from "next";
import { whatsappLink } from "@/lib/shop";

export const metadata: Metadata = { title: "ההזמנות שלי · Wellbeing" };

// בלי התחברות אין לנו דרך לדעת מי הלקוח — ההזמנות מנוהלות בוואטסאפ, לפי מספר הטלפון.
// כשתיכנס הרשמה (docs/spec-shop-and-agent.md), המסך יציג את ההזמנות מהגיליון.
export default function OrdersPage() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[20px] border border-card-border bg-card px-5 py-8 text-center">
      <span className="ms text-[40px] text-brand-icon" aria-hidden>receipt_long</span>
      <div>
        <h2 className="text-[15px] font-semibold">ההזמנות שלך בוואטסאפ</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
          הזמנות נעשות מול העוזר שלנו בוואטסאפ, ונציג חוזר אליך לתיאום תשלום ומשלוח.
          אפשר לשאול אותו בכל רגע מה מצב ההזמנה.
        </p>
      </div>
      <a
        href={whatsappLink("איפה ההזמנה שלי?")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-[18px] bg-brand px-5 py-3 text-[15px] font-semibold text-white hover:bg-brand-hover"
      >
        <span className="ms text-xl" aria-hidden>chat</span>
        לבדוק את ההזמנה שלי
      </a>
    </div>
  );
}
