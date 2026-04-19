import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useT } from "../lib/i18n"

export default function DashboardPage({ lang = "en", onToggleLang }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const t = useT(lang)

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.brand}>
          Cyber<span style={s.brandAmp}>&</span>Legal <span style={s.brandLab}>Lab</span>
        </span>
        <div style={s.headerRight}>
          <button style={s.langBtn} onClick={onToggleLang}>{t("nav_lang")}</button>
          <span style={s.userEmail}>{user?.email}</span>
          <button style={s.logoutBtn} onClick={logout}>{t("nav_logout")}</button>
        </div>
      </header>

      <div style={s.container}>
        <div style={s.hero}>
          <div style={s.heroBadge}>Beta</div>
          <h1 style={s.heroTitle}>{t("dash_title")}</h1>
          <p style={s.heroSub}>{t("dash_sub")}</p>
        </div>

        {/* Start card */}
        <div style={s.startCard} onClick={() => navigate("/assessment")} role="button" tabIndex={0}
          onKeyDown={e => e.key === "Enter" && navigate("/assessment")}>
          <div style={s.startIconWrap}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={s.startText}>
            <div style={s.startTitle}>{t("dash_new")}</div>
            <div style={s.startSub}>{t("dash_new_sub")}</div>
          </div>
          <div style={s.startArrow}>→</div>
        </div>

        {/* Framework pills */}
        <div style={s.frameworkRow}>
          <FrameworkCard
            color="#7c6af7"
            icon="⚖"
            title={t("dash_euai")}
            sub={t("dash_euai_sub")}
          />
          <FrameworkCard
            color="#0ea5e9"
            icon="🛡"
            title={t("dash_nist")}
            sub={t("dash_nist_sub")}
          />
          <FrameworkCard
            color="#10b981"
            icon="🔎"
            title={t("dash_owasp")}
            sub={t("dash_owasp_sub")}
          />
        </div>

        {/* Steps preview */}
        <div style={s.stepsCard}>
          <div style={s.stepsLabel}>{lang === "tr" ? "Değerlendirme süreci" : "Assessment process"}</div>
          <div style={s.stepsList}>
            {(lang === "tr" ? [
              ["✦", "AB Hukuki Tarama", "7 resmi kontrol · AB AI Act karar ağacı"],
              ["1", "AI Sisteminiz", "Organizasyon, sektör, kullanım amacı"],
              ["2", "Olası Zararlar", "Zarar türü, şiddet, savunmasız gruplar"],
              ["3", "Risk Faktörleri", "Olay geçmişi, dağıtım kapsamı"],
              ["4", "Önlemler", "İnsan denetimi, kayıt, önyargı testi"],
              ["5", "Model Testi", "OWASP, COMPL-AI, LM Eval motorları"],
            ] : [
              ["✦", "EU Legal Screening", "7 official checks · EU AI Act decision tree"],
              ["1", "About your AI", "Organisation, sector, use case"],
              ["2", "Potential harms", "Harm type, severity, vulnerable groups"],
              ["3", "Risk factors", "Incident history, deployment scope"],
              ["4", "Safeguards", "Human oversight, logging, bias testing"],
              ["5", "AI model test", "OWASP, COMPL-AI, LM Eval engines"],
            ]).map(([num, title, sub]) => (
              <div key={num} style={s.stepRow}>
                <div style={{ ...s.stepNum, ...(num === "✦" ? s.stepNumSpecial : {}) }}>{num}</div>
                <div>
                  <div style={s.stepTitle}>{title}</div>
                  <div style={s.stepSub}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.disclaimer}>
          {lang === "tr"
            ? "Bu araç tarafından üretilen sonuçlar yalnızca bilgilendirme amaçlıdır ve hukuki tavsiye niteliği taşımaz."
            : "Results produced by this tool are for informational purposes only and do not constitute legal advice."}
        </div>
      </div>
    </div>
  )
}

function FrameworkCard({ color, icon, title, sub }) {
  return (
    <div style={{ ...s.fwCard, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize:18, marginBottom:8 }}>{icon}</div>
      <div style={s.fwTitle}>{title}</div>
      <div style={s.fwSub}>{sub}</div>
    </div>
  )
}

const s = {
  page: { minHeight:"100vh", background:"#f5f4f0" },
  header: { background:"#0f0f0e", padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" },
  brand: { fontSize:15, fontWeight:600, color:"#fff", letterSpacing:"-0.3px" },
  brandAmp: { fontWeight:300, color:"rgba(255,255,255,0.4)" },
  brandLab: { color:"#7c6af7", fontSize:13, fontWeight:500, marginLeft:4 },
  headerRight: { display:"flex", alignItems:"center", gap:12 },
  langBtn: { border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.06)", borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer", color:"rgba(255,255,255,0.7)", fontWeight:700, letterSpacing:"0.05em" },
  userEmail: { fontSize:12, color:"rgba(255,255,255,0.35)" },
  logoutBtn: { border:"1px solid rgba(255,255,255,0.1)", background:"transparent", borderRadius:6, padding:"4px 12px", fontSize:12, cursor:"pointer", color:"rgba(255,255,255,0.5)" },

  container: { maxWidth:680, margin:"0 auto", padding:"48px 24px 64px" },

  hero: { marginBottom:32 },
  heroBadge: { display:"inline-block", background:"#eeedfe", color:"#534ab7", fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:14 },
  heroTitle: { fontSize:30, fontWeight:700, color:"#0f0f0e", margin:"0 0 10px", letterSpacing:"-0.6px", lineHeight:1.2 },
  heroSub: { fontSize:15, color:"#666", margin:0, lineHeight:1.6 },

  startCard: { background:"#0f0f0e", borderRadius:14, padding:"22px 26px", display:"flex", alignItems:"center", gap:18, cursor:"pointer", marginBottom:20, transition:"opacity .15s" },
  startIconWrap: { width:40, height:40, borderRadius:"50%", background:"rgba(124,106,247,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  startText: { flex:1 },
  startTitle: { fontSize:15, fontWeight:600, color:"#fff", marginBottom:3 },
  startSub: { fontSize:12, color:"rgba(255,255,255,0.5)" },
  startArrow: { fontSize:18, color:"rgba(255,255,255,0.3)" },

  frameworkRow: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 },
  fwCard: { background:"#fff", borderRadius:10, padding:"16px", border:"1px solid #ebe9e4" },
  fwTitle: { fontSize:13, fontWeight:600, color:"#0f0f0e", marginBottom:4 },
  fwSub: { fontSize:11, color:"#999", lineHeight:1.4 },

  stepsCard: { background:"#fff", borderRadius:14, padding:"20px 24px", border:"1px solid #ebe9e4", marginBottom:20 },
  stepsLabel: { fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:16 },
  stepsList: { display:"flex", flexDirection:"column", gap:2 },
  stepRow: { display:"flex", alignItems:"flex-start", gap:14, padding:"10px 0", borderBottom:"1px solid #f5f3ef" },
  stepNum: { width:24, height:24, borderRadius:"50%", background:"#e8e6e0", color:"#666", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 },
  stepNumSpecial: { background:"#eeedfe", color:"#7c6af7", fontSize:10 },
  stepTitle: { fontSize:13, fontWeight:500, color:"#0f0f0e", marginBottom:2 },
  stepSub: { fontSize:11, color:"#999" },

  disclaimer: { fontSize:11.5, color:"#bbb", textAlign:"center", lineHeight:1.6 },
}
