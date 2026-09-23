import Image from "next/image";
import { askAboutProduct, formatPrice, STOCK_LABEL, type Product } from "@/lib/shop";

const STOCK_COLOR = { in: "text-emerald-700", low: "text-amber-700", out: "text-ink-3" } as const;

export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="flex flex-col gap-2 rounded-[20px] border border-card-border bg-card p-3">
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-brand-soft">
        {p.image ? (
          <Image src={p.image} alt={p.name} fill sizes="(max-width: 430px) 45vw, 200px" className="object-cover" />
        ) : (
          <span className="ms absolute inset-0 m-auto size-fit text-[38px] text-brand-icon" aria-hidden>
            fitness_center
          </span>
        )}
      </div>
      <h3 className="min-h-9 text-sm font-medium leading-tight">{p.name}</h3>
      <div className="flex items-baseline justify-between gap-1.5">
        <span className="text-base font-semibold">{formatPrice(p.price)}</span>
        <span className={`text-[11px] font-medium ${STOCK_COLOR[p.stock_status]}`}>{STOCK_LABEL[p.stock_status]}</span>
      </div>
      <a
        href={askAboutProduct(p)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-brand/35 py-2 text-[13px] font-semibold text-brand-soft-ink transition-colors hover:bg-brand-soft"
      >
        <span className="ms text-base" aria-hidden>chat</span>
        שאל בוואטסאפ
      </a>
    </article>
  );
}
