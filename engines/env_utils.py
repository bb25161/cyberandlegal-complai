"""
engines/env_utils.py
Shared environment loader utilities.
"""

import os
from pathlib import Path


def load_project_env() -> None:
    """
    Load .env if python-dotenv is available.
    Safe no-op if package is missing.
    """
    try:
        from dotenv import load_dotenv

        load_dotenv()
        load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    except Exception:
        pass


def get_provider_credentials() -> tuple[str, str, str]:
    """
    Auto-detect active provider and credentials.
    Returns: (provider, api_key, model)
    """
    load_project_env()

    active = os.environ.get("ACTIVE_PROVIDER", "").lower()
    providers = {
        "openai": ("openai", os.environ.get("OPENAI_API_KEY", ""), "gpt-4o-mini"),
        "anthropic": ("anthropic", os.environ.get("ANTHROPIC_API_KEY", ""), "claude-haiku-4-5-20251001"),
        "google": ("google", os.environ.get("GOOGLE_API_KEY", ""), "gemini-2.0-flash"),
        "huggingface": ("huggingface", os.environ.get("HUGGINGFACE_TOKEN", ""), "mistralai/Mistral-7B-Instruct-v0.2"),
        "custom": ("custom", os.environ.get("CUSTOM_AI_KEY", ""), os.environ.get("CUSTOM_AI_ENDPOINT", "")),
    }

    if active and active in providers:
        p, k, m = providers[active]
        if k:
            return p, k, m

    for _, (p, k, m) in providers.items():
        if k:
            return p, k, m

    return "openai", "", "gpt-4o-mini"