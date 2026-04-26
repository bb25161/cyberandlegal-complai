const PROVIDER_MAP = {
  prov_openai: "openai",
  prov_anthropic: "anthropic",
  prov_google: "google",
  prov_huggingface: "huggingface",
  prov_custom: "custom",
};

export function buildPayload(form) {
  const providerMapped = PROVIDER_MAP[form.model_provider];

  if (!providerMapped) {
    throw new Error("Unsupported model provider");
  }

  return {
    use_case: form.use_case,
    risk_factors: form.risk_factors,
    controls: form.controls,
    model_provider: providerMapped,
    model_name: form.model_name || null,
    api_key: form.api_key || null,
  };
}

export async function submitAssessment(form) {
  const providerMapped = PROVIDER_MAP[form.model_provider];

  const backendHasKey = ["openai", "anthropic"].includes(providerMapped);

  const endpoint = backendHasKey
    ? "/assess/risk/full"
    : "/assess/risk";

  const payload = buildPayload(form);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}
