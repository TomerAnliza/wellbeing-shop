// ── השלמת שם פרופיל? ─────────────────────────────────────────
// לקוחות שנרשמו לפני שנוספה העמודה whatsapp_name — משלימים אותה פעם אחת.
// ענף מקביל: לא מעכב את התשובה ללקוח.
// פלט: שורה לעדכון ב-customers, או כלום

const customer = $input.first().json;

const needsUpdate = customer.stage !== 'new' && !customer.wa_saved && customer.profile_name;
if (!needsUpdate) return [];

return [{ json: { phone: customer.phone, whatsapp_name: customer.profile_name } }];
