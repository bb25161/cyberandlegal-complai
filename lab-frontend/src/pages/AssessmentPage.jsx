import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { runAssessment } from "../lib/api"
import { useT } from "../lib/i18n"
import EUScreening from "../components/EUScreening"

const SECTOR_USE_CASES = {
  sector_finance:    ["uc_credit_scoring","uc_fraud_detection","uc_insurance_risk","uc_recommendation","uc_chatbot","uc_process_automation","uc_other"],
  sector_healthcare: ["uc_medical_diagnosis","uc_treatment_recommendation","uc_medical_device","uc_recommendation","uc_other"],
  sector_legal:      ["uc_legal_research","uc_contract_review","uc_legal_interpretation","uc_other"],
  sector_public:     ["uc_benefits_scoring","uc_border_control","uc_law_enforcement","uc_monitoring","uc_process_automation","uc_other"],
  sector_hr:         ["uc_hr_screening","uc_performance","uc_recommendation","uc_other"],
  sector_education:  ["uc_education_assessment","uc_recommendation","uc_chatbot","uc_other"],
  sector_energy:     ["uc_monitoring","uc_process_automation","uc_other"],
  sector_general:    ["uc_content_generation","uc_recommendation","uc_chatbot","uc_process_automation","uc_monitoring","uc_other"],
}

const STEPS_EN = ["About your AI","Potential harms","Risk factors","Safeguards","AI model test"]
const STEPS_TR = ["AI Sisteminiz","Olası zararlar","Risk faktörleri","Önlemler","Model testi"]

export default function AssessmentPage({ lang = "en", onToggleLang }) {
  const t = useT(lang)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [screeningDone, setScreeningDone] = useState(false)
  const [screeningResult, setScreeningResult] = useState(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const STEPS = lang === "tr" ? STEPS_TR : STEPS_EN
  const isExternal = ["src_api","src_saas"].includes(form.source)
  const useCases   = SECTOR_USE_CASES[form.sector] || SECTOR_USE_CASES.sector_general
  const progress   = (step / (STEPS.length - 1)) * 100

  function handleScreeningComplete(result) {
    setScreeningResult(result)
    set("eu_role",          result.role)
    set("eu_risk_category", result.risk_category)
    set("eu_obligations",   result.obligations)
    setScreeningDone(true)
    setStep(0)
  }

  async function handleSubmit() {
    setLoading(true); setError("")
    try {
      const result = await runAssessment(form)
      navigate("/report", { state: { result, form, lang } })
    } catch (e) { setError(t("err_api")) }
    finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <span style={s.brand}>Cyber<span style={s.brandAmp}>&</span>Legal <span style={s.brandLab}>Lab</span></span>
        <div style={s.headerRight}>
          <button style={s.langBtn} onClick={onToggleLang}>{t("nav_lang")}</button>
          <span style={s.userEmail}>{user?.email}</span>
          <button style={s.logoutBtn} onClick={logout}>{t("nav_logout")}</button>
        </div>
      </header>

      <div style={s.layout}>
        {/* ── Sidebar ── */}
        <aside style={s.sidebar}>
          <div style={s.sidebarInner}>
            {/* EU Screening step */}
            <div style={{ ...s.sideStep, ...(!screeningDone ? s.sideStepActive : s.sideStepDone) }}>
              <div style={{ ...s.sideNum, ...(!screeningDone ? s.sideNumActive : s.sideNumDone) }}>
                {screeningDone ? "✓" : "✦"}
              </div>
              <div>
                <div style={s.sideLabel}>{lang === "tr" ? "AB Hukuki Tarama" : "EU Legal Screening"}</div>
                {!screeningDone && <div style={s.sideSub}>7 {lang === "tr" ? "resmi kontrol" : "official checks"}</div>}
              </div>
            </div>
            <div style={s.sideDivider} />
            {/* Assessment steps */}
            {STEPS.map((label, i) => (
              <div key={i} style={{
                ...s.sideStep,
                ...(screeningDone && i === step ? s.sideStepActive : {}),
                ...(screeningDone && i < step  ? s.sideStepDone  : {}),
                ...(!screeningDone ? { opacity: 0.35 } : {}),
              }}>
                <div style={{ ...s.sideNum, ...(screeningDone && i === step ? s.sideNumActive : screeningDone && i < step ? s.sideNumDone : {}) }}>
                  {screeningDone && i < step ? "✓" : i + 1}
                </div>
                <span style={s.sideLabel}>{label}</span>
              </div>
            ))}
          </div>
          <div style={s.progressWrap}>
            <div style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: screeningDone ? `${progress}%` : "0%" }} />
            </div>
            <span style={s.progressLabel}>{screeningDone ? `${Math.round(progress)}%` : "—"}</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={s.main}>
          {!screeningDone ? (
            <div style={s.card}>
              <EUScreening lang={lang} onComplete={handleScreeningComplete} />
            </div>
          ) : (
            <div style={s.card}>
              {/* Screening pill */}
              {screeningResult && (
                <div style={s.pill}>
                  <span style={s.pillDot} />
                  <span style={s.pillText}>
                    EU AI Act: <strong>{riskLabel(screeningResult.risk_category, lang)}</strong>
                    {" · "}
                    {lang === "tr" ? "Rol:" : "Role:"} <strong>{roleLabel(screeningResult.role, lang)}</strong>
                  </span>
                </div>
              )}

              <div style={s.cardHeader}>
                <div style={s.stepBadge}>
                  {lang === "tr" ? `Adım ${step + 1} / ${STEPS.length}` : `Step ${step + 1} of ${STEPS.length}`}
                </div>
                <h1 style={s.cardTitle}>{STEPS[step]}</h1>
              </div>

              <div style={s.fields}>
                {step === 0 && <Step1 t={t} form={form} set={set} useCases={useCases} />}
                {step === 1 && <Step2 t={t} form={form} set={set} />}
                {step === 2 && <Step3 t={t} form={form} set={set} />}
                {step === 3 && <Step4 t={t} form={form} set={set} isExternal={isExternal} />}
                {step === 4 && <Step5 t={t} form={form} set={set} lang={lang} />}
              </div>

              {error && <div style={s.errorBox}>{error}</div>}

              <div style={s.navRow}>
                {step > 0
                  ? <button style={s.btnSecondary} onClick={() => setStep(s => s - 1)}>{t("btn_back")}</button>
                  : <button style={s.btnSecondary} onClick={() => { setScreeningDone(false); setStep(0) }}>
                      {lang === "tr" ? "← Taramaya dön" : "← Back to screening"}
                    </button>
                }
                {step < STEPS.length - 1
                  ? <button style={s.btnPrimary} onClick={() => setStep(s => s + 1)}>{t("btn_next")} →</button>
                  : <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
                      {loading ? t("btn_submitting") : t("btn_submit")}
                    </button>
                }
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ── Label helpers ─────────────────────────────────────────────────────────────

function riskLabel(key, lang) {
  const m = { en: { minimal:"Minimal Risk", limited:"Limited Risk", high:"High Risk", gpai:"GPAI", gpai_systemic:"GPAI + Systemic Risk" },
               tr: { minimal:"Minimal Risk", limited:"Sınırlı Risk", high:"Yüksek Risk", gpai:"GPAI", gpai_systemic:"GPAI + Sistemik Risk" } }
  return m[lang]?.[key] || key
}
function roleLabel(key, lang) {
  const m = { en: { provider:"Provider", deployer:"Deployer", both:"Both", importer:"Importer" },
               tr: { provider:"Sağlayıcı", deployer:"Dağıtıcı", both:"Her ikisi", importer:"İthalatçı" } }
  return m[lang]?.[key] || key
}

// ── Shared field components ───────────────────────────────────────────────────

function F({ label, hint, badge, children }) {
  return (
    <div style={s.field}>
      <div style={s.labelWrap}>
        <label style={s.label}>{label}{badge && <span style={s.badge}>{badge}</span>}</label>
        {hint && <p style={s.hint}>{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Sel({ value, onChange, options, placeholder }) {
  return (
    <select style={s.select} value={value || ""} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

function Tog({ value, onChange, yes, no }) {
  return (
    <div style={s.toggleGroup}>
      <button type="button" style={{ ...s.toggleBtn, ...(value === true  ? s.toggleYes : {}) }} onClick={() => onChange(true)}>{yes}</button>
      <button type="button" style={{ ...s.toggleBtn, ...(value === false ? s.toggleNo  : {}) }} onClick={() => onChange(false)}>{no}</button>
    </div>
  )
}

function Txt({ value, onChange, placeholder }) {
  return <textarea style={s.textarea} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
}

function NistBadge({ code }) {
  return <span style={s.nistBadge}>{code}</span>
}

// ── Step 1: About your AI (+ lifecycle + risk tolerance) ──────────────────────

function Step1({ t, form, set, useCases }) {
  return <>
    <div style={s.row2}>
      <F label={t("f_org")}>
        <input style={s.input} value={form.org || ""} onChange={e => set("org", e.target.value)} placeholder={t("f_org_ph")} />
      </F>
      <F label={t("f_sector")}>
        <Sel value={form.sector} onChange={v => { set("sector", v); set("usecase", "") }}
          placeholder={t("f_sector_ph")}
          options={["sector_finance","sector_healthcare","sector_legal","sector_public","sector_hr","sector_education","sector_energy","sector_general"].map(k => [k, t(k)])} />
      </F>
    </div>

    <F label={t("f_usecase")}>
      <Sel value={form.usecase} onChange={v => set("usecase", v)} placeholder={t("f_usecase_ph")} options={useCases.map(k => [k, t(k)])} />
    </F>
    {form.usecase === "uc_other" && (
      <F label={t("f_usecase_other")}><Txt value={form.usecase_text} onChange={v => set("usecase_text", v)} placeholder={t("f_usecase_other_ph")} /></F>
    )}

    <F label={t("f_description")}>
      <Txt value={form.description} onChange={v => set("description", v)} placeholder={t("f_description_ph")} />
    </F>

    <F label={t("f_decision_maker")}>
      <Sel value={form.decision_maker} onChange={v => set("decision_maker", v)} placeholder={t("f_decision_maker_ph")}
        options={["dm_auto","dm_approval","dm_informed","dm_assist"].map(k => [k, t(k)])} />
    </F>

    <div style={s.row2}>
      <F label={t("f_source")}>
        <Sel value={form.source} onChange={v => set("source", v)} placeholder={t("f_source_ph")}
          options={["src_inhouse","src_api","src_saas","src_opensource","src_hybrid"].map(k => [k, t(k)])} />
      </F>
      <F label={t("f_monthly_users")}>
        <Sel value={form.monthly_users} onChange={v => set("monthly_users", v)} placeholder={t("f_monthly_users_ph")}
          options={["mu_under100","mu_100_1k","mu_1k_100k","mu_over100k"].map(k => [k, t(k)])} />
      </F>
    </div>

    <div style={s.row2}>
      <F label={t("f_decision_impact")}>
        <Sel value={form.decision_impact} onChange={v => set("decision_impact", v)} placeholder={t("f_decision_impact_ph")}
          options={["di_low","di_moderate","di_significant","di_life_changing"].map(k => [k, t(k)])} />
      </F>
      <F label={t("f_training_data")}>
        <Sel value={form.training_data} onChange={v => set("training_data", v)} placeholder={t("f_training_data_ph")}
          options={["td_own","td_public","td_third","td_scraped","td_synthetic","td_unknown","td_na"].map(k => [k, t(k)])} />
      </F>
    </div>

    {/* NIST MAP 1.4 — Lifecycle stage */}
    <F label={t("f_lifecycle")} hint={t("f_lifecycle_hint")} badge={<NistBadge code="NIST MAP 1.4" />}>
      <Sel value={form.lifecycle} onChange={v => set("lifecycle", v)} placeholder={t("f_lifecycle_ph")}
        options={["lc_design","lc_development","lc_testing","lc_deployed","lc_scaling","lc_retiring"].map(k => [k, t(k)])} />
    </F>

    {/* NIST MAP 1.5 / GOVERN 1.3 — Risk tolerance */}
    <F label={t("f_risk_tolerance")} hint={t("f_risk_tolerance_hint")} badge={<NistBadge code="NIST MAP 1.5" />}>
      <Sel value={form.risk_tolerance} onChange={v => set("risk_tolerance", v)} placeholder={t("f_risk_tolerance_ph")}
        options={["rt_zero","rt_low","rt_medium","rt_high"].map(k => [k, t(k)])} />
    </F>
  </>
}

// ── Step 2: Potential harms (+ drift) ────────────────────────────────────────

function Step2({ t, form, set }) {
  return <>
    <div style={s.row2}>
      <F label={t("f_harm_type")}>
        <Sel value={form.harm_type} onChange={v => set("harm_type", v)} placeholder={t("f_harm_type_ph")}
          options={["ht_financial","ht_discrimination","ht_allocational","ht_representational","ht_privacy","ht_physical","ht_reputation","ht_psychological","ht_rights"].map(k => [k, t(k)])} />
      </F>
      <F label={t("f_harm_severity")}>
        <Sel value={form.harm_severity} onChange={v => set("harm_severity", v)} placeholder={t("f_harm_severity_ph")}
          options={["sev_negligible","sev_minor","sev_moderate","sev_significant","sev_critical"].map(k => [k, t(k)])} />
      </F>
    </div>

    <F label={t("f_vulnerable")} hint={t("f_vulnerable_hint")}>
      <Tog value={form.vulnerable} onChange={v => set("vulnerable", v)} yes={t("yes")} no={t("no")} />
    </F>

    <div style={s.row2}>
      <F label={t("f_reversible")}>
        <Sel value={form.reversible} onChange={v => set("reversible", v)} placeholder={t("f_reversible_ph")}
          options={["rev_easy","rev_effort","rev_hard","rev_irreversible"].map(k => [k, t(k)])} />
      </F>
      <F label={t("f_cascade")}>
        <Sel value={form.cascade} onChange={v => set("cascade", v)} placeholder={t("f_cascade_ph")}
          options={["cas_single","cas_small","cas_many","cas_systemic"].map(k => [k, t(k)])} />
      </F>
    </div>

    <F label={t("f_transparency")} hint={t("f_transparency_hint")} badge="EU AI Act Art. 13">
      <Tog value={form.transparency} onChange={v => set("transparency", v)} yes={t("yes")} no={t("no")} />
    </F>

    {/* NIST MEASURE 2.4 / MANAGE 2.2 — Drift */}
    <F label={t("f_drift")} hint={t("f_drift_hint")} badge={<NistBadge code="NIST MEASURE 2.4" />}>
      <Sel value={form.drift} onChange={v => set("drift", v)} placeholder={t("f_drift_ph")}
        options={["dr_continuous","dr_occasional","dr_unknown","dr_not_monitored"].map(k => [k, t(k)])} />
    </F>
  </>
}

// ── Step 3: Risk factors ──────────────────────────────────────────────────────

function Step3({ t, form, set }) {
  return <>
    <F label={t("f_incidents")}>
      <Sel value={form.incidents} onChange={v => set("incidents", v)} placeholder={t("f_incidents_ph")}
        options={["inc_none","inc_near","inc_once","inc_multiple"].map(k => [k, t(k)])} />
    </F>
    <F label={t("f_deployment")}>
      <Sel value={form.deployment} onChange={v => set("deployment", v)} placeholder={t("f_deployment_ph")}
        options={["dep_sandbox","dep_internal","dep_limited","dep_public"].map(k => [k, t(k)])} />
    </F>
    <F label={t("f_sector_risk")}>
      <Sel value={form.sector_risk} onChange={v => set("sector_risk", v)} placeholder={t("f_sector_risk_ph")}
        options={["sr_unknown","sr_no","sr_some","sr_many"].map(k => [k, t(k)])} />
    </F>
  </>
}

// ── Step 4: Safeguards (+ explainability + adversarial + decommission) ────────

function Step4({ t, form, set, isExternal }) {
  return <>
    <F label={t("f_override")} hint={t("f_override_hint")} badge="EU AI Act Art. 14">
      <Tog value={form.override} onChange={v => set("override", v)} yes={t("yes")} no={t("no")} />
    </F>

    <F label={t("f_oversight")}>
      <Sel value={form.oversight} onChange={v => set("oversight", v)} placeholder={t("f_oversight_ph")}
        options={["ov_none","ov_rubber","ov_partial","ov_full"].map(k => [k, t(k)])} />
    </F>

    <div style={s.row2}>
      <F label={t("f_appeal")}><Tog value={form.appeal}   onChange={v => set("appeal",   v)} yes={t("yes")} no={t("no")} /></F>
      <F label={t("f_logging")}><Tog value={form.logging} onChange={v => set("logging",  v)} yes={t("yes")} no={t("no")} /></F>
    </div>

    <div style={s.row2}>
      <F label={t("f_bias_test")}><Tog value={form.bias_test} onChange={v => set("bias_test", v)} yes={t("yes")} no={t("no")} /></F>
      <F label={t("f_ir_plan")}><Tog value={form.ir_plan}     onChange={v => set("ir_plan",   v)} yes={t("yes")} no={t("no")} /></F>
    </div>

    {isExternal && (
      <F label={t("f_vendor_docs")} hint={t("f_vendor_docs_hint")}>
        <Tog value={form.vendor_docs} onChange={v => set("vendor_docs", v)} yes={t("yes")} no={t("no")} />
      </F>
    )}

    <div style={s.row2}>
      <F label={t("f_tech_docs")} badge="EU AI Act Art. 11">
        <Tog value={form.tech_docs} onChange={v => set("tech_docs", v)} yes={t("yes")} no={t("no")} />
      </F>
      <F label={t("f_bias_training")} badge="EU AI Act Art. 14(4)">
        <Tog value={form.bias_training} onChange={v => set("bias_training", v)} yes={t("yes")} no={t("no")} />
      </F>
    </div>

    <F label={t("f_eu_aware")} badge="EU AI Act Art. 49">
      <Tog value={form.eu_aware} onChange={v => set("eu_aware", v)} yes={t("yes")} no={t("no")} />
    </F>

    {/* NIST MEASURE 2.9 — Explainability */}
    <F label={t("f_explainability")} hint={t("f_explainability_hint")} badge={<NistBadge code="NIST MEASURE 2.9" />}>
      <Sel value={form.explainability} onChange={v => set("explainability", v)} placeholder={t("f_explainability_ph")}
        options={["ex_full","ex_summary","ex_technical","ex_none"].map(k => [k, t(k)])} />
    </F>

    {/* NIST MEASURE 2.7 / GOVERN 4.1 — Adversarial testing */}
    <F label={t("f_adversarial")} hint={t("f_adversarial_hint")} badge={<NistBadge code="NIST MEASURE 2.7" />}>
      <Sel value={form.adversarial} onChange={v => set("adversarial", v)} placeholder={t("f_adversarial_ph")}
        options={["adv_independent","adv_internal","adv_informal","adv_none"].map(k => [k, t(k)])} />
    </F>

    {/* NIST GOVERN 1.7 / MANAGE 2.4 — Decommission plan */}
    <F label={t("f_decommission")} hint={t("f_decommission_hint")} badge={<NistBadge code="NIST GOVERN 1.7" />}>
      <Sel value={form.decommission} onChange={v => set("decommission", v)} placeholder={t("f_decommission_ph")}
        options={["dc_documented","dc_informal","dc_none"].map(k => [k, t(k)])} />
    </F>
  </>
}

// ── Step 5: AI model test ─────────────────────────────────────────────────────

function Step5({ t, form, set, lang }) {
  const isCustom = form.model_provider === "prov_custom"
  return <>
    <div style={s.infoBox}>
      <span style={s.infoIcon}>🔒</span>
      <span style={s.infoText}>
        {lang === "tr"
          ? "API anahtarınız yalnızca test sırasında kullanılır, hiçbir zaman saklanmaz. Test yapmak istemiyorsanız bu adımı atlayabilirsiniz."
          : "Your API key is used only during the test run and is never stored. You can skip this step if you do not want technical testing."}
      </span>
    </div>

    <F label={t("f_model_provider")}>
      <Sel value={form.model_provider} onChange={v => { set("model_provider", v); set("model_name", "") }}
        placeholder={t("f_model_provider_ph")}
        options={["prov_openai","prov_anthropic","prov_google","prov_huggingface","prov_custom"].map(k => [k, t(k)])} />
    </F>

    {form.model_provider && !isCustom && (
      <F label={t("f_model_name")}>
        <input style={s.input} value={form.model_name || ""} onChange={e => set("model_name", e.target.value)} placeholder={t("f_model_name_ph")} />
      </F>
    )}
    {isCustom && (
      <F label={t("f_custom_endpoint")}>
        <input style={s.input} value={form.custom_endpoint || ""} onChange={e => set("custom_endpoint", e.target.value)} placeholder={t("f_custom_endpoint_ph")} />
      </F>
    )}
    {form.model_provider && (
      <F label={t("f_api_key")}>
        <input style={s.input} type="password" value={form.api_key || ""} onChange={e => set("api_key", e.target.value)} placeholder={t("f_api_key_ph")} autoComplete="off" />
      </F>
    )}
    {form.model_provider && (
      <F label={t("f_test_scope")}>
        <div style={s.scopeGrid}>
          {["ts_quick","ts_standard","ts_full"].map(k => (
            <button key={k} type="button"
              style={{ ...s.scopeBtn, ...(form.test_scope === k ? s.scopeActive : {}) }}
              onClick={() => set("test_scope", k)}>
              <div style={s.scopeTitle}>{t(k).split("·")[0].trim()}</div>
              <div style={s.scopeSub}>{t(k).split("·").slice(1).join("·").trim()}</div>
            </button>
          ))}
        </div>
      </F>
    )}
  </>
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page:       { minHeight:"100vh", background:"#f5f4f0", display:"flex", flexDirection:"column" },
  header:     { background:"#0f0f0e", padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
  brand:      { fontSize:15, fontWeight:600, color:"#fff", letterSpacing:"-0.3px" },
  brandAmp:   { fontWeight:300, color:"rgba(255,255,255,0.4)" },
  brandLab:   { color:"#7c6af7", fontSize:13, fontWeight:500, marginLeft:4 },
  headerRight:{ display:"flex", alignItems:"center", gap:12 },
  langBtn:    { border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.06)", borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer", color:"rgba(255,255,255,0.7)", fontWeight:700, letterSpacing:"0.05em" },
  userEmail:  { fontSize:12, color:"rgba(255,255,255,0.3)" },
  logoutBtn:  { border:"1px solid rgba(255,255,255,0.1)", background:"transparent", borderRadius:6, padding:"4px 12px", fontSize:12, cursor:"pointer", color:"rgba(255,255,255,0.45)" },

  layout:      { display:"flex", flex:1 },
  sidebar:     { width:224, background:"#fff", borderRight:"1px solid #ebe9e4", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"28px 0 20px", flexShrink:0 },
  sidebarInner:{ padding:"0 16px", display:"flex", flexDirection:"column", gap:2 },
  sideStep:    { display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, transition:"background .15s" },
  sideStepActive:{ background:"#f0effe" },
  sideStepDone:  { opacity:0.55 },
  sideNum:     { width:22, height:22, borderRadius:"50%", background:"#e8e6e0", color:"#999", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  sideNumActive:{ background:"#7c6af7", color:"#fff" },
  sideNumDone: { background:"#22c55e", color:"#fff" },
  sideLabel:   { fontSize:12, color:"#333", fontWeight:500, lineHeight:1.3 },
  sideSub:     { fontSize:10, color:"#999", marginTop:2 },
  sideDivider: { height:1, background:"#f0eeea", margin:"8px 10px" },

  progressWrap: { padding:"16px 16px 0", display:"flex", alignItems:"center", gap:8 },
  progressTrack:{ flex:1, height:3, background:"#e8e6e0", borderRadius:2, overflow:"hidden" },
  progressFill: { height:"100%", background:"#7c6af7", borderRadius:2, transition:"width .4s ease" },
  progressLabel:{ fontSize:10, color:"#bbb", minWidth:26 },

  main:  { flex:1, padding:"36px 48px", overflowY:"auto" },
  card:  { maxWidth:700, background:"#fff", borderRadius:16, padding:"36px 40px", boxShadow:"0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05)" },

  pill:    { display:"inline-flex", alignItems:"center", gap:7, background:"#f0effe", border:"1px solid #ddd6fe", borderRadius:20, padding:"5px 12px", marginBottom:18, fontSize:11.5 },
  pillDot: { width:7, height:7, borderRadius:"50%", background:"#7c6af7", flexShrink:0 },
  pillText:{ color:"#534ab7" },

  cardHeader:{ marginBottom:28, paddingBottom:20, borderBottom:"1px solid #f0eeea" },
  stepBadge: { fontSize:11, fontWeight:700, color:"#7c6af7", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 },
  cardTitle: { fontSize:22, fontWeight:600, color:"#0f0f0e", margin:0, letterSpacing:"-0.4px" },

  fields: { display:"flex", flexDirection:"column", gap:22 },
  field:  {},
  row2:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 },

  labelWrap:{ marginBottom:7 },
  label:    { fontSize:13, fontWeight:500, color:"#1a1a1a", display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", lineHeight:1.4 },
  hint:     { fontSize:12, color:"#999", marginTop:4, marginBottom:0, lineHeight:1.5 },
  badge:    { fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:8, background:"#eeedfe", color:"#534ab7", flexShrink:0 },
  nistBadge:{ fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:8, background:"#e0f2fe", color:"#0369a1", flexShrink:0, letterSpacing:"0.02em" },

  input:   { width:"100%", border:"1.5px solid #e8e6e0", borderRadius:8, padding:"10px 13px", fontSize:14, color:"#0f0f0e", background:"#fafaf8", boxSizing:"border-box", outline:"none", fontFamily:"inherit" },
  select:  { width:"100%", border:"1.5px solid #e8e6e0", borderRadius:8, padding:"10px 13px", fontSize:14, color:"#0f0f0e", background:"#fafaf8", boxSizing:"border-box", outline:"none", cursor:"pointer", fontFamily:"inherit" },
  textarea:{ width:"100%", border:"1.5px solid #e8e6e0", borderRadius:8, padding:"10px 13px", fontSize:14, color:"#0f0f0e", background:"#fafaf8", boxSizing:"border-box", outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 },

  toggleGroup:{ display:"flex", gap:8, marginTop:2 },
  toggleBtn:  { flex:1, border:"1.5px solid #e8e6e0", borderRadius:8, padding:"9px 16px", fontSize:13, fontWeight:500, color:"#666", background:"#fafaf8", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" },
  toggleYes:  { background:"#7c6af7", borderColor:"#7c6af7", color:"#fff" },
  toggleNo:   { background:"#f1f5f9", borderColor:"#94a3b8", color:"#475569" },

  infoBox:  { background:"#f5f3ff", border:"1px solid #ddd6fe", borderRadius:10, padding:"12px 16px", display:"flex", gap:10, alignItems:"flex-start" },
  infoIcon: { fontSize:16, flexShrink:0 },
  infoText: { fontSize:13, color:"#5b21b6", lineHeight:1.5 },

  scopeGrid:  { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 },
  scopeBtn:   { border:"1.5px solid #e8e6e0", borderRadius:10, padding:"14px 12px", background:"#fafaf8", cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all .15s" },
  scopeActive:{ borderColor:"#7c6af7", background:"#f0effe" },
  scopeTitle: { fontSize:13, fontWeight:600, color:"#0f0f0e", marginBottom:4 },
  scopeSub:   { fontSize:11, color:"#999", lineHeight:1.4 },

  errorBox:  { background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#dc2626", marginTop:16 },
  navRow:    { display:"flex", justifyContent:"space-between", marginTop:28, paddingTop:20, borderTop:"1px solid #f0eeea" },
  btnPrimary:   { background:"#0f0f0e", color:"#fff", border:"none", borderRadius:8, padding:"11px 24px", fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"inherit", letterSpacing:"-0.1px" },
  btnSecondary: { background:"transparent", color:"#666", border:"1.5px solid #e8e6e0", borderRadius:8, padding:"10px 20px", fontSize:14, cursor:"pointer", fontFamily:"inherit" },
}
