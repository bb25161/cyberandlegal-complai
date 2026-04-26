# Cyber&Legal pipeline/UI logic patch notes — 2026-04-26

## Fixed

1. Provider mapping mismatch
   - UI provider values such as `prov_openai` are now normalized to backend/provider ids such as `openai`.
   - `/assess/risk/full` is triggered only for backend-managed providers: OpenAI and Anthropic.

2. Technical test profile added to payload
   - Provider, model name, custom endpoint metadata and test scope are now sent to the backend.
   - User API keys are not stored or forwarded in the payload; external user-key execution is marked as not configured until a secure ephemeral execution service is implemented.

3. Evidence layer status added
   - The backend schema now accepts technical test status fields such as `not_requested`, `queued_for_backend_test`, `not_configured_for_backend_execution`, and `completed_with_available_engines`.
   - The report screen now shows the evidence layer status and engine results.

4. EU AI Act screening profile added to backend request
   - The backend now accepts role, risk category and obligation metadata from the EU screening step.

5. Misleading dashboard wording corrected
   - The dashboard no longer says all COMPL-AI / LM Eval engines are fully active.
   - It now states the current version uses backend-managed OWASP while other engines are being prepared.

6. Route bug fixed
   - Login/register success now navigates to `/`, matching the actual route structure.
   - Previous incorrect navigation to `/dashboard` was removed.

7. Firebase/GitHub Actions path fixed
   - Workflow paths changed from the non-existing `cyberandlegal-lab` directory to `lab-frontend`.

## Notes

- Source code has been patched.
- The existing `dist` folder in the ZIP was not rebuilt inside this environment because the local Vite binary was unavailable. The corrected GitHub/Firebase pipeline will rebuild `dist` from source during deployment.
- COMPL-AI, Promptfoo and LM Eval are still not fully installed/executed by the backend. The patch prevents the UI from misleadingly presenting them as completed engines.
