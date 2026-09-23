# פרומפטים — Gemini (תמונות) ו-Codex (בוט וואטסאפ ב-n8n)

- **תאריך:** 23 בספטמבר 2026
- **גיליון החנות:** https://docs.google.com/spreadsheets/d/1TfXLEnReGfAFv2MfCeqfO-cdac81__YpRrsAB7bD8fU/edit
  (בבעלות `tomer@analiza-college.co.il`)

## Gemini — תמונות מוצרים

```text
Create a consistent series of 10 studio product photos for a fitness app shop.
Every image must share exactly the same style:
- One single product, centered, about 60% of the frame, slight 3/4 top-down angle
- Seamless solid background, soft lavender, exact color #F1EBFD, no gradient, no floor line
- Soft diffused daylight from the upper left, one gentle soft shadow under the product
- Product colors: muted lavender-purple (#9372C8), warm off-white and soft grey only
- No text, no logos, no brand names, no people, no hands, no props
- Square 1:1, high resolution, photorealistic

Generate them one by one, in this order, and label each with its file name:
gem_P-001 — a rolled-up 6 mm non-slip yoga mat with a fabric carrying strap
gem_P-002 — a single rectangular foam yoga block
gem_P-003 — a neatly coiled cotton yoga stretching strap with a metal D-ring buckle
gem_P-004 — a set of 5 flat resistance bands in graded shades, loosely fanned out
gem_P-005 — a pair of 3 kg neoprene-coated hand dumbbells, side by side
gem_P-006 — an 8 kg cast-iron kettlebell with a wide handle, matte finish
gem_P-007 — a 750 ml stainless steel insulated water bottle, standing upright
gem_P-008 — a slim elastic running belt with a zippered phone pocket, laid flat
gem_P-009 — a pair of breathable running socks with cushioned heels, laid flat
gem_P-010 — a folded microfiber sports towel

If an image drifts from the style, match the first image exactly.
```

שמירה: `wellbeing-app/public/products/candidates/gem_P-001.png` וכן הלאה.

## Codex — בוט וואטסאפ ב-n8n

```text
Build a starter WhatsApp shop bot as an n8n workflow on my self-hosted n8n (Coolify).
Work in Hebrew in all docs and bot messages. Read before acting:

1. /Users/tomerbu/Dropbox/AI Engineering/AI_Integrators_Specialists/A600/Final_Project/wellbeing-app/AGENTS.md
2. .../wellbeing-app/docs/spec-shop-and-agent.md  — the source of truth for this bot
3. /Users/tomerbu/Dropbox/automation/coolify/docs/06-n8n.md and docs/14-agent-access.md

ACCESS
- n8n URL and API key: N8N_URL and N8N_API_KEY in /Users/tomerbu/Dropbox/automation/coolify/.env.
  Use the n8n REST API. Never print, log, commit or paste any secret.
- WhatsApp Cloud API: WA_TOKEN, WA_PHONE_ID, WA_WABA_ID in /Users/tomerbu/Dropbox/automation/whatsapp/.env.
  Store them only as n8n credentials, never inside node parameters.
- Google Sheet (shop data): 1TfXLEnReGfAFv2MfCeqfO-cdac81__YpRrsAB7bD8fU
  tabs: products, customers, orders, discounts, chat_log. Owned by tomer@analiza-college.co.il.
  If the existing n8n Google credential belongs to another account, stop and tell me to share the sheet.

WHAT TO BUILD — one workflow "wellbeing-shop-bot", created INACTIVE:
1. WhatsApp trigger (incoming message). Ignore status updates (sent/delivered/read).
2. Identify the sender by phone (international format, e.g. 972501234567) in the customers tab.
3. Unknown number → onboarding:
   - First message: "היי! אני העוזר של החנות 👋 איך קוראים לך?"
   - If the first message is already a question, answer briefly AND ask for the name in the same reply.
   - Extract the name with an LLM that returns JSON {"name": string|null}. Accept 2–30 chars,
     not a question, not a number. If invalid, ask once more, then continue without a name.
   - Append a row to customers: phone, name, created_at, user_id empty, source=whatsapp.
   - Reply: "נעים מאוד, {name}!" + a WhatsApp List of the router options + an app signup link
     placeholder (https://example.com/signup?t=TOKEN — mark as TODO, do not invent a real URL).
4. Known customer → receptionist router: an LLM classifier with exactly these routes:
   sales (מכירות) · support (שירות לקוחות) · fitness (ייעוץ כושר) · shipping (מידע על משלוח) · signup (הרשמה/לקוח חדש)
   plus a fallback route "unclear" that asks one clarifying question with a List of the 5 options.
5. One branch per route, each a minimal AI agent or node with its own short Hebrew system prompt:
   - sales: tools search_products / get_product from the products tab. Prices ONLY from the sheet.
     Ordering is out of scope for this starter — reply that a human rep will follow up.
   - support: collect the issue in one message, append to orders with empty items and status=new,
     confirm a human rep will reply.
   - fitness: general tips only. No medical advice; pain or injury → refer to a professional.
   - shipping: look up the customer's latest order in orders by phone, report its status.
   - signup: send the app signup link placeholder.
6. Log every incoming and outgoing message to chat_log (timestamp, phone, user_id, role, message, tool_called).
7. All branches converge into ONE send-message node. Up to 3 options → reply buttons; 4+ → List.
   Verify the interactive message payload and limits against Meta's official WhatsApp Cloud API
   docs before using them; do not rely on memory.
8. Conversation memory keyed by phone number.

SAFETY — hard rules
- Do NOT change the Meta webhook configuration of the WhatsApp number. It may already serve
  another production bot. Tell me what webhook URL to register and I will decide.
- Do NOT activate the workflow. Test with pinned sample data only, and do not send real
  WhatsApp messages without my explicit approval of the recipient number and text.
- Do NOT edit or delete any other workflow or credential on the n8n instance.
- Do NOT git push. The wellbeing-app folder is a fork that still points at the original remote.

DELIVERABLES
- The workflow ID and its URL in n8n.
- A test report: 5 pinned-data runs — new number, new number opening with a question,
  known customer asking a price, known customer asking about shipping, an unclear message.
  For each: input, route taken, reply text.
- A Hebrew doc at wellbeing-app/docs/whatsapp-bot-n8n.md: architecture, nodes, prompts,
  credentials used (names only), how to activate, and what is still TODO.
- A journal entry in wellbeing-app/docs/journal/ with an absolute date.
```
