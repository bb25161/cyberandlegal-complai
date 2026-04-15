"""
engines/lm_eval_engine.py
Cyber&Legal AI Governance Lab — LM Evaluation Harness Motoru
"""

import glob
import json
import os
import shutil
import subprocess
import tempfile
from typing import Optional


CHAT_SAFE_TASKS = {
    "truthfulqa_gen",
}

LOGLIKELIHOOD_TASKS = {
    "hellaswag",
    "arc_easy",
    "arc_challenge",
    "mmlu",
    "winogrande",
    "piqa",
    "truthfulqa_mc1",
}

BENCHMARK_SETS = {
    "quick": {
        "tasks_chat_safe": ["truthfulqa_gen"],
        "tasks_full_capability": ["truthfulqa_gen", "hellaswag"],
        "aciklama": "Hızlı test — 2 benchmark, ~5 dakika",
        "samples": 100,
        "eu_ai_act": "Art. 13 — Şeffaflık ve Doğruluk",
    },
    "standard": {
        "tasks_chat_safe": ["truthfulqa_gen"],
        "tasks_full_capability": ["truthfulqa_gen", "hellaswag", "arc_easy", "mmlu"],
        "aciklama": "Standart değerlendirme — 4 benchmark, ~20 dakika",
        "samples": 200,
        "eu_ai_act": "Art. 13 + Art. 15 — Şeffaflık ve Doğruluk",
    },
    "full": {
        "tasks_chat_safe": ["truthfulqa_gen"],
        "tasks_full_capability": [
            "truthfulqa_gen",
            "hellaswag",
            "arc_easy",
            "arc_challenge",
            "mmlu",
            "winogrande",
            "piqa",
        ],
        "aciklama": "Tam değerlendirme — 7 benchmark, ~60 dakika",
        "samples": 500,
        "eu_ai_act": "Art. 13 + Art. 15 — Kapsamlı Değerlendirme",
    },
}

BENCHMARK_MAPPING = {
    "truthfulqa_gen": {
        "olcer": "Doğruluk ve hallucination direnci",
        "eu_ai_act": "Art. 13",
        "nist": "MEASURE-2.3",
        "owasp": "LLM09",
    },
    "hellaswag": {
        "olcer": "Genel dil anlama",
        "eu_ai_act": "Art. 15",
        "nist": "MEASURE-2.2",
        "owasp": "—",
    },
    "arc_easy": {
        "olcer": "Temel bilgi ve akıl yürütme",
        "eu_ai_act": "Art. 15",
        "nist": "MEASURE-2.2",
        "owasp": "—",
    },
    "arc_challenge": {
        "olcer": "İleri düzey akıl yürütme",
        "eu_ai_act": "Art. 15",
        "nist": "MEASURE-2.3",
        "owasp": "—",
    },
    "mmlu": {
        "olcer": "57 alanda bilgi kapsamı",
        "eu_ai_act": "Art. 15",
        "nist": "MEASURE-2.2",
        "owasp": "LLM09",
    },
    "winogrande": {
        "olcer": "Ortak bilgi ve bağlam",
        "eu_ai_act": "Art. 13",
        "nist": "MEASURE-2.2",
        "owasp": "—",
    },
    "piqa": {
        "olcer": "Fiziksel sezgi ve pratik akıl",
        "eu_ai_act": "Art. 15",
        "nist": "MEASURE-2.2",
        "owasp": "—",
    },
}


def _resolve_lm_eval_executable() -> Optional[str]:
    preferred = "/home/codespace/.python/current/bin/lm_eval"
    if os.path.exists(preferred):
        return preferred

    discovered = shutil.which("lm_eval")
    if discovered:
        return discovered

    return None


def _select_tasks(config: dict, model_type: str) -> list:
    if model_type == "openai":
        return config.get("tasks_chat_safe", ["truthfulqa_gen"])
    return config.get("tasks_full_capability", config.get("tasks_chat_safe", []))


def _build_model_args(model: str, model_type: str, hf_token: Optional[str]) -> str:
    if model_type == "openai":
        return f"model={model}"

    if hf_token:
        return f"pretrained={model},use_auth_token={hf_token}"

    return f"pretrained={model}"


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
    """

    config = BENCHMARK_SETS.get(benchmark_set, BENCHMARK_SETS["quick"])
    selected_tasks = _select_tasks(config, model_type)

    if not api_key:
        api_key = os.environ.get("OPENAI_API_KEY")

    hf_token = os.environ.get("HUGGINGFACE_TOKEN") or os.environ.get("HF_TOKEN")

    lm_eval_bin = _resolve_lm_eval_executable()

    if dry_run:
        model_backend = "openai-chat-completions" if model_type == "openai" else model_type
        return {
            "engine": "LM Evaluation Harness (EleutherAI)",
            "model": model,
            "status": "dry_run",
            "benchmark_seti": config["aciklama"],
            "benchmarklar": selected_tasks,
            "benchmark_mapping": {t: BENCHMARK_MAPPING.get(t, {}) for t in selected_tasks},
            "kurulum": "pip install lm-eval",
            "komut": (
                f"{lm_eval_bin or 'lm_eval'} --model {model_backend} "
                f"--tasks {','.join(selected_tasks)} --limit {config['samples']}"
            ),
        }

    if not lm_eval_bin:
        return _kurulu_degil(model, config, selected_tasks)

    model_backend = "openai-chat-completions" if model_type == "openai" else model_type

    cmd = [
        lm_eval_bin,
        "--model",
        model_backend,
        "--model_args",
        _build_model_args(model, model_type, hf_token),
        "--tasks",
        ",".join(selected_tasks),
        "--num_fewshot",
        "0",
        "--limit",
        str(config["samples"]),
    ]

    if model_type == "hf":
        cmd.extend(["--device", device])

    output_dir = tempfile.mkdtemp(prefix="lm_eval_")
    cmd.extend(["--output_path", output_dir])

    if model_type == "openai":
        cmd.append("--apply_chat_template")

    env = os.environ.copy()
    if api_key and model_type == "openai":
        env["OPENAI_API_KEY"] = api_key

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,
            env=env,
        )

        if result.returncode != 0:
            stderr_text = (result.stderr or "").strip()
            stderr_preview = stderr_text[:1500]

            if "NotImplementedError" in stderr_text and "loglikelihood" in stderr_text:
                return _hata(
                    model,
                    (
                        "Secilen benchmark seti loglikelihood gerektiren task iceriyor; "
                        "OpenAI chat completions backend bunu desteklemiyor. "
                        "Chat-safe task set kullanilmali."
                    ),
                    config,
                    selected_tasks,
                )

            return _hata(
                model,
                stderr_preview or "LM Eval process failed",
                config,
                selected_tasks,
            )

        output_files = glob.glob(f"{output_dir}/**/*.json", recursive=True)
        if not output_files:
            return _hata(
                model,
                "Sonuc dosyasi olusturulamadi",
                config,
                selected_tasks,
            )

        return _sonuclari_isle(output_dir, model, config, selected_tasks)

    except subprocess.TimeoutExpired:
        return _hata(model, "Zaman asimi -- 10 dakika", config, selected_tasks)
    except Exception as e:
        return _hata(model, str(e), config, selected_tasks)


def _sonuclari_isle(output_dir: str, model: str, config: dict, selected_tasks: list) -> dict:
    """
    LM eval JSON çıktısını parse et.
    """

    json_files = glob.glob(f"{output_dir}/**/*.json", recursive=True)
    if not json_files:
        json_files = glob.glob(f"{output_dir}/*.json")

    if not json_files:
        return _hata(model, f"Sonuç dosyası bulunamadı: {output_dir}", config, selected_tasks)

    latest = max(json_files, key=os.path.getmtime)

    try:
        with open(latest, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return _hata(model, f"JSON parse hatası: {e}", config, selected_tasks)

    raw_results = data.get("results", {})
    task_scores = {}

    for task in selected_tasks:
        task_data = raw_results.get(task, {})
        if not task_data:
            for key in raw_results:
                if task in key:
                    task_data = raw_results[key]
                    break

        mapping = BENCHMARK_MAPPING.get(task, {})
        score = None
        score_metric = "unknown"

        for metric_key in [
            "rouge1_acc,none",
            "acc_norm,none",
            "acc,none",
            "acc_norm,strict-match,none",
            "exact_match,strict-match,none",
            "rouge1_acc",
            "acc_norm",
            "acc",
        ]:
            val = task_data.get(metric_key)
            if val is not None and isinstance(val, (float, int)):
                score = float(val)
                score_metric = metric_key
                break

        if score is None:
            score = 0.5
            score_metric = "fallback"

        task_scores[task] = {
            "score": round(score, 4),
            "metric_used": score_metric,
            "olcer": mapping.get("olcer", ""),
            "eu_ai_act": mapping.get("eu_ai_act", ""),
            "nist": mapping.get("nist", ""),
            "owasp": mapping.get("owasp", ""),
            "status": "tamamlandi" if score_metric != "fallback" else "fallback",
        }

    valid_scores = [t["score"] for t in task_scores.values() if t["status"] == "tamamlandi"]
    composite = round(sum(valid_scores) / len(valid_scores), 3) if valid_scores else 0.5

    return {
        "engine": "LM Evaluation Harness (EleutherAI)",
        "model": model,
        "benchmark_seti": config["aciklama"],
        "benchmarklar": selected_tasks,
        "composite_score": composite,
        "task_scores": task_scores,
        "sonuc_dosyasi": latest,
        "status": "tamamlandi",
    }


def _kurulu_degil(model: str, config: dict, selected_tasks: list) -> dict:
    return {
        "engine": "LM Evaluation Harness (EleutherAI)",
        "model": model,
        "composite_score": None,
        "status": "kurulu_degil",
        "aciklama": "lm-eval sisteme kurulu değil",
        "kurulum": "pip install lm-eval",
        "benchmark_seti": config["aciklama"],
        "planlanan_benchmarklar": selected_tasks,
    }


def _hata(model: str, hata_mesaji: str, config: dict, selected_tasks: list) -> dict:
    return {
        "engine": "LM Evaluation Harness (EleutherAI)",
        "model": model,
        "composite_score": None,
        "status": "hata",
        "hata": hata_mesaji,
        "benchmark_seti": config.get("aciklama"),
        "planlanan_benchmarklar": selected_tasks,
    }
