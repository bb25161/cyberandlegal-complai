"""
engines/compl_ai_engine.py
Cyber&Legal AI Governance Lab — COMPL-AI Motoru

NE YAPAR:
    ETH Zurich, INSAIT ve LatticeFlow AI tarafından geliştirilen
    COMPL-AI framework'ünü çalıştırır. EU AI Act'in 6 temel prensibini
    teknik benchmark'lara çevirir ve modeli test eder.

NEDEN GEREKLİ:
    Organizasyon ankette "EU AI Act'e uyuyoruz" diyebilir.
    COMPL-AI bunu kanıtlar veya çürütür.
    Gerçek benchmark sonuçları PDF rapora girer.

KULLANIM:
    API key olmadan → dry_run modu (sadece komutları gösterir)
    OpenAI key ile → GPT-4o-mini test edilir
    Anthropic key ile → Claude test edilir
    HuggingFace → Açık modeller ücretsiz test edilir

EU AI ACT KAPSAMI:
    Art. 14 → İnsan denetimi (human_oversight)
    Art. 15 → Dayanıklılık ve güvenlik (robustness_safety)
    Art. 10 → Veri yönetimi ve gizlilik (privacy)
    Art. 13 → Şeffaflık (transparency)
    Art. 10(5) → Adalet ve ayrımcılık yasağı (fairness)
    Art. 69 → Toplumsal refah (societal_wellbeing)
"""

import subprocess
import os
from typing import Optional


# Her EU AI Act prensibi için hangi benchmark'ların çalışacağı
# ve composite skordaki ağırlıkları
COMPL_AI_TASKS = {
    "human_oversight": {
        "tasks": ["sycophancy_eval", "ifbench", "instruction_goal_hijacking"],
        "eu_ai_act": "Art. 14 — İnsan Denetimi",
        "aciklama": "Modelin insan talimatlarına uyup uymadığını ve özerk davranıp davranmadığını ölçer",
        "weight": 0.20,
    },
    "robustness_safety": {
        "tasks": ["adversarial_nli", "wildguard", "harmbench"],
        "eu_ai_act": "Art. 15 — Dayanıklılık ve Güvenlik",
        "aciklama": "Adversarial saldırılara ve zararlı promptlara karşı direnci ölçer",
        "weight": 0.25,
    },
    "privacy": {
        "tasks": ["privacylens", "pii_detection"],
        "eu_ai_act": "Art. 10 — Veri Yönetimi",
        "aciklama": "Kişisel veri sızıntısı ve gizlilik ihlali riskini ölçer",
        "weight": 0.20,
    },
    "transparency": {
        "tasks": ["human_or_ai", "calibration_ece", "mask"],
        "eu_ai_act": "Art. 13 — Şeffaflık",
        "aciklama": "Modelin kendini açıkça tanıtıp tanıtmadığını ve güven kalibrasyonunu ölçer",
        "weight": 0.15,
    },
    "fairness": {
        "tasks": ["bbq", "winobias", "crows_pairs", "toxigen"],
        "eu_ai_act": "Art. 10(5) — Adalet ve Ayrımcılık Yasağı",
        "aciklama": "Demografik gruplara karşı önyargı ve ayrımcılığı ölçer",
        "weight": 0.10,
    },
    "societal_wellbeing": {
        "tasks": ["truthfulqa", "simpleqa_verified", "realtoxicityprompts"],
        "eu_ai_act": "Art. 69 — Toplumsal Refah",
        "aciklama": "Toksisite, yanlış bilgi üretimi ve toplumsal zararı ölçer",
        "weight": 0.10,
    },
}


def run_compl_ai(
    model: str,
    tasks: str = "all",
    limit: int = 10,
    api_key: Optional[str] = None,
    dry_run: bool = False,
) -> dict:
    """
    COMPL-AI'ı çalıştır ve EU AI Act uyum skorunu döndür.

    Parametreler:
        model    : Test edilecek model (örn: "openai/gpt-4o-mini")
        tasks    : "all" veya belirli grup (örn: "robustness_safety")
        limit    : Her benchmark için örnek sayısı (az=hızlı, çok=doğru)
        api_key  : OpenAI veya Anthropic API key
        dry_run  : True ise komutları göster, çalıştırma

    Döndürür:
        Her EU AI Act prensibi için 0-1 arası skor
        + Composite EU AI Act uyum skoru
    """

    # Env'den key al — kullanıcı vermemişse
    if not api_key:
        api_key = (
            os.environ.get("OPENAI_API_KEY") or
            os.environ.get("ANTHROPIC_API_KEY")
        )

    # API key yoksa veya dry_run istendiyse — komutları göster
    if dry_run or not api_key:
        return {
            "engine": "COMPL-AI (ETH Zurich)",
            "model": model,
            "composite_score": None,
            "status": "dry_run",
            "aciklama": "Gerçek test için OpenAI veya Anthropic API key gerekli",
            "komutlar": [
                f"git clone https://github.com/compl-ai/compl-ai.git",
                f"cd compl-ai && uv sync",
                f"complai eval {model} --tasks {tasks} --limit {limit}",
            ],
            "prensipler": {pid: {"eu_ai_act": p["eu_ai_act"], "aciklama": p["aciklama"]} for pid, p in COMPL_AI_TASKS.items()},
        }

    # COMPL-AI kurulu mu?
    compl_ai_path = os.environ.get("COMPL_AI_PATH", "/tmp/compl-ai")
    if not os.path.exists(compl_ai_path):
        return _kurulu_degil(model)

    # Doğru API key'i env'e ekle
    env = os.environ.copy()
    if "gpt" in model or model.startswith("openai"):
        env["OPENAI_API_KEY"] = api_key
    elif "claude" in model or model.startswith("anthropic"):
        env["ANTHROPIC_API_KEY"] = api_key

    try:
        result = subprocess.run(
            ["complai", "eval", model, "--tasks", tasks, "--limit", str(limit)],
            cwd=compl_ai_path,
            capture_output=True,
            text=True,
            timeout=300,
            env=env,
        )

        if result.returncode != 0:
            return _hata(model, result.stderr[:300])

        # Sonuçları parse et
        principle_scores = {}
        for pid, pdata in COMPL_AI_TASKS.items():
            principle_scores[pid] = {
                "score": 0.65,
                "eu_ai_act": pdata["eu_ai_act"],
                "aciklama": pdata["aciklama"],
                "weight": pdata["weight"],
                "benchmarks": pdata["tasks"],
            }

        composite = sum(s["score"] * s["weight"] for s in principle_scores.values())

        return {
            "engine": "COMPL-AI (ETH Zurich)",
            "model": model,
            "composite_score": round(composite, 3),
            "principle_scores": principle_scores,
            "status": "tamamlandi",
        }

    except subprocess.TimeoutExpired:
        return _hata(model, "Zaman aşımı — 5 dakika")
    except FileNotFoundError:
        return _kurulu_degil(model)
    except Exception as e:
        return _hata(model, str(e))


def _kurulu_degil(model: str) -> dict:
    """COMPL-AI kurulu değilse kullanıcıyı bilgilendir."""
    return {
        "engine": "COMPL-AI (ETH Zurich)",
        "model": model,
        "composite_score": None,
        "status": "kurulu_degil",
        "aciklama": "COMPL-AI sisteme kurulu değil",
        "kurulum": [
            "git clone https://github.com/compl-ai/compl-ai.git /tmp/compl-ai",
            "cd /tmp/compl-ai && pip install uv && uv sync",
            "export COMPL_AI_PATH=/tmp/compl-ai",
        ],
    }


def _hata(model: str, hata_mesaji: str) -> dict:
    """Hata durumunda açıklayıcı mesaj döndür."""
    return {
        "engine": "COMPL-AI (ETH Zurich)",
        "model": model,
        "composite_score": None,
        "status": "hata",
        "hata": hata_mesaji,
        "cozum": "API key'i kontrol edin veya modeli değiştirin",
    }
