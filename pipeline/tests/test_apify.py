from lib.providers.apify import distribute_items


def test_distribute_items_maps_by_host():
    items = [
        {"url": "https://www.auroracase.com/", "text": "Agenzia Aurora Case"},
        {"url": "https://auroracase.com/annunci", "text": "3 immobili in vendita"},
        {"url": "https://arcimmobiliare.com/chi-siamo", "markdown": "Agenzia indipendente"},
    ]
    out = distribute_items(["auroracase.com", "arcimmobiliare.com", "assente.it"], items)
    # multiple pages of one host are concatenated
    assert "Aurora Case" in out["auroracase.com"]["text"]
    assert "3 immobili" in out["auroracase.com"]["text"]
    assert out["arcimmobiliare.com"]["text"] == "Agenzia indipendente"
    # a requested domain the crawler never returned → error frag (retried next run)
    assert out["assente.it"]["errors"] == ["no content"]
    assert out["assente.it"]["text"] == ""
