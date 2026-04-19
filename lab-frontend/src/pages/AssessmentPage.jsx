import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { runAssessment } from "../lib/api"

const STEPS = [
  { id: "context",     title: "Bağlam",          subtitle: "AI sisteminizi tanımlayın" },
  { id: "harm",        title: "Zarar Boyutları",  subtitle: "Olası riskler" },
  { id: "likelihood",  title: "Olasılık",         subtitle: "Risk faktörleri" },
  { id: "controls",    title: "Kontroller",       subtitle: "Mevcut önlemler" },
]

const SECTORS = [
  { value:"finance",        label:"Finans" },
  { value:"healthcare",     label:"Sağlık" },
  { value:"legal",          label:"Hukuk" },
  { value:"public",         label:"Kamu" },
  { value:"hr_recruitment", label:"İK / İşe Alım" },
  { value:"education",      label:"Eğitim" },
  { value:"energy",         label:"Enerji" },
  { value:"general",        label:"Genel" },
]

const USE_CASES = [
  { value:"credit_scoring",                   label:"Kredi skorlama" },
  { value:"medical_diagnosis",                label:"Tıbbi teşhis" },
  { value:"hr_screening",                     label:"İşe alım değerlendirme" },
  { value:"decision_making_about_individuals", label:"Bireysel karar verme" },
  { value:"fraud_detection",                  label:"Dolandırıcılık tespiti" },
  { value:"recommendation_system",            label:"Öneri sistemi" },
  { value:"content_generation",               label:"İçerik üretimi" },
  { value:"monitoring_surveillance",          label:"İzleme / Gözetim" },
  { value:"customer_service_chatbot",         label:"Müşteri hizmetleri chatbot" },
  { value:"other",                            label:"Diğer" },
]

const AUTOMATION = [
  { value:"fully_automated",         label:"Tam otomatik — insan müdahalesi yok" },
  { value:"human_approval_required", label:"İnsan onayı gerekiyor" },
  { value:"human_informed",          label:"İnsan bilgilendiriliyor" },
  { value:"assistance_only",         label:"Sadece yardımcı — karar insanda" },
]

const PEOPLE = [
  { value:"under_100",       label:"100'den az" },
  { value:"100_to_1000",     label:"100 – 1.000" },
  { value:"1000_to_100000",  label:"1.000 – 100.000" },
  { value:"over_100000",     label:"100.000'den fazla" },
]

const SEVERITY = [
  { value:"negligible", label:"Önemsiz" },
  { value:"minor",      label:"Küçük" },
  { value:"moderate",   label:"Orta" },
  { value:"significant",label:"Önemli" },
  { value:"critical",   label:"Kritik" },
]

const HARM_TYPES_LIST = [
  { value:"financial_loss",   label:"Mali kayıp" },
  { value:"discrimination",   label:"Ayrımcılık" },
  { value:"privacy_violation",label:"Gizlilik ihlali" },
  { value:"physical_harm",    label:"Fiziksel zarar" },
  { value:"reputational_harm",label:"İtibar zararı" },
  { value:"psychological_harm",label:"Psikolojik zarar" },
]

export default function AssessmentPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    organization: "",
    sector: "",
    use_case_type: "",
    automation_level: "",
    people_affected: "under_100",
    decision_criticality: "moderate",
    harm_types: [{ type: "financial_loss", severity: "moderate" }],
    rights_at_risk: [],
    reversibility: "reversible_with_effort",
    threat_exposure: "medium",
    past_incidents: "none_known",
    susceptibility: "medium",
    oversight_quality: "partial_review",
    can_override: true,
    explainable: false,
    bias_testing: false,
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")
    try {
      const result = await runAssessment(form)
      navigate("/report", { state: { result, form } })
    } catch (e) {
      setError("API bağlantı hatası. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.brand}>Cyber<span style={{fontWeight:300}}>&</span>Legal Lab</span>
        <div style={s.headerRight}>
          <span style={s.userEmail}>{user?.email}</span>
          <button style={s.logoutBtn} onClick={logout}>Çıkış</button>
        </div>
      </header>

      <div style={s.container}>
        {/* Progress */}
        <div style={s.progress}>
          {STEPS.map((st, i) => (
            <div key={st.id} style={s.progressItem}>
              <div style={{ ...s.progressDot, ...(i <= step ? s.progressDotActive : {}) }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ ...s.progressLabel, ...(i === step ? s.progressLabelActive : {}) }}>
                {st.title}
              </span>
              {i < STEPS.length - 1 && <div style={{ ...s.progressLine, ...(i < step ? s.progressLineActive : {}) }} />}
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h2 style={s.stepTitle}>{STEPS[step].title}</h2>
          <p style={s.stepSub}>{STEPS[step].subtitle}</p>

          {step === 0 && <StepContext form={form} set={set} />}
          {step === 1 && <StepHarm form={form} set={set} />}
          {step === 2 && <StepLikelihood form={form} set={set} />}
          {step === 3 && <StepControls form={form} set={set} />}

          {error && <div style={s.error}>{error}</div>}

          <div style={s.navRow}>
            {step > 0 && (
              <button style={s.btnSecondary} onClick={() => setStep(s => s - 1)}>
                Geri
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button style={s.btnPrimary} onClick={() => setStep(s => s + 1)}>
                Devam →
              </button>
            ) : (
              <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
                {loading ? "Analiz ediliyor..." : "Raporu oluştur"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepContext({ form, set }) {
  return (
    <div style={s.fields}>
      <Field label="Organizasyon adı">
        <input style={s.input} value={form.organization} onChange={e => set("organization", e.target.value)} placeholder="Şirket / Kurum adı" />
      </Field>
      <Field label="Sektör">
        <Select value={form.sector} onChange={v => set("sector", v)} options={SECTORS} placeholder="Sektör seçin" />
      </Field>
      <Field label="Kullanım türü">
        <Select value={form.use_case_type} onChange={v => set("use_case_type", v)} options={USE_CASES} placeholder="Kullanım türü seçin" />
      </Field>
      <Field label="Otomasyon seviyesi">
        <Select value={form.automation_level} onChange={v => set("automation_level", v)} options={AUTOMATION} placeholder="Otomasyon seviyesi seçin" />
      </Field>
      <Field label="Aylık etkilenen kişi sayısı">
        <Select value={form.people_affected} onChange={v => set("people_affected", v)} options={PEOPLE} />
      </Field>
    </div>
  )
}

function StepHarm({ form, set }) {
  const harmType = form.harm_types[0]?.type || "financial_loss"
  const harmSev  = form.harm_types[0]?.severity || "moderate"

  return (
    <div style={s.fields}>
      <Field label="Birincil zarar türü">
        <Select value={harmType} onChange={v => set("harm_types", [{ type: v, severity: harmSev }])} options={HARM_TYPES_LIST} />
      </Field>
      <Field label="Zarar şiddeti">
        <Select value={harmSev} onChange={v => set("harm_types", [{ type: harmType, severity: v }])} options={SEVERITY} />
      </Field>
      <Field label="Geri dönüşüm">
        <Select value={form.reversibility} onChange={v => set("reversibility", v)} options={[
          { value:"easily_reversible",      label:"Kolayca geri alınabilir" },
          { value:"reversible_with_effort", label:"Çabayla geri alınabilir" },
          { value:"difficult_to_reverse",   label:"Geri alması zor" },
          { value:"irreversible",           label:"Geri alınamaz" },
        ]} />
      </Field>
      <Field label="Savunmasız gruplar etkileniyor mu?">
        <Toggle value={form.vulnerable_groups} onChange={v => set("vulnerable_groups", v)} label="Evet, çocuklar / yaşlılar / engelliler etkileniyor" />
      </Field>
    </div>
  )
}

function StepLikelihood({ form, set }) {
  return (
    <div style={s.fields}>
      <Field label="Tehdit maruziyeti">
        <Select value={form.threat_exposure} onChange={v => set("threat_exposure", v)} options={[
          { value:"low",       label:"Düşük" },
          { value:"medium",    label:"Orta" },
          { value:"high",      label:"Yüksek" },
          { value:"very_high", label:"Çok yüksek" },
        ]} />
      </Field>
      <Field label="Geçmiş olaylar">
        <Select value={form.past_incidents} onChange={v => set("past_incidents", v)} options={[
          { value:"none_known",              label:"Bilinen olay yok" },
          { value:"near_misses_only",        label:"Sadece yakın kaçışlar" },
          { value:"one_known_incident",      label:"Bir bilinen olay" },
          { value:"multiple_known_incidents",label:"Birden fazla olay" },
        ]} />
      </Field>
      <Field label="Model hassasiyeti">
        <Select value={form.susceptibility} onChange={v => set("susceptibility", v)} options={[
          { value:"low",     label:"Düşük" },
          { value:"medium",  label:"Orta" },
          { value:"high",    label:"Yüksek" },
          { value:"unknown", label:"Bilinmiyor" },
        ]} />
      </Field>
    </div>
  )
}

function StepControls({ form, set }) {
  return (
    <div style={s.fields}>
      <Field label="İnsan denetimi kalitesi">
        <Select value={form.oversight_quality} onChange={v => set("oversight_quality", v)} options={[
          { value:"none",                 label:"Denetim yok" },
          { value:"rubber_stamp",         label:"Sembolik onay" },
          { value:"partial_review",       label:"Kısmi inceleme" },
          { value:"full_meaningful_review",label:"Tam anlamlı denetim" },
        ]} />
      </Field>
      <Field label="AI kararı geçersiz kılınabiliyor mu?">
        <Toggle value={form.can_override} onChange={v => set("can_override", v)} label="Evet, insan AI kararını override edebilir" />
      </Field>
      <Field label="Kararlar açıklanabiliyor mu?">
        <Toggle value={form.explainable} onChange={v => set("explainable", v)} label="Evet, kullanıcılara açıklama sağlanıyor" />
      </Field>
      <Field label="Bias testi yapıldı mı?">
        <Toggle value={form.bias_testing} onChange={v => set("bias_testing", v)} label="Evet, önyargı testi gerçekleştirildi" />
      </Field>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select style={s.input} value={value} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <label style={s.toggleRow}>
      <div style={{ ...s.toggleTrack, background: value ? "#1a1a1a" : "#e5e5e5" }} onClick={() => onChange(!value)}>
        <div style={{ ...s.toggleThumb, transform: value ? "translateX(18px)" : "translateX(2px)" }} />
      </div>
      <span style={s.toggleLabel}>{label}</span>
    </label>
  )
}

const s = {
  page: { minHeight:"100vh", background:"#f8f7f4" },
  header: { background:"#fff", borderBottom:"1px solid #eee", padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" },
  brand: { fontSize:16, fontWeight:600, color:"#1a1a1a" },
  headerRight: { display:"flex", alignItems:"center", gap:16 },
  userEmail: { fontSize:13, color:"#888" },
  logoutBtn: { border:"1px solid #e5e5e5", background:"#fff", borderRadius:6, padding:"5px 12px", fontSize:13, cursor:"pointer", color:"#444" },
  container: { maxWidth:640, margin:"0 auto", padding:"40px 20px" },
  progress: { display:"flex", alignItems:"center", marginBottom:32 },
  progressItem: { display:"flex", alignItems:"center", flex:1 },
  progressDot: { width:28, height:28, borderRadius:"50%", background:"#e5e5e5", color:"#888", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  progressDotActive: { background:"#1a1a1a", color:"#fff" },
  progressLabel: { fontSize:12, color:"#aaa", marginLeft:8, whiteSpace:"nowrap" },
  progressLabelActive: { color:"#1a1a1a", fontWeight:500 },
  progressLine: { flex:1, height:1, background:"#e5e5e5", margin:"0 8px" },
  progressLineActive: { background:"#1a1a1a" },
  card: { background:"#fff", borderRadius:16, padding:"32px 28px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" },
  stepTitle: { fontSize:20, fontWeight:600, color:"#1a1a1a", marginBottom:4, marginTop:0 },
  stepSub: { fontSize:14, color:"#888", marginBottom:28, marginTop:0 },
  fields: {},
  label: { display:"block", fontSize:13, fontWeight:500, color:"#444", marginBottom:6 },
  input: { width:"100%", border:"1px solid #e5e5e5", borderRadius:8, padding:"10px 12px", fontSize:14, color:"#1a1a1a", background:"#fafafa", boxSizing:"border-box", outline:"none" },
  error: { background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, padding:"8px 12px", fontSize:13, color:"#dc2626", marginTop:16 },
  navRow: { display:"flex", marginTop:28, gap:12 },
  btnPrimary: { background:"#1a1a1a", color:"#fff", border:"none", borderRadius:8, padding:"11px 24px", fontSize:14, fontWeight:500, cursor:"pointer" },
  btnSecondary: { background:"#fff", color:"#444", border:"1px solid #e5e5e5", borderRadius:8, padding:"11px 24px", fontSize:14, cursor:"pointer" },
  toggleRow: { display:"flex", alignItems:"center", gap:10, cursor:"pointer" },
  toggleTrack: { width:38, height:22, borderRadius:11, position:"relative", transition:"background .2s", flexShrink:0, cursor:"pointer" },
  toggleThumb: { position:"absolute", top:2, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"transform .2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" },
  toggleLabel: { fontSize:13, color:"#444" },
}
