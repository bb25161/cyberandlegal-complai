import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const LEVEL_CONFIG = {
  LOW:      { color:"#10b981", bg:"#ecfdf5", label:"Düşük" },
  MEDIUM:   { color:"#f59e0b", bg:"#fffbeb", label:"Orta" },
  HIGH:     { color:"#ef4444", bg:"#fef2f2", label:"Yüksek" },
  CRITICAL: { color:"#7c3aed", bg:"#f5f3ff", label:"Kritik" },
}

const DECISION_CONFIG = {
  APPROVED:                 { color:"#10b981", bg:"#ecfdf5", icon:"✓", label:"Onaylandı" },
  "APPROVED WITH CONDITIONS":{ color:"#f59e0b", bg:"#fffbeb", icon:"⚠", label:"Koşullu onay" },
  CONDITIONAL:              { color:"#f59e0b", bg:"#fffbeb", icon:"⚠", label:"Koşullu" },
  BLOCKED:                  { color:"#ef4444", bg:"#fef2f2", icon:"✗", label:"Engellendi" },
  "LEGAL REVIEW REQUIRED":  { color:"#7c3aed", bg:"#f5f3ff", icon:"⚖", label:"Hukuki inceleme" },
}

export default function ReportPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  if (!state?.result) {
    navigate("/dashboard")
    return null
  }

  const { result } = state
  const exec      = result.executive_summary || {}
  const risk      = result.risk_engine || {}
  const reg       = result.regulatory || {}
  const inherent  = risk.inherent_risk || {}
  const residual  = risk.residual_risk || {}

  const decisionKey = Object.keys(DECISION_CONFIG).find(k => exec.recommendation?.startsWith(k)) || "CONDITIONAL"
  const dc = DECISION_CONFIG[decisionKey]
  const inhCfg = LEVEL_CONFIG[inherent.level] || LEVEL_CONFIG.MEDIUM
  const resCfg = LEVEL_CONFIG[residual.level] || LEVEL_CONFIG.MEDIUM

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
        <div style={s.topRow}>
          <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Yeni değerlendirme</button>
          <span style={s.assessId}>{result.assessment_id}</span>
        </div>

        {/* Karar kartı */}
        <div style={{ ...s.decisionCard, background: dc.bg, border: `1px solid ${dc.color}33` }}>
          <div style={{ ...s.decisionIcon, color: dc.color }}>{dc.icon}</div>
          <div>
            <div style={{ ...s.decisionLabel, color: dc.color }}>{dc.label}</div>
            <div style={s.decisionText}>{exec.recommendation}</div>
          </div>
        </div>

        {/* Risk skorları */}
        <div style={s.scoreGrid}>
          <ScoreCard label="Doğal Risk" level={inherent.level} score={inherent.score} cfg={inhCfg} />
          <ScoreCard label="Kalan Risk" level={residual.level} score={residual.score} cfg={resCfg} />
          <div style={s.scoreCard}>
            <div style={s.scoreCardLabel}>Zorunlu Aksiyon</div>
            <div style={{ ...s.scoreBig, color:"#1a1a1a" }}>{exec.mandatory_actions_count || 0}</div>
            <div style={s.scoreCardSub}>adet aksiyon gerekli</div>
          </div>
        </div>

        {/* Risk detayları */}
        {risk.harm_analysis && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Risk detayları</h3>
            <div style={s.detailGrid}>
              <DetailItem label="Zarar skoru" value={pct(risk.harm_analysis.composite_harm_score)} />
              <DetailItem label="Olasılık skoru" value={pct(risk.likelihood_analysis?.final_score)} />
              <DetailItem label="Kontrol boşluğu" value={pct(risk.control_gap?.gap_score)} />
              <DetailItem label="Kontrol etkinliği" value={pct(risk.control_gap?.effectiveness_score)} />
            </div>
          </div>
        )}

        {/* Regülasyon */}
        {reg.frameworks_triggered?.length > 0 && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Tetiklenen çerçeveler</h3>
            <div style={s.tagRow}>
              {reg.frameworks_triggered.map(f => (
                <span key={f} style={s.tag}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Zorunlu aksiyonlar */}
        {reg.mandatory_actions?.length > 0 && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Zorunlu aksiyonlar</h3>
            {reg.mandatory_actions.map((a, i) => (
              <div key={i} style={s.actionItem}>
                <span style={s.actionDot} />
                <div>
                  <div style={s.actionText}>{a.action}</div>
                  <div style={s.actionSource}>{a.source}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metodoloji */}
        <div style={s.footer}>
          <span style={s.footerText}>ISO 31000 · NIST AI RMF · EU AI Act Art. 9</span>
          <span style={s.footerText}>{new Date(result.timestamp).toLocaleString("tr-TR")}</span>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ label, level, score, cfg }) {
  return (
    <div style={{ ...s.scoreCard, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
      <div style={s.scoreCardLabel}>{label}</div>
      <div style={{ ...s.scoreBig, color: cfg.color }}>{cfg.label}</div>
      <div style={s.scoreBar}>
        <div style={{ ...s.scoreBarFill, width: `${(score || 0) * 100}%`, background: cfg.color }} />
      </div>
      <div style={s.scoreCardSub}>{((score || 0) * 100).toFixed(0)} / 100</div>
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

function pct(val) {
  if (val == null) return "—"
  return `%${(val * 100).toFixed(0)}`
}

const s = {
  page: { minHeight:"100vh", background:"#f8f7f4" },
  header: { background:"#fff", borderBottom:"1px solid #eee", padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" },
  brand: { fontSize:16, fontWeight:600, color:"#1a1a1a" },
  headerRight: { display:"flex", alignItems:"center", gap:16 },
  userEmail: { fontSize:13, color:"#888" },
  logoutBtn: { border:"1px solid #e5e5e5", background:"#fff", borderRadius:6, padding:"5px 12px", fontSize:13, cursor:"pointer", color:"#444" },
  container: { maxWidth:720, margin:"0 auto", padding:"40px 20px" },
  topRow: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 },
  backBtn: { border:"none", background:"none", fontSize:14, color:"#666", cursor:"pointer", padding:0 },
  assessId: { fontSize:12, color:"#aaa", fontFamily:"monospace" },
  decisionCard: { borderRadius:12, padding:"20px 24px", marginBottom:24, display:"flex", alignItems:"flex-start", gap:16 },
  decisionIcon: { fontSize:28, fontWeight:700, lineHeight:1, flexShrink:0 },
  decisionLabel: { fontSize:13, fontWeight:600, marginBottom:4 },
  decisionText: { fontSize:13, color:"#444", lineHeight:1.5 },
  scoreGrid: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:24 },
  scoreCard: { background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"20px 16px" },
  scoreCardLabel: { fontSize:12, color:"#888", marginBottom:8 },
  scoreBig: { fontSize:22, fontWeight:700, marginBottom:8 },
  scoreBar: { height:4, background:"#eee", borderRadius:2, marginBottom:6, overflow:"hidden" },
  scoreBarFill: { height:"100%", borderRadius:2, transition:"width .5s" },
  scoreCardSub: { fontSize:11, color:"#aaa" },
  section: { background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"20px 24px", marginBottom:16 },
  sectionTitle: { fontSize:14, fontWeight:600, color:"#1a1a1a", marginBottom:16, marginTop:0 },
  detailGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  detailItem: { background:"#f8f7f4", borderRadius:8, padding:"12px 14px" },
  detailLabel: { fontSize:11, color:"#888", marginBottom:4 },
  detailValue: { fontSize:18, fontWeight:600, color:"#1a1a1a" },
  tagRow: { display:"flex", flexWrap:"wrap", gap:8 },
  tag: { background:"#eeedfe", color:"#3c3489", fontSize:12, fontWeight:500, padding:"4px 10px", borderRadius:20 },
  actionItem: { display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:"1px solid #f0f0f0" },
  actionDot: { width:6, height:6, borderRadius:"50%", background:"#1a1a1a", marginTop:5, flexShrink:0 },
  actionText: { fontSize:13, color:"#1a1a1a" },
  actionSource: { fontSize:11, color:"#aaa", marginTop:2 },
  footer: { display:"flex", justifyContent:"space-between", marginTop:24, padding:"16px 0", borderTop:"1px solid #eee" },
  footerText: { fontSize:11, color:"#aaa" },
}
