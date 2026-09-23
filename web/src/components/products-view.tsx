"use client";

import { useState } from "react";
import { CATEGORIES, type Product } from "@/lib/shop";
import { ProductCard } from "./product-card";

// סינון לפי קטגוריה בצד הלקוח — הקטלוג קטן, ואין סיבה לחזור לשרת
export function ProductsView({ products }: { products: Product[] }) {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("הכול");
  const shown = cat === "הכול" ? products : products.filter((p) => p.category === cat);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-2 overflow-x-auto pb-0.5" role="group" aria-label="סינון לפי קטגוריה">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`flex-none rounded-full border px-3.5 py-1.5 text-[13px] font-medium ${
              cat === c ? "border-transparent bg-brand text-white" : "border-ink/10 bg-card text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {shown.length === 0 && <p className="py-8 text-center text-sm text-ink-2">אין מוצרים בקטגוריה הזו כרגע.</p>}
    </div>
  );
}
