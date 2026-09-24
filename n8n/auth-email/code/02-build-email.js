// ── בניית מייל ───────────────────────────────────────────────
// Supabase שולח { user, email_data }. email_data.email_action_type אומר איזה מייל:
//   recovery — איפוס סיסמה. הקישור מוביל לאתר שלנו (/auth/confirm), שמאמת אותו בשרת
//   אחר      — מייל כללי עם הקוד (בפועל לא נשלח: אישור אימייל כבוי, ואין שינוי אימייל)
// כתובת האתר: מ-redirect_to, ש-Supabase כבר בדק מול רשימת הכתובות המותרות.

const { user, email_data: data } = $input.first().json.payload;

const site = new URL(data.redirect_to || data.site_url).origin;
const name = user.user_metadata?.display_name || '';
const hello = name ? `היי ${name},` : 'היי,';

const esc = value =>
  String(value ?? '').replace(
    /[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

let subject, title, lines, button;

if (data.email_action_type === 'recovery') {
  const link =
    `${site}/auth/confirm?type=recovery&next=%2Freset-password` +
    `&token_hash=${encodeURIComponent(data.token_hash)}`;
  subject = 'איפוס הסיסמה שלך — Wellbeing';
  title = 'איפוס סיסמה';
  lines = [
    hello,
    'קיבלנו בקשה לאפס את הסיסמה לחשבון שלך. הקישור תקף לשעה, ועובד פעם אחת.',
    'לא ביקשת? אפשר להתעלם מהמייל — הסיסמה לא משתנה.',
  ];
  button = { href: link, label: 'לבחירת סיסמה חדשה' };
} else {
  subject = 'קוד אימות — Wellbeing';
  title = 'קוד אימות';
  lines = [hello, `קוד האימות שלך: <b dir="ltr">${esc(data.token)}</b>`, 'הקוד תקף לשעה.'];
  button = null;
}

const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#f7f4ef;padding:24px;border-radius:18px">
  <div style="font-size:20px;font-weight:bold;color:#1c1b19;margin-bottom:6px">💜 Wellbeing</div>
  <div style="background:#fffdf8;border:1px solid #ece8e1;border-radius:16px;padding:22px">
    <div style="font-size:18px;font-weight:bold;color:#1c1b19;margin-bottom:12px">${title}</div>
    ${lines.map(line => `<p style="margin:0 0 10px;color:#3a3833;font-size:15px;line-height:1.6">${line.startsWith('קוד') ? line : esc(line)}</p>`).join('')}
    ${
      button
        ? `<p style="margin:18px 0 6px"><a href="${esc(button.href)}" style="background:#9372C8;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block">${button.label}</a></p>`
        : ''
    }
  </div>
  <p style="color:#8a8494;font-size:12px;text-align:center;margin-top:14px">המייל נשלח אוטומטית מ-Wellbeing. לא צריך להשיב לו.</p>
</div>`;

return [{ json: { to: user.email, subject, html } }];
