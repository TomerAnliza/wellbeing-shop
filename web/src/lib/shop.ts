// נתוני החנות. מקור האמת: גיליון Google, לשונית products.
// ה-n8n חושף אותו כ-JSON (תרחיש "wellbeing — קטלוג לאתר"), וזו אותה טבלה שבוט הוואטסאפ קורא.

export type StockStatus = "in" | "low" | "out";

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock_status: StockStatus;
  image: string | null;
};

export const CATEGORIES = ["הכול", "יוגה", "כוח", "ריצה", "כללי"] as const;

export const STOCK_LABEL: Record<StockStatus, string> = {
  in: "במלאי",
  low: "נשארו מעט",
  out: "אזל",
};

// המספר העסקי של הבוט. ציבורי מטבעו — לקוחות כותבים אליו
export const WHATSAPP_NUMBER = "972554680476";

export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function askAboutProduct(p: Pick<Product, "id" | "name">): string {
  // קוד המוצר בסוגריים — כך הבוט יודע על איזה מוצר שואלים
  return whatsappLink(`שאלה על ${p.name} (${p.id})`);
}

export function formatPrice(n: number): string {
  return `${n.toLocaleString("he-IL")} ₪`;
}

/**
 * הקטלוג, בצד השרת בלבד. מתרענן לכל היותר פעם בדקה (docs/spec-shop-and-agent.md).
 * מחזיר null כשהשירות אינו זמין — המסך מציג הודעת שגיאה ולא קורס.
 */
export async function getProducts(): Promise<Product[] | null> {
  const url = process.env.PRODUCTS_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { products?: Product[] };
    return Array.isArray(data.products) ? data.products : null;
  } catch {
    return null;
  }
}
