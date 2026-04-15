"""
engines/lm_eval_engine.py
Cyber&Legal AI Governance Lab — LM Evaluation Harness Motoru

NE YAPAR:
    EleutherAI'ın lm-evaluation-harness framework'ünü çalıştırır.
    60+ akademik benchmark ile modeli test eder.
    HuggingFace token ile açık modelleri ücretsiz test eder.

NEDEN GEREKLİ:
    COMPL-AI EU AI Act'e odaklanır.
    LM Eval akademik standartları ölçer.
    İkisi birlikte modelin genel kalitesini kanıtlar.

BENCHMARK ANLAMI:
    truthfulqa  → Model ne kadar doğru cevap veriyor? (hallucination riski)
    hellaswag   → Genel dil anlama ve akıl yürütme
    arc_easy    → Temel soru cevaplama
    mmlu        → Çok alanlı bilgi kapsamı (57 farklı alan)
    winogrande  → Ortak bilgi ve bağlam anlama

API KEY DURUMU:
    HuggingFace modeller → HF_TOKEN ile (ücretsiz)
    OpenAI modeller      → OPENAI_API_KEY ile
    Anthropic modeller   → ANTHROPIC_API_KEY ile
"""

import subprocess
import os
from typing import Optional


# Cyber&Legal için seçilmiş benchmark setleri
# Her set farklı derinlikte test yapar
BENCHMARK_SETS = {
    "quick": {
        "tasks": ["truthfulqa_gen", "hellaswag"],
        "aciklama": "Hızlı test — 2 benchmark, ~5 dakika",
        "samples": 100,
        "eu_ai_act": "Art. 13 — Şeffaflık ve Doğruluk",
    },
    "standard": {
        "tasks": ["truthfulqa_gen", "hellaswag", "arc_easy", "mmlu"],
        "aciklama": "Standart değerlendirme — 4 benchmark, ~20 dakika",
        "samples": 200,
        "eu_ai_act": "Art. 13 + Art. 15 — Şeffaflık ve Doğruluk",
    },
    "full": {
        "tasks": ["truthfulqa_gen", "hellaswag", "arc_easy", "arc_challenge", "mmlu", "winogrande", "piqa"],
        "aciklama": "Tam değerlendirme — 7 benchmark, ~60 dakika",
        "samples": 500,
        "eu_ai_act": "Art. 13 + Art. 15 — Kapsamlı Değerlendirme",
    },
}

# Her benchmark'ın hangi EU AI Act maddesine karşılık geldiği
BENCHMARK_MAPPING = {
    "truthfulqa_gen": {"olcer": "Doğruluk ve hallucination direnci", "eu_ai_act": "Art. 13", "nist": "MEASURE-2.3", "owasp": "LLM09"},
    "hellaswag": {"olcer": "Genel dil anlama", "eu_ai_act": "Art. 15", "nist": "MEASURE-2.2", "owasp": "—"},
    "arc_easy": {"olcer": "Temel bilgi ve akıl yürütme", "eu_ai_act": "Art. 15", "nist": "MEASURE-2.2", "owasp": "—"},
    "arc_challenge": {"olcer": "İleri düzey akıl yürütme", "eu_ai_act": "Art. 15", "nist": "MEASURE-2.3", "owasp": "—"},
    "mmlu": {"olcer": "57 alanda bilgi kapsamı", "eu_ai_act": "Art. 15", "nist": "MEASURE-2.2", "owasp": "LLM09"},
    "winogrande": {"olcer": "Ortak bilgi ve bağlam", "eu_ai_act": "Art. 13", "nist": "MEASURE-2.2", "owasp": "—"},
    "piqa": {"olcer": "Fiziksel sezgi ve pratik akıl", "eu_ai_act": "Art. 15", "nist": "MEASURE-2.2", "owasp": "—"},
}


def run_lm_eval(
    model: str,
    benchmark_set: str = "quick",
    model_type: str = "hf",
    api_key: Optional[str] = None,
    device: str = "cpu",
    dry_run: bool = False,
) -> dict:
    """
    LM Evaluation Harness çalıştır.

    Parametreler:
        model         : HuggingFace model ID veya openai model adı
                        Örn: "EleutherAI/gpt-neo-125m" veya "gpt-4o-mini"
        benchmark_set : "quick", "standard", "full"
        model_type    : "hf" (HuggingFace) veya "openai"
        api_key       : OpenAI API key (sadece openai model_type için)
        device        : "cpu" veya "cuda" (GPU varsa)
        dry_run       : True ise komutları göster, çalıştırma

    Döndürür:
        Seçilen benchmark'lar için doğruluk skorları
        + EU AI Act madde eşleştirmesi
    """

    config = BENCHMARK_SETS.get(benchmark_set, BENCHMARK_SETS["quick"])

    # API key'i env'den al
    if not api_key:
        api_key = os.environ.get("OPENAI_API_KEY")

    # HuggingFace token'ı env'den al
    hf_token = os.environ.get("HUGGINGFACE_TOKEN") or os.environ.get("HF_TOKEN")

    if dry_run:
        return {
            "engine": "LM Evaluation Harness (EleutherAI)",
            "model": model,
            "status": "dry_run",
            "benchmark_seti": config["aciklama"],
            "benchmarklar": config["tasks"],
            "benchmark_mapping": {t: BENCHMARK_MAPPING.get(t, {}) for t in config["tasks"]},
            "kurulum": "pip install lm-eval",
            "komut": f"lm_eval --model {model_type} --tasks {','.join(config['tasks'])} --limit {config['samples']}",
        }

    # lm-eval kurulu mu kontrol et
    # Codespace'de PATH'te olmayabilir -- tam path ile kontrol et
    LM_EVAL_PATH = "/home/codespace/.python/current/bin/lm_eval"
    if not os.path.exists(LM_EVAL_PATH):
        try:
            subprocess.run(["lm_eval", "--help"], capture_output=True, timeout=10)
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return _kurulu_degil(model, config)

    # Komut oluştur
    tasks_str = ",".join(config["tasks"])
    cmd = [
        "/home/codespace/.python/current/bin/lm_eval",
        "--model", "openai-chat-completions" if model_type == "openai" else model_type,
        "--model_args", f"model={model}" if model_type == "openai" else f"pretrained={model}",
        "--tasks", tasks_str,
        "--num_fewshot", "0",
        "--limit", str(config['samples']),
    ]

    if model_type == "hf":
        cmd.extend(["--device", device])
        if hf_token:
            cmd.extend(["--model_args", f"pretrained={model},use_auth_token={hf_token}"])

    # Output dizini -- model adina gore alt klasor olusturulur
    import tempfile as _tempfile
    output_dir = _tempfile.mkdtemp(prefix="lm_eval_")

    # Komutu output_path ile tamamla
    cmd.extend(["--output_path", output_dir])

    # Chat completion modeli icin apply_chat_template zorunlu
    if model_type == "openai":
        cmd.append("--apply_chat_template")


    env = os.environ.copy()
    if api_key and model_type == "openai":
        env["OPENAI_API_KEY"] = api_key

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600, env=env)

        # LM eval INFO/WARNING mesajlarini stderr ye yazar
        # Bu normal davranistir -- returncode 0 olsa bile stderr dolu olabilir
        # Gercek hata: returncode != 0 VE output_dir bos
        import glob as _glob
        output_files = _glob.glob(f"{output_dir}/**/*.json", recursive=True)

        if result.returncode != 0 and not output_files:
            # Gercekten hata var -- ne output ne basari
            return _hata(model, result.stderr[:300], config)

        if not output_files:
            # Returncode 0 ama dosya yok -- beklenmedik durum
            return _hata(model, "Sonuc dosyasi olusturulamadi", config)

        # Sonuç dosyasını bul ve parse et
        # LM eval output_path altında model adına göre klasör oluşturur
        return _sonuclari_isle(output_dir, model, config)

    except subprocess.TimeoutExpired:
        return _hata(model, "Zaman asimi -- 10 dakika", config)
    except Exception as e:
        return _hata(model, str(e), config)


def _sonuclari_isle(output_dir: str, model: str, config: dict) -> dict:
    """
    LM eval JSON çıktısını parse et.

    LM eval sonuçları şu yapıda gelir:
        results[task_name][metric_name] = float

    Bizim için en önemli metrikler:
        rouge1_acc  → kelime örtüşmesi bazında doğruluk (ana metrik)
        bleu_acc    → n-gram sırası bazında doğruluk
        acc         → multiple choice doğruluk (mc tasklar için)
        acc_norm    → normalize edilmiş doğruluk

    Composite skor:
        rouge1_acc varsa onu kullan (generative tasklar)
        acc varsa onu kullan (multiple choice tasklar)
        Hiçbiri yoksa 0.5 (belirsiz)

    Sektör bazlı ağırlıklandırma scoring.py içinde yapılır.
    Bu fonksiyon sadece ham skorları döndürür.
    """
    import glob, json as _json

    # Output dizininde en son JSON dosyasını bul
    # LM eval model adına göre alt klasör oluşturur
    json_files = glob.glob(f"{output_dir}/**/*.json", recursive=True)
    if not json_files:
        json_files = glob.glob(f"{output_dir}/*.json")

    if not json_files:
        return _hata(model, f"Sonuç dosyası bulunamadı: {output_dir}", config)

    # En son dosyayı al
    latest = max(json_files, key=lambda f: f)

    try:
        with open(latest) as f:
            data = _json.load(f)
    except Exception as e:
        return _hata(model, f"JSON parse hatası: {e}", config)

    raw_results = data.get("results", {})
    task_scores = {}

    for task in config["tasks"]:
        # Task sonuçlarını bul — lm eval bazen task adını değiştirir
        task_data = raw_results.get(task, {})
        if not task_data:
            # Kısmi eşleşme dene
            for key in raw_results:
                if task in key:
                    task_data = raw_results[key]
                    break

        mapping = BENCHMARK_MAPPING.get(task, {})

        # En iyi skoru seç — öncelik sırası:
        # 1. rouge1_acc (generative tasks — TruthfulQA gen)
        # 2. acc_norm (normalized accuracy)
        # 3. acc (raw accuracy)
        # 4. 0.5 (belirsiz — ne iyi ne kötü)
        score = None
        score_metric = "unknown"

        for metric_key in ["rouge1_acc,none", "acc_norm,none", "acc,none", "acc_norm,strict-match,none", "exact_match,strict-match,none", "rouge1_acc", "acc_norm", "acc"]:
            val = task_data.get(metric_key)
            if val is not None and isinstance(val, float):
                score = val
                score_metric = metric_key
                break

        if score is None:
            score = 0.5
            score_metric = "fallback"

        task_scores[task] = {
            "score":       round(score, 4),
            "metric_used": score_metric,
            "olcer":       mapping.get("olcer", ""),
            "eu_ai_act":   mapping.get("eu_ai_act", ""),
            "nist":        mapping.get("nist", ""),
            "owasp":       mapping.get("owasp", ""),
            "status":      "tamamlandi" if score != 0.5 else "fallback",
        }

    # Composite skor — basit ortalama
    # Ağırlıklandırma scoring.py sektör fonksiyonunda yapılır
    valid_scores = [t["score"] for t in task_scores.values() if t["status"] == "tamamlandi"]
    composite = round(sum(valid_scores) / len(valid_scores), 3) if valid_scores else 0.5

    return {
        "engine":         "LM Evaluation Harness (EleutherAI)",
        "model":          model,
        "benchmark_seti": config["aciklama"],
        "composite_score": composite,
        "task_scores":    task_scores,
        "sonuc_dosyasi":  latest,
        "status":         "tamamlandi",
    }


def _kurulu_degil(model: str, config: dict) -> dict:
    return {
        "engine": "LM Evaluation Harness (EleutherAI)",
        "model": model,
        "composite_score": None,
        "status": "kurulu_degil",
        "aciklama": "lm-eval sisteme kurulu değil",
        "kurulum": "pip install lm-eval",
        "planlanan_benchmarklar": config["tasks"],
    }


def _hata(model: str, hata_mesaji: str, config: dict) -> dict:
    return {
        "engine": "LM Evaluation Harness (EleutherAI)",
        "model": model,
        "composite_score": None,
        "status": "hata",
        "hata": hata_mesaji,
        "planlanan_benchmarklar": config["tasks"],
    }
