// ─────────────────────────────────────────────────────────────────────────────
// Instantly V2 API field validator.
//
// Hits the three read endpoints the dashboard relies on and prints the actual
// field names returned, so we can confirm (or fix) the mapping in
// src/lib/instantly.ts against a real account — no guessing.
//
// Usage:
//   INSTANTLY_API_KEY=your_key node scripts/validate-instantly.mjs
//   (optional) START=2026-05-01 END=2026-05-31 INSTANTLY_API_KEY=... node scripts/validate-instantly.mjs
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://api.instantly.ai/api/v2";
const KEY = process.env.INSTANTLY_API_KEY;

if (!KEY) {
  console.error("✗ Set INSTANTLY_API_KEY first.");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
const START = process.env.START || monthAgo;
const END = process.env.END || today;

// What the dashboard's parser currently expects per endpoint.
const EXPECTED = {
  "/campaigns/analytics": [
    "campaign_id",
    "campaign_name",
    "campaign_status",
    "leads_count",
    "contacted_count",
    "emails_sent_count",
    "open_count",
    "reply_count",
    "link_click_count",
    "bounced_count",
    "unsubscribed_count",
    "completed_count",
    "total_opportunities",
    "total_opportunity_value",
  ],
  "/campaigns/analytics/daily": ["date", "sent", "opened", "replies", "clicks", "bounced"],
  "/accounts": [
    "email",
    "status",
    "warmup_status",
    "stat_warmup_score",
    "bounce_rate",
    "daily_limit",
  ],
};

async function call(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, json };
}

function firstItem(json) {
  if (Array.isArray(json)) return json[0];
  if (json && Array.isArray(json.items)) return json.items[0];
  return json;
}

function report(path, expected, item) {
  console.log(`\n── ${path} ──`);
  if (!item || typeof item !== "object") {
    console.log("  (no items returned — try a wider date range or check the account)");
    return;
  }
  const keys = Object.keys(item);
  console.log("  actual keys:", keys.join(", "));
  const missing = expected.filter((k) => !(k in item));
  if (missing.length) {
    console.log("  ⚠ expected-but-missing:", missing.join(", "));
    console.log("    → update the mapping in src/lib/instantly.ts for these.");
  } else {
    console.log("  ✓ all expected fields present");
  }
}

(async () => {
  console.log(`Validating Instantly V2 fields (range ${START} → ${END})`);

  const ca = await call("/campaigns/analytics", { start_date: START, end_date: END });
  console.log(`\n[campaigns/analytics] HTTP ${ca.status}`);
  if (ca.ok) report("/campaigns/analytics", EXPECTED["/campaigns/analytics"], firstItem(ca.json));
  else console.log("  error:", JSON.stringify(ca.json).slice(0, 300));

  const da = await call("/campaigns/analytics/daily", { start_date: START, end_date: END });
  console.log(`\n[campaigns/analytics/daily] HTTP ${da.status}`);
  if (da.ok)
    report("/campaigns/analytics/daily", EXPECTED["/campaigns/analytics/daily"], firstItem(da.json));
  else console.log("  error:", JSON.stringify(da.json).slice(0, 300));

  const ac = await call("/accounts", { limit: 5 });
  console.log(`\n[accounts] HTTP ${ac.status}`);
  if (ac.ok) report("/accounts", EXPECTED["/accounts"], firstItem(ac.json));
  else console.log("  error:", JSON.stringify(ac.json).slice(0, 300));

  console.log("\nDone. Paste this output back to update the parser if anything is ⚠.");
})();
