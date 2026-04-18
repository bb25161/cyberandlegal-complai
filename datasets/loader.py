"""
datasets/loader.py
Shared dataset loading utilities for Cyber&Legal AI Governance Lab.
"""

import json
from pathlib import Path
from typing import Optional, Dict, Any


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _load_json_file(filename: str) -> Optional[Dict[str, Any]]:
    candidates = [
        _repo_root() / filename,
        Path.cwd() / filename,
    ]

    for path in candidates:
        try:
            if path.exists():
                with open(path, encoding="utf-8") as f:
                    return json.load(f)
        except Exception:
            continue
    return None


def load_owasp_dataset() -> Optional[Dict[str, Any]]:
    return _load_json_file("owasp_top10_2025.json")


def load_iso42001_dataset() -> Optional[Dict[str, Any]]:
    return _load_json_file("iso42001_controls.json")


def load_nist_dataset() -> Optional[Dict[str, Any]]:
    return _load_json_file("nist_rmf_controls.json")


def load_enisa_dataset() -> Optional[Dict[str, Any]]:
    return _load_json_file("enisa_threats.json")


def load_eu_ai_act_dataset() -> Optional[Dict[str, Any]]:
    return _load_json_file("eu_ai_act_principles.json")