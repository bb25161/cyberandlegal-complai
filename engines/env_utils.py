"""
engines/env_utils.py
Shared environment loader utilities.
Supports Google Secret Manager for Cloud Run.
"""

import os
from pathlib import Path


def load_project_env() -> None:
    try:
        from dotenv import load_dotenv
        load_dotenv()
        load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    except Exception:
        pass


def _read_secret(name: str) -> str:
    """Google Secret Manager'dan oku — Cloud Run'da çalışır."""
    try:
        from google.cloud import secretmanager
        project_id = os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("GCLOUD_PROJECT", "cyberandlegal-lab")
        client = secretmanager.SecretManagerServiceClient()
        secret_name = f"projects/{project_id}/secrets/{name}/versions/latest"
        response = client.access_secret_version(request={"name": secret_name})
        return response.payload.data.decode("UTF-8").strip()
    except Exception:
        return ""


def get_provider_credentials() -> tuple[str, str, str]:
    load_project_env()

    # Önce env'den dene, boşsa Secret Manager'dan al
    def get_val(env_key: str, secret_key: str = None) -> str:
        val = os.environ.get(env_key, "")
        if not val and secret_key:
            val = _read_secret(secret_key)
        return val

    active = get_val("ACTIVE_PROVIDER", "ACTIVE_PROVIDER").lower()

    providers = {
        "openai":      ("openai",      get_val("OPENAI_API_KEY", "OPENAI_API_KEY"),           "gpt-4o-mini"),
        "anthropic":   ("anthropic",   get_val("ANTHROPIC_API_KEY", "ANTHROPIC_API_KEY"),     "claude-haiku-4-5-20251001"),
        "google":      ("google",      get_val("GOOGLE_API_KEY"),                              "gemini-2.0-flash"),
        "huggingface": ("huggingface", get_val("HUGGINGFACE_TOKEN", "HUGGINGFACE_TOKEN"),     "mistralai/Mistral-7B-Instruct-v0.2"),
        "custom":      ("custom",      get_val("CUSTOM_AI_KEY"),                               get_val("CUSTOM_AI_ENDPOINT")),
    }

    if active and active in providers:
        p, k, m = providers[active]
        if k:
            return p, k, m

    for _, (p, k, m) in providers.items():
        if k:
            return p, k, m

    return "openai", "", "gpt-4o-mini"
