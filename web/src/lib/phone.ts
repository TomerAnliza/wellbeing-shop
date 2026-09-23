// טלפונים נשמרים בפורמט בינלאומי, ספרות בלבד: 972501234567 — כמו שוואטסאפ שולחת אותם.
// כך הבוט והאתר מזהים את אותו אדם.

/** "050-123-4567" / "+972 50 123 4567" / "972501234567" → "972501234567", או null אם לא תקין */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2); // 00972...
  if (digits.startsWith("0")) digits = "972" + digits.slice(1); // מקומי ישראלי
  // אותו כלל כמו ב-CHECK של הטבלה (supabase/migrations)
  return /^[1-9][0-9]{7,14}$/.test(digits) ? digits : null;
}

/** "972501234567" → "050-123-4567" (מספר ישראלי), אחרת "+<ספרות>" */
export function formatPhone(digits: string): string {
  const local = /^972(\d{2})(\d{3})(\d{4})$/.exec(digits);
  return local ? `0${local[1]}-${local[2]}-${local[3]}` : "+" + digits;
}
