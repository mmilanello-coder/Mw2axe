from lib.classify import (
    api_key_env,
    build_request,
    cost_per_domain_eur,
    parse_json,
)

CACHE = {"text": "Agenzia indipendente a Verona. Open house sabato.",
         "sources": [{"kind": "home", "url": "https://x.it"}]}


def test_build_request_openai_compatible_shape():
    cfg = {"providers": {"classify": {"model": "deepseek-chat"}}}
    body = build_request("x.it", CACHE, cfg)
    assert body["model"] == "deepseek-chat"
    assert body["response_format"] == {"type": "json_object"}
    assert body["temperature"] == 0
    roles = [m["role"] for m in body["messages"]]
    assert roles == ["system", "user"]
    assert "x.it" in body["messages"][1]["content"]


def test_provider_config_is_switchable():
    cfg = {"providers": {"classify": {
        "model": "qwen-plus", "api_key_env": "QWEN_KEY", "cost_per_domain_eur": 0.002}}}
    assert build_request("x.it", CACHE, cfg)["model"] == "qwen-plus"
    assert api_key_env(cfg) == "QWEN_KEY"
    assert cost_per_domain_eur(cfg) == 0.002


def test_defaults_when_unconfigured():
    assert api_key_env({}) == "OPENROUTER_API"
    assert cost_per_domain_eur({}) == 0.0015


def test_parse_json_still_extracts_from_noise():
    assert parse_json('```json\n{"open_house": {"value": "si"}}\n```') == {"open_house": {"value": "si"}}
