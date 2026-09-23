import type { Metadata } from "next";
import { ProductsView } from "@/components/products-view";
import { getProducts } from "@/lib/shop";

export const metadata: Metadata = { title: "חנות · Wellbeing" };

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-3.5">
      {/* באנר הנחת כושר. בלי משתמש מחובר עדיין אי אפשר לדעת זכאות — לכן ניסוח כללי ומזמין */}
      <div className="flex items-center gap-3 rounded-[18px] bg-brand-soft px-4 py-3.5">
        <span className="ms text-xl text-brand-icon" aria-hidden>local_offer</span>
        <p className="text-[12.5px] leading-relaxed text-brand-soft-ink">
          <b>משלימים את היעד השבועי?</b> מקבלים 10% הנחת כושר על כל החנות.
        </p>
      </div>

      {products ? (
        <ProductsView products={products} />
      ) : (
        <div className="rounded-[18px] border border-card-border bg-card p-5 text-center text-sm text-ink-2">
          לא הצלחנו לטעון את המוצרים כרגע. נסו שוב בעוד רגע, או שאלו אותנו בוואטסאפ.
        </div>
      )}
    </div>
  );
}
