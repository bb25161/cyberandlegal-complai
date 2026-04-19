import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
        <div style={s.welcome}>
          <h1 style={s.welcomeTitle}>AI Risk Değerlendirmesi</h1>
          <p style={s.welcomeSub}>ISO 31000 · NIST AI RMF · EU AI Act metodolojisi ile AI sisteminizin risk profilini analiz edin.</p>
        </div>

        <div style={s.startCard} onClick={() => navigate("/assessment")}>
          <div style={s.startIcon}>+</div>
          <div>
            <div style={s.startTitle}>Yeni değerlendirme başlat</div>
            <div style={s.startSub}>4 adımda tamamlanır, ~5 dakika</div>
          </div>
          <div style={s.startArrow}>→</div>
        </div>

        <div style={s.infoGrid}>
          <InfoCard icon="⚖" title="EU AI Act" text="Ağustos 2026'da yürürlüğe giren yükümlülüklerinizi öğrenin" />
          <InfoCard icon="🛡" title="NIST AI RMF" text="Risk yönetimi çerçevesi ile sisteminizi değerlendirin" />
          <InfoCard icon="📋" title="ISO 42001" text="AI yönetim sistemi sertifikasyon hazırlığı" />
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, text }) {
  return (
    <div style={s.infoCard}>
      <div style={s.infoIcon}>{icon}</div>
      <div style={s.infoTitle}>{title}</div>
      <div style={s.infoText}>{text}</div>
    </div>
  )
}

const s = {
  page: { minHeight:"100vh", background:"#f8f7f4" },
  header: { background:"#fff", borderBottom:"1px solid #eee", padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" },
  brand: { fontSize:16, fontWeight:600, color:"#1a1a1a" },
  headerRight: { display:"flex", alignItems:"center", gap:16 },
  userEmail: { fontSize:13, color:"#888" },
  logoutBtn: { border:"1px solid #e5e5e5", background:"#fff", borderRadius:6, padding:"5px 12px", fontSize:13, cursor:"pointer", color:"#444" },
  container: { maxWidth:720, margin:"0 auto", padding:"40px 20px" },
  welcome: { marginBottom:32 },
  welcomeTitle: { fontSize:28, fontWeight:700, color:"#1a1a1a", marginBottom:8, marginTop:0 },
  welcomeSub: { fontSize:15, color:"#666", lineHeight:1.6, marginTop:0 },
  startCard: { background:"#1a1a1a", borderRadius:16, padding:"24px 28px", display:"flex", alignItems:"center", gap:20, cursor:"pointer", marginBottom:24, transition:"opacity .15s" },
  startIcon: { width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:24, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  startTitle: { fontSize:16, fontWeight:600, color:"#fff", marginBottom:4 },
  startSub: { fontSize:13, color:"rgba(255,255,255,0.6)" },
  startArrow: { marginLeft:"auto", fontSize:20, color:"rgba(255,255,255,0.4)" },
  infoGrid: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 },
  infoCard: { background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"20px" },
  infoIcon: { fontSize:24, marginBottom:10 },
  infoTitle: { fontSize:14, fontWeight:600, color:"#1a1a1a", marginBottom:6 },
  infoText: { fontSize:13, color:"#888", lineHeight:1.5 },
}
