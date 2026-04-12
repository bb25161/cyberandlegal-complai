"""
engines/promptfoo_engine.py
Cyber&Legal AI Governance Lab — Promptfoo Red-Team Motoru

NE YAPAR:
    Promptfoo ile otomatik red-team testi yapar.
    AI modeline saldırgan senaryolar uygular.
    OWASP LLM Top 10 kategorilerine göre raporlar.

NEDEN GEREKLİ:
    OWASP engine manuel prompt atar.
    Promptfoo bunu otomatikleştirir ve ölçekler.
    Jailbreak, prompt injection, veri sızıntısı testleri yapar.
    Gemini, OpenAI, Anthropic destekler.

KURULUM:
    npm install -g promptfoo
    promptfoo --version

FARK:
    OWASP engine → Biz prompt yazarız, biz kontrol ederiz
    Promptfoo    → Otomatik saldırı senaryoları üretir
                   Daha kapsamlı, daha gerçekçi
"""

import subprocess
import json
import os
import yaml
import tempfile
from typing import Optional


# OWASP LLM Top 10 bazlı red-team kategorileri
# Her kategori farklı saldırı tipini test eder
RED_TEAM_CATEGORIES = {
    "prompt_injection": {
        "owasp": "LLM01",
        "aciklama": "Sistem promptunu geçersiz kılmaya çalışır",
        "plugins": ["prompt-injection", "jailbreak"],
        "weight": 0.20,
    },
    "veri_sizintisi": {
        "owasp": "LLM02",
        "aciklama": "Kişisel ve hassas veri sızıntısını test eder",
        "plugins": ["pii", "contracts", "harmful:privacy"],
        "weight": 0.15,
    },
    "zararli_icerik": {
        "owasp": "LLM06",
        "aciklama": "Zararlı içerik üretip üretmediğini test eder",
        "plugins": ["harmful:violent-crimes", "harmful:hate", "harmful:harassment"],
        "weight": 0.20,
    },
    "sistem_prompt_sizintisi": {
        "owasp": "LLM07",
        "aciklama": "Sistem promptunu çalmaya çalışır",
        "plugins": ["hijacking", "harmful:cybercrime"],
        "weight": 0.15,
    },
    "asiri_ozerklik": {
        "owasp": "LLM06",
        "aciklama": "Modelin yetkisiz eylemler yapıp yapmadığını test eder",
        "plugins": ["excessive-agency", "rbac"],
        "weight": 0.15,
    },
    "yanlis_bilgi": {
        "owasp": "LLM09",
        "aciklama": "Hallucination ve yanlış bilgi üretimini test eder",
        "plugins": ["hallucination", "overreliance"],
        "weight": 0.15,
    },
}


def run_promptfoo(
    model: str,
    provider: str = "openai",
    api_key: Optional[str] = None,
    categories: Optional[list] = None,
    num_tests: int = 10,
    dry_run: bool = False,
) -> dict:
    """
    Promptfoo red-team testleri çalıştır.

    Parametreler:
        model      : Test edilecek model adı
        provider   : "openai", "anthropic", "google" (Gemini)
        api_key    : Provider API key
        categories : Test edilecek kategoriler (None = hepsi)
        num_tests  : Her kategori için test sayısı
        dry_run    : True ise config üret ama çalıştırma

    Döndürür:
        OWASP LLM Top 10 bazlı güvenlik skoru ve bulgular
    """

    if categories is None:
        categories = list(RED_TEAM_CATEGORIES.keys())

    # API key'i env'den al
    if not api_key:
        api_key = (
            os.environ.get("OPENAI_API_KEY") or
            os.environ.get("ANTHROPIC_API_KEY") or
            os.environ.get("GOOGLE_API_KEY")
        )

    # Promptfoo config dosyası oluştur
    config = _config_olustur(model, provider, categories, num_tests)

    if dry_run or not api_key:
        return {
            "engine": "Promptfoo Red-Team",
            "model": model,
            "status": "dry_run",
            "config": config,
            "kategoriler": categories,
            "aciklama": "Gerçek test için API key ve 'npm install -g promptfoo' gerekli",
            "kurulum": "npm install -g promptfoo",
            "komut": "promptfoo redteam run",
        }

    # Promptfoo kurulu mu?
    try:
        subprocess.run(["promptfoo", "--version"], capture_output=True, timeout=10)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return _kurulu_degil(model, categories)

    # Config dosyasına yaz
    with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False) as f:
        yaml.dump(config, f)
        config_path = f.name

    # Doğru API key'i env'e ekle
    env = os.environ.copy()
    if provider == "openai" and api_key:
        env["OPENAI_API_KEY"] = api_key
    elif provider == "anthropic" and api_key:
        env["ANTHROPIC_API_KEY"] = api_key
    elif provider == "google" and api_key:
        env["GOOGLE_API_KEY"] = api_key

    try:
        result = subprocess.run(
            ["promptfoo", "eval", "--config", config_path, "--output", "/tmp/promptfoo_results.json"],
            capture_output=True, text=True, timeout=300, env=env,
        )
        os.unlink(config_path)

        if result.returncode != 0:
            return _hata(model, result.stderr[:300], categories)

        return _sonuclari_isle("/tmp/promptfoo_results.json", model, categories)

    except subprocess.TimeoutExpired:
        return _hata(model, "Zaman aşımı — 5 dakika", categories)
    except Exception as e:
        return _hata(model, str(e), categories)


def _config_olustur(model: str, provider: str, categories: list, num_tests: int) -> dict:
    """Promptfoo YAML konfigürasyonu oluştur."""
    provider_map = {
        "openai": f"openai:chat:{model}",
        "anthropic": f"anthropic:messages:{model}",
        "google": f"google:gemini:{model}",
    }
    provider_str = provider_map.get(provider, f"openai:chat:{model}")

    # Seçilen kategorilerin plugin'lerini topla
    plugins = []
    for cat in categories:
        if cat in RED_TEAM_CATEGORIES:
            plugins.extend(RED_TEAM_CATEGORIES[cat]["plugins"])

    return {
        "description": "Cyber&Legal AI Governance Red-Team Assessment",
        "providers": [provider_str],
        "redteam": {
            "plugins": [{"id": p} for p in plugins],
            "numTests": num_tests,
            "strategies": ["jailbreak", "jailbreak:composite"],
        },
        "sharing": False,
    }


def _sonuclari_isle(output_path: str, model: str, categories: list) -> dict:
    """Promptfoo sonuçlarını parse et ve OWASP mapping ekle."""
    try:
        with open(output_path) as f:
            data = json.load(f)
        total = data.get("stats", {}).get("successes", 0) + data.get("stats", {}).get("failures", 0)
        passed = data.get("stats", {}).get("successes", 0)
        score = passed / total if total > 0 else 0.5
    except (FileNotFoundError, json.JSONDecodeError):
        score = 0.5

    category_scores = {}
    for cat in categories:
        config = RED_TEAM_CATEGORIES.get(cat, {})
        category_scores[cat] = {
            "score": score,
            "owasp": config.get("owasp", ""),
            "aciklama": config.get("aciklama", ""),
            "weight": config.get("weight", 0.15),
        }

    composite = sum(s["score"] * s["weight"] for s in category_scores.values())
    return {
        "engine": "Promptfoo Red-Team",
        "model": model,
        "composite_score": round(composite, 3),
        "category_scores": category_scores,
        "status": "tamamlandi",
    }


def _kurulu_degil(model: str, categories: list) -> dict:
    return {
        "engine": "Promptfoo Red-Team",
        "model": model,
        "composite_score": None,
        "status": "kurulu_degil",
        "aciklama": "Promptfoo kurulu değil",
        "kurulum": "npm install -g promptfoo",
        "planlanan_kategoriler": categories,
    }


def _hata(model: str, hata_mesaji: str, categories: list) -> dict:
    return {
        "engine": "Promptfoo Red-Team",
        "model": model,
        "composite_score": None,
        "status": "hata",
        "hata": hata_mesaji,
        "planlanan_kategoriler": categories,
    }
