// ── שדות הזמנה ───────────────────────────────────────────────
// רק עמודות גיליון ההזמנות — שדות העזר של המלאי אינם נכתבים לגיליון.

const { valid, _pid, _newStock, ...orderRow } = $input.first().json;

return [{ json: orderRow }];
