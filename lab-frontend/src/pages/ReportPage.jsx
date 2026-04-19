import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useT } from "../lib/i18n"

const LEVEL_CFG = {
  LOW:      { color:"#10b981", bg:"#ecfdf5", label_en:"Low",      label_tr:"Düşük"   },
  MEDIUM:   { color:"#f59e0b", bg:"#fffbeb", label_en:"Medium",   label_tr:"Orta"    },
  HIGH:     { color:"#ef4444", bg:"#fef2f2", label_en:"High",     label_tr:"Yüksek"  },
  CRITICAL: { color:"#7c3aed", bg:"#f5f3ff", label_en:"Critical", label_tr:"Kritik"  },
}

const EU_RISK_CFG = {
  minimal:       { color:"#22c55e", label_en:"Minimal Risk",          label_tr:"Minimal Risk"          },
  limited:       { color:"#eab308", label_en:"Limited Risk",          label_tr:"Sınırlı Risk"          },
  high:          { color:"#ef4444", label_en:"High Risk",             label_tr:"Yüksek Risk"           },
  gpai:          { color:"#7c3aed", label_en:"GPAI",                  label_tr:"GPAI"                  },
  gpai_systemic: { color:"#d946ef", label_en:"GPAI + Systemic Risk",  label_tr:"GPAI + Sistemik Risk"  },
  prohibited:    { color:"#dc2626", label_en:"Prohibited",            label_tr:"Yasak"                 },
  exempt:        { color:"#22c55e", label_en:"Exempt",                label_tr:"Muaf"                  },
}

const DECISION_CFG = {
  "APPROVED":                  { color:"#10b981", bg:"#ecfdf5", icon:"✓", label_en:"Approved",            label_tr:"Onaylandı"        },
  "APPROVED WITH CONDITIONS":  { color:"#f59e0b", bg:"#fffbeb", icon:"⚠", label_en:"Approved with conditions", label_tr:"Koşullu onay" },
  "CONDITIONAL":               { color:"#f59e0b", bg:"#fffbeb", icon:"⚠", label_en:"Conditional",         label_tr:"Koşullu"          },
  "BLOCKED":                   { color:"#ef4444", bg:"#fef2f2", icon:"✕", label_en:"Blocked",             label_tr:"Engellendi"       },
  "LEGAL REVIEW REQUIRED":     { color:"#7c3aed", bg:"#f5f3ff", icon:"⚖", label_en:"Legal review required", label_tr:"Hukuki inceleme" },
}

function pct(val) {
  if (val == null) return "—"
  return `${((val) * 100).toFixed(0)}%`
}

export default function ReportPage({ lang = "en", onToggleLang }) {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const t = useT(lang)
  const isTR = lang === "tr"

  if (!state?.result) {
    navigate("/")
    return null
  }

  const { result, form } = state
  const exec     = result.executive_summary || {}
  const risk     = result.risk_engine || {}
  const reg      = result.regulatory || {}
  const inherent = risk.inherent_risk || {}
  const residual = risk.residual_risk || {}

  const decisionKey = Object.keys(DECISION_CFG).find(k => exec.recommendation?.toUpperCase().startsWith(k)) || "CONDITIONAL"
  const dc = DECISION_CFG[decisionKey]
  const inhCfg = LEVEL_CFG[inherent.level] || LEVEL_CFG.MEDIUM
  const resCfg = LEVEL_CFG[residual.level] || LEVEL_CFG.MEDIUM

  // EU screening result from form
  const euRiskKey = form?.eu_risk_category || null
  const euRoleFr  = form?.eu_role || null
  const euOblig   = form?.eu_obligations || []

  const euRiskCfg = EU_RISK_CFG[euRiskKey] || null
  const euRoleLabel = { provider:"Provider", deployer:"Deployer", both:"Both", importer:"Importer" }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <span style={s.brand}>Cyber<span style={s.brandAmp}>&</span>Legal <span style={s.brandLab}>Lab</span></span>
        <div style={s.headerRight}>
          <button style={s.langBtn} onClick={onToggleLang}>{t("nav_lang")}</button>
          <span style={s.userEmail}>{user?.email}</span>
          <button style={s.logoutBtn} onClick={logout}>{t("nav_logout")}</button>
        </div>
      </header>

      <div style={s.container}>
        {/* Top row */}
        <div style={s.topRow}>
          <button style={s.backBtn} onClick={() => navigate("/")}>
            ← {isTR ? "Yeni değerlendirme" : "New assessment"}
          </button>
          <span style={s.assessId}>{result.assessment_id}</span>
        </div>

        {/* Decision banner */}
        <div style={{ ...s.decisionBanner, background:dc.bg, borderColor: dc.color + "40" }}>
          <div style={{ ...s.decisionIcon, color:dc.color }}>{dc.icon}</div>
          <div style={s.decisionBody}>
            <div style={{ ...s.decisionLabel, color:dc.color }}>
              {isTR ? dc.label_tr : dc.label_en}
            </div>
            <div style={s.decisionText}>{exec.recommendation}</div>
          </div>
        </div>

        {/* Score cards */}
        <div style={s.scoreGrid}>
          <ScoreCard
            label={isTR ? "Doğal Risk" : "Inherent Risk"}
            level={isTR ? inhCfg.label_tr : inhCfg.label_en}
            score={inherent.score}
            cfg={inhCfg}
          />
          <ScoreCard
            label={isTR ? "Kalan Risk" : "Residual Risk"}
            level={isTR ? resCfg.label_tr : resCfg.label_en}
            score={residual.score}
            cfg={resCfg}
          />
          <div style={s.scoreCard}>
            <div style={s.scoreCardLabel}>{isTR ? "Zorunlu Aksiyon" : "Mandatory Actions"}</div>
            <div style={{ ...s.scoreBig, color:"#0f0f0e" }}>{exec.mandatory_actions_count || 0}</div>
            <div style={s.scoreCardSub}>{isTR ? "adet gerekli" : "required"}</div>
          </div>
        </div>

        {/* EU AI Act profile */}
        {euRiskKey && (
          <div style={s.section}>
            <SectionTitle en="EU AI Act profile" tr="AB Yapay Zeka Yasası profili" isTR={isTR} badge="Screening result" />
            <div style={s.euProfileRow}>
              <div style={s.euProfileCard}>
                <div style={s.euProfileCardLabel}>{isTR ? "Risk kategorisi" : "Risk category"}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background: euRiskCfg?.color || "#aaa" }} />
                  <span style={{ fontSize:16, fontWeight:700, color: euRiskCfg?.color || "#333" }}>
                    {isTR ? euRiskCfg?.label_tr : euRiskCfg?.label_en}
                  </span>
                </div>
              </div>
              <div style={s.euProfileCard}>
                <div style={s.euProfileCardLabel}>{isTR ? "Rolünüz" : "Your role"}</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#0f0f0e", marginTop:6 }}>
                  {euRoleLabel[euRoleFr] || (isTR ? "Belirtilmedi" : "Not specified")}
                </div>
              </div>
            </div>

            {euOblig.length > 0 && (
              <>
                <div style={s.obligTitle}>{isTR ? "Belirlenen yükümlülükler" : "Identified obligations"}</div>
                <div style={s.obligList}>
                  {euOblig.slice(0, 8).map((o, i) => (
                    <div key={i} style={s.obligItem}>
                      <span style={s.obligDot} />
                      <span style={s.obligText}>{o}</span>
                    </div>
                  ))}
                  {euOblig.length > 8 && (
                    <div style={{ fontSize:12, color:"#aaa", paddingLeft:18, marginTop:4 }}>
                      +{euOblig.length - 8} {isTR ? "daha fazla..." : "more..."}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Risk detail */}
        {risk.harm_analysis && (
          <div style={s.section}>
            <SectionTitle en="Risk breakdown" tr="Risk detayları" isTR={isTR} />
            <div style={s.detailGrid}>
              <DetailItem label={isTR ? "Zarar skoru" : "Harm score"} value={pct(risk.harm_analysis.composite_harm_score)} />
              <DetailItem label={isTR ? "Olasılık skoru" : "Likelihood score"} value={pct(risk.likelihood_analysis?.final_score)} />
              <DetailItem label={isTR ? "Kontrol boşluğu" : "Control gap"} value={pct(risk.control_gap?.gap_score)} />
              <DetailItem label={isTR ? "Kontrol etkinliği" : "Control effectiveness"} value={pct(risk.control_gap?.effectiveness_score)} />
            </div>
          </div>
        )}

        {/* Frameworks */}
        {reg.frameworks_triggered?.length > 0 && (
          <div style={s.section}>
            <SectionTitle en="Triggered frameworks" tr="Tetiklenen çerçeveler" isTR={isTR} />
            <div style={s.tagRow}>
              {reg.frameworks_triggered.map(f => <span key={f} style={s.tag}>{f}</span>)}
            </div>
          </div>
        )}

        {/* Mandatory actions */}
        {reg.mandatory_actions?.length > 0 && (
          <div style={s.section}>
            <SectionTitle en="Mandatory actions" tr="Zorunlu aksiyonlar" isTR={isTR} />
            {reg.mandatory_actions.map((a, i) => (
              <div key={i} style={s.actionItem}>
                <span style={s.actionDot} />
                <div>
                  <div style={s.actionText}>{a.action}</div>
                  {a.source && <div style={s.actionSource}>{a.source}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {exec.next_steps?.length > 0 && (
          <div style={s.section}>
            <SectionTitle en="Recommended next steps" tr="Önerilen sonraki adımlar" isTR={isTR} />
            {exec.next_steps.map((step, i) => (
              <div key={i} style={s.actionItem}>
                <div style={s.actionNum}>{i + 1}</div>
                <div style={s.actionText}>{step}</div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={s.footer}>
          <span style={s.footerText}>ISO 31000 · NIST AI RMF · EU AI Act Art. 9</span>
          <span style={s.footerText}>
            {new Date(result.timestamp).toLocaleString(isTR ? "tr-TR" : "en-GB")}
          </span>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ en, tr, isTR, badge }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
      <h3 style={{ fontSize:14, fontWeight:600, color:"#0f0f0e", margin:0 }}>
        {isTR ? tr : en}
      </h3>
      {badge && <span style={{ fontSize:10, fontWeight:600, background:"#eeedfe", color:"#534ab7", padding:"2px 7px", borderRadius:8 }}>{badge}</span>}
    </div>
  )
}

function ScoreCard({ label, level, score, cfg }) {
  return (
    <div style={{ ...s.scoreCard, background:cfg.bg, borderColor: cfg.color + "30" }}>
      <div style={s.scoreCardLabel}>{label}</div>
      <div style={{ ...s.scoreBig, color:cfg.color }}>{level}</div>
      <div style={s.scoreBar}>
        <div style={{ ...s.scoreBarFill, width:`${(score||0)*100}%`, background:cfg.color }} />
      </div>
      <div style={s.scoreCardSub}>{((score||0)*100).toFixed(0)} / 100</div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div style={s.detailItem}>
      <div style={s.detailLabel}>{label}</div>
      <div style={s.detailValue}>{value}</div>
    </div>
  )
}

const s = {
  page: { minHeight:"100vh", background:"#f5f4f0" },
  header: { background:"#0f0f0e", padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
  brand: { fontSize:15, fontWeight:600, color:"#fff", letterSpacing:"-0.3px" },
  brandAmp: { fontWeight:300, color:"rgba(255,255,255,0.4)" },
  brandLab: { color:"#7c6af7", fontSize:13, fontWeight:500, marginLeft:4 },
  headerRight: { display:"flex", alignItems:"center", gap:12 },
  langBtn: { border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.06)", borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer", color:"rgba(255,255,255,0.7)", fontWeight:700, letterSpacing:"0.05em" },
  userEmail: { fontSize:12, color:"rgba(255,255,255,0.35)" },
  logoutBtn: { border:"1px solid rgba(255,255,255,0.1)", background:"transparent", borderRadius:6, padding:"4px 12px", fontSize:12, cursor:"pointer", color:"rgba(255,255,255,0.5)" },

  container: { maxWidth:720, margin:"0 auto", padding:"40px 24px 64px" },
  topRow: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 },
  backBtn: { border:"none", background:"none", fontSize:13, color:"#888", cursor:"pointer", padding:0 },
  assessId: { fontSize:11, color:"#bbb", fontFamily:"monospace" },

  decisionBanner: { borderRadius:14, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:16, border:"1px solid" },
  decisionIcon: { fontSize:26, fontWeight:700, lineHeight:1, flexShrink:0, marginTop:2 },
  decisionBody: {},
  decisionLabel: { fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 },
  decisionText: { fontSize:13, color:"#444", lineHeight:1.6 },

  scoreGrid: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:20 },
  scoreCard: { background:"#fff", border:"1px solid #e8e6e0", borderRadius:12, padding:"18px 16px" },
  scoreCardLabel: { fontSize:11, color:"#999", marginBottom:8, fontWeight:500 },
  scoreBig: { fontSize:20, fontWeight:700, marginBottom:8 },
  scoreBar: { height:3, background:"#eee", borderRadius:2, marginBottom:6, overflow:"hidden" },
  scoreBarFill: { height:"100%", borderRadius:2, transition:"width .6s" },
  scoreCardSub: { fontSize:11, color:"#bbb" },

  section: { background:"#fff", border:"1px solid #e8e6e0", borderRadius:14, padding:"20px 24px", marginBottom:14 },

  euProfileRow: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 },
  euProfileCard: { background:"#f8f7f4", borderRadius:10, padding:"14px 16px" },
  euProfileCardLabel: { fontSize:10, fontWeight:600, color:"#bbb", textTransform:"uppercase", letterSpacing:"0.05em" },
  obligTitle: { fontSize:12, fontWeight:600, color:"#666", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.04em" },
  obligList: { display:"flex", flexDirection:"column", gap:6 },
  obligItem: { display:"flex", gap:10, alignItems:"flex-start" },
  obligDot: { width:5, height:5, borderRadius:"50%", background:"#7c6af7", flexShrink:0, marginTop:6 },
  obligText: { fontSize:12.5, color:"#333", lineHeight:1.5 },

  detailGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
  detailItem: { background:"#f8f7f4", borderRadius:8, padding:"12px 14px" },
  detailLabel: { fontSize:11, color:"#999", marginBottom:4 },
  detailValue: { fontSize:20, fontWeight:700, color:"#0f0f0e" },

  tagRow: { display:"flex", flexWrap:"wrap", gap:8 },
  tag: { background:"#eeedfe", color:"#3c3489", fontSize:11.5, fontWeight:600, padding:"4px 10px", borderRadius:20 },

  actionItem: { display:"flex", alignItems:"flex-start", gap:12, padding:"9px 0", borderBottom:"1px solid #f5f3ef" },
  actionDot: { width:5, height:5, borderRadius:"50%", background:"#0f0f0e", marginTop:7, flexShrink:0 },
  actionNum: { width:20, height:20, borderRadius:"50%", background:"#f0eeea", color:"#666", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 },
  actionText: { fontSize:13, color:"#1a1a1a", lineHeight:1.5, flex:1 },
  actionSource: { fontSize:11, color:"#bbb", marginTop:2 },

  footer: { display:"flex", justifyContent:"space-between", marginTop:28, paddingTop:16, borderTop:"1px solid #e8e6e0" },
  footerText: { fontSize:11, color:"#bbb" },
}
