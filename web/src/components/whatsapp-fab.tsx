import { whatsappLink } from "@/lib/shop";

// FAB: פותח שיחה עם בוט החנות בוואטסאפ (docs/spec-shop-and-agent.md — "כניסה לסוכן")
export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("היי, יש לי שאלה על החנות")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שיחה עם העוזר של החנות בוואטסאפ"
      className="fixed bottom-28 z-30 lg:bottom-8 flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_-8px_oklch(0.62_0.13_300/0.8)] transition-colors hover:bg-brand-hover"
      style={{ insetInlineEnd: "max(20px, calc((100vw - var(--app-w)) / 2 + 20px))" }}
    >
      <span className="ms text-[26px]" aria-hidden>chat</span>
    </a>
  );
}
