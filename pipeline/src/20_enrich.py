"""20_enrich — enrichment via Apify, written to the per-domain cache.

Reads data/out/run_state.json (from 10_ingest). Domains are crawled in BATCHES
(one Apify actor run per chunk of `providers.apify.batch_size` domains) — far
faster and cheaper than one cold-started run per domain, and resilient to a
flaky network (short start→poll→fetch calls, all retried).

Resume: only SUCCESSFUL enrichments (text, no errors) are skipped, so a failed
or empty domain is retried on the next run (never frozen into cestino E).
The classifier (30) reads ONLY from this cache.

  python src/20_enrich.py [--dry-run] [--force] [--limit N]

Guardrail: aborts if INSTANTLY_API_KEY is present.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import config
from lib.budget import BudgetGuard
from lib.cache import is_enriched, write_cache
from lib.providers import apify
from lib.runlog import append_stage, merge_errors


def load_state() -> dict:
    p = config.DATA_OUT / "run_state.json"
    if not p.exists():
        print("No run_state.json — run 10_ingest first.")
        raise SystemExit(1)
    return json.loads(p.read_text(encoding="utf-8"))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    config.assert_no_instantly()
    cfg = config.load_config()
    state = load_state()
    leads = state.get("leads", [])
    if args.limit:
        leads = leads[: args.limit]

    per_domain = apify.cost_per_domain_eur(cfg)
    budget = BudgetGuard(config.budget_cap_eur())
    token = config.env("APIFY_API")

    todo = [l for l in leads if args.force or not is_enriched(l["dominio"])]
    skipped = len(leads) - len(todo)

    if args.dry_run:
        est = len(todo) * per_domain
        append_stage("enrich", {"to_enrich": len(todo), "cached_skip": skipped,
                                 "est_cost_eur": round(est, 3), "dry_run": True})
        print(f"enrich (dry-run): {len(todo)} to enrich, {skipped} cached, "
              f"est {est:.2f} EUR (cap {budget.cap:.0f})")
        return 0

    if not token:
        print("APIFY_API missing — set it or use --dry-run.")
        return 1

    # Cap the batch to what the budget affords, up front (§6: no silent partial).
    affordable = budget.affordable(per_domain)
    truncated = max(0, len(todo) - affordable)
    if truncated:
        print(f"budget: cap {budget.cap:.2f} EUR → {affordable}/{len(todo)} domini ({truncated} rimandati)")
        todo = todo[:affordable]

    seed_by_dom = {l["dominio"]: l.get("seed", {}) for l in todo}
    domains = [l["dominio"] for l in todo]
    batch_size = int((cfg.get("providers", {}) or {}).get("apify", {}).get("batch_size", 200))

    enriched, errors, fails = 0, 0, []
    for i in range(0, len(domains), batch_size):
        chunk = domains[i:i + batch_size]
        try:
            result = apify.run_batch(token, chunk, cfg)
        except Exception as e:  # noqa: BLE001 — whole run failed to start; mark chunk, continue
            msg = str(e).split("?")[0]
            result = {d: {"annunci": [], "text": "", "sources": [], "providers": [], "errors": [msg]} for d in chunk}
        print(f"  batch {i // batch_size + 1}: {len(chunk)} domini")
        for d in chunk:
            frag = result.get(d, {"annunci": [], "text": "", "sources": [], "providers": [], "errors": ["missing"]})
            errs = frag.get("errors") or []
            if errs:
                errors += 1
                fails.append({"domain": d, "stage": "enrich", "error": errs[0]})
            else:
                budget.charge("apify", per_domain)  # only successful crawls
                enriched += 1
            write_cache(d, {"domain": d, "seed": seed_by_dom.get(d, {}), "annunci": frag["annunci"],
                            "text": frag["text"], "sources": frag["sources"],
                            "providers": frag.get("providers", []), "errors": errs})

    if fails:
        merge_errors("enrich", fails)
    append_stage("enrich", {"enriched": enriched, "cached_skip": skipped, "errors": errors,
                            "budget_truncated": truncated, "batch_size": batch_size,
                            "budget_spent_eur": round(budget.spent, 4), "dry_run": False})
    print(f"enrich: {enriched} enriched, {skipped} cached, {errors} errors, spent {budget.spent:.3f} EUR "
          f"(batch da {batch_size})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
