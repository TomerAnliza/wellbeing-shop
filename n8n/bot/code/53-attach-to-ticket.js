// ── צירוף לפנייה ─────────────────────────────────────────────
// מוסיף את התמונה לשורה הקיימת בגיליון: כל קישור בשורה משלו בתוך התא.
// הכיתוב, אם יש, מתווסף להודעה.
// פלט: העמודות לעדכון, לפי ticket_id

const ticket = $('פנייה עם תמונה').first().json;
const rows = $input.all().map(item => item.json);
const row = rows.find(r => String(r.ticket_id) === ticket.ticket_id) || {};

// מוסיף שורה לתא קיים, בלי שורות ריקות
const addLine = (cell, line) => [String(cell || '').trim(), line].filter(Boolean).join('\n');

const update = {
  ticket_id: ticket.ticket_id,
  images: addLine(row.images, ticket.url),
  image_paths: addLine(row.image_paths, ticket.path),
};
if (ticket.caption) update.message = addLine(row.message, ticket.caption);

return [{ json: update }];
