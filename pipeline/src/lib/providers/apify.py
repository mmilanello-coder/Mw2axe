"""Apify enrichment — crawl the agency's own website → text for the classifier.

We start from the agency DOMAIN (not an immobiliare.it URL), so the direct,
robust path is apify/website-content-crawler: it crawls the site (home +
internal pages) and returns clean text. The LLM then extracts every flag
(open_house, struttura, nome, prezzi) from that text.

A dedicated immobiliare.it actor (structured prices/dates) is a future upgrade —
it needs a domain → immobiliare.it profile mapping we don't have yet.

Never raises for a single bad domain (records the error instead).
"""
from __future__ import annotations

import time

from ..domains import normalize_domain
from ..http import request as http_request

APIFY_BASE = "https://api.apify.com/v2"


def run_actor(token: str, actor_id: str, run_input: dict, timeout: int = 300) -> list:
    # Apify path uses "username~actorname". Auth via header (NOT ?token= in the
    # URL) so the token never leaks into request/error messages. Retries on 429/5xx.
    path_id = actor_id.replace("/", "~")
    url = f"{APIFY_BASE}/acts/{path_id}/run-sync-get-dataset-items"
    res = http_request(
        "POST", url, headers={"Authorization": f"Bearer {token}"}, json=run_input, timeout=timeout, retries=2
    )
    data = res.json()
    return data if isinstance(data, list) else data.get("items", [])


def _apify_cfg(cfg: dict) -> dict:
    return (cfg.get("providers", {}) or {}).get("apify", {}) or {}


def enrich_domain(token: str, domain: str, cfg: dict) -> dict:
    a = _apify_cfg(cfg)
    actor = a.get("actor") or "apify/website-content-crawler"
    run_input = {
        "startUrls": [{"url": f"https://{domain}"}],
        "crawlerType": a.get("crawler_type", "cheerio"),
        "maxCrawlPages": a.get("max_pages", 6),
        "maxCrawlDepth": a.get("max_depth", 1),
        "saveMarkdown": True,
    }
    result: dict = {"annunci": [], "text": "", "sources": [], "providers": ["website-content-crawler"]}
    try:
        items = run_actor(token, actor, run_input)
    except Exception as e:  # one bad domain must not kill the batch
        result["errors"] = [str(e)]
        return result

    texts: list[str] = []
    for it in items:
        if not isinstance(it, dict):
            continue
        text = (it.get("text") or it.get("markdown") or "").strip()
        if text:
            texts.append(text)
        url = it.get("url")
        if url:
            result["sources"].append({"url": url, "kind": "site"})
    result["text"] = "\n\n".join(texts)[:20000]
    return result


def cost_per_domain_eur(cfg: dict) -> float:
    return float(_apify_cfg(cfg).get("cost_per_domain_eur", 0.02))


# ── Batch enrichment: ONE actor run for many domains (async + poll) ───────────
# website-content-crawler is built to crawl many URLs in a single run. Running
# one actor per domain cold-starts a container each time (minutes); batching all
# domains into one run is far faster and cheaper, and survives a flaky network
# because every HTTP call is short (start → poll → fetch) and retried.

def distribute_items(domains: list[str], items: list) -> dict:
    """Map crawler dataset items (one per crawled URL) back to the requested
    domains by host. Pure — unit-tested."""
    by_host: dict[str, dict] = {}
    for it in items:
        if not isinstance(it, dict):
            continue
        host = normalize_domain(it.get("url") or "")
        if not host:
            continue
        text = (it.get("text") or it.get("markdown") or "").strip()
        entry = by_host.setdefault(host, {"texts": [], "sources": []})
        if text:
            entry["texts"].append(text)
        entry["sources"].append({"url": it.get("url"), "kind": "site"})

    out: dict = {}
    for d in domains:
        e = by_host.get(d)
        if e and e["texts"]:
            out[d] = {"annunci": [], "text": "\n\n".join(e["texts"])[:20000],
                      "sources": e["sources"], "providers": ["website-content-crawler"]}
        else:
            out[d] = {"annunci": [], "text": "", "sources": [],
                      "providers": ["website-content-crawler"], "errors": ["no content"]}
    return out


def _fetch_dataset(dataset_id: str, headers: dict, page: int = 1000) -> list:
    items: list = []
    offset = 0
    while True:
        res = http_request(
            "GET", f"{APIFY_BASE}/datasets/{dataset_id}/items", headers=headers,
            params={"clean": "true", "offset": offset, "limit": page}, timeout=30, retries=3,
        )
        batch = res.json()
        batch = batch if isinstance(batch, list) else batch.get("items", [])
        items += batch
        if len(batch) < page:
            break
        offset += page
    return items


def run_batch(token: str, domains: list[str], cfg: dict, poll_interval: int = 10, max_wait: int = 3600) -> dict:
    """Run ONE crawler run over `domains` (homepages) and return {domain: frag}.
    Raises only if the run can't be started; per-domain misses become error frags."""
    a = _apify_cfg(cfg)
    actor = (a.get("actor") or "apify/website-content-crawler").replace("/", "~")
    headers = {"Authorization": f"Bearer {token}"}
    run_input = {
        "startUrls": [{"url": f"https://{d}"} for d in domains],
        "crawlerType": a.get("crawler_type", "cheerio"),
        "maxCrawlDepth": a.get("max_depth", 0),   # 0 = solo le homepage passate
        "maxCrawlPages": len(domains) + 5,
        "saveMarkdown": True,
    }
    start = http_request("POST", f"{APIFY_BASE}/acts/{actor}/runs", headers=headers,
                         json=run_input, timeout=30, retries=3).json()["data"]
    run_id, dataset_id, status = start["id"], start["defaultDatasetId"], start["status"]

    waited = 0
    while status in ("READY", "RUNNING"):
        time.sleep(poll_interval)
        waited += poll_interval
        try:
            status = http_request("GET", f"{APIFY_BASE}/actor-runs/{run_id}", headers=headers,
                                  timeout=20, retries=4).json()["data"]["status"]
        except Exception:  # noqa: BLE001 — transient network: keep polling
            pass
        if waited >= max_wait:
            break

    items = _fetch_dataset(dataset_id, headers)
    return distribute_items(domains, items)
