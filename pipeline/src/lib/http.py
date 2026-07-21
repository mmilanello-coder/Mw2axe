"""HTTP with retry + exponential backoff.

Every network call in the pipeline (Apify, OpenRouter, MillionVerifier) goes
through here so a transient 429/5xx/timeout is retried instead of losing the
domain. `should_retry` is pure and unit-tested; the sleep uses a bounded
exponential backoff.
"""
from __future__ import annotations

import time

import requests

RETRY_STATUS = {429, 500, 502, 503, 504}


def should_retry(status: int) -> bool:
    return status in RETRY_STATUS


def request(
    method: str,
    url: str,
    *,
    headers: dict | None = None,
    json: dict | None = None,
    params: dict | None = None,
    timeout: int = 60,
    retries: int = 3,
    backoff: float = 1.5,
) -> requests.Response:
    """Return the Response (raises for status on the final attempt). Retries on
    connection errors, timeouts, and retryable status codes."""
    last_exc: Exception | None = None
    for attempt in range(retries + 1):
        try:
            res = requests.request(method, url, headers=headers, json=json, params=params, timeout=timeout)
        except requests.RequestException as e:
            last_exc = e
            if attempt == retries:
                raise
        else:
            if res.status_code < 400 or not should_retry(res.status_code) or attempt == retries:
                res.raise_for_status()
                return res
        time.sleep(backoff * (2 ** attempt))
    # Unreachable, but keeps type-checkers happy.
    raise last_exc if last_exc else RuntimeError("request failed")
