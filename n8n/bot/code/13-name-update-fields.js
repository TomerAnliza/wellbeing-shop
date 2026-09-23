// ── שדות לעדכון ──────────────────────────────────────────────
// רק העמודות של customers. בלי הסינון הזה, צומת הגיליון (autoMap) היה כותב
// לגיליון גם שדות פנימיים, כמו askAgain.

const { phone, name, whatsapp_name } = $input.first().json;

return [{ json: { phone, name, whatsapp_name } }];
