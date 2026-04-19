import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth"
import { auth, googleProvider } from "../lib/firebase"

export default function AuthPage() {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      navigate("/dashboard")
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError("")
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate("/dashboard")
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.logoText}>Cyber</span>
          <span style={s.logoAmp}>&</span>
          <span style={s.logoText}>Legal</span>
        </div>
        <p style={s.subtitle}>AI Governance Lab</p>

        <div style={s.tabs}>
          <button style={mode === "login" ? s.tabActive : s.tab} onClick={() => setMode("login")}>Giriş yap</button>
          <button style={mode === "register" ? s.tabActive : s.tab} onClick={() => setMode("register")}>Kayıt ol</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <input
            style={s.input}
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={s.input}
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btnPrimary} type="submit" disabled={loading}>
            {loading ? "Yükleniyor..." : mode === "login" ? "Giriş yap" : "Kayıt ol"}
          </button>
        </form>

        <div style={s.divider}><span style={s.dividerText}>veya</span></div>

        <button style={s.btnGoogle} onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={{marginRight:8}}>
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Google ile devam et
        </button>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    "auth/user-not-found": "Bu e-posta ile kayıtlı kullanıcı yok.",
    "auth/wrong-password": "Şifre hatalı.",
    "auth/email-already-in-use": "Bu e-posta zaten kayıtlı.",
    "auth/weak-password": "Şifre en az 6 karakter olmalı.",
    "auth/invalid-email": "Geçersiz e-posta adresi.",
    "auth/popup-closed-by-user": "Google girişi iptal edildi.",
  }
  return map[code] || "Bir hata oluştu. Lütfen tekrar deneyin."
}

const s = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8f7f4", padding:"20px" },
  card: { background:"#fff", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:400, boxShadow:"0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)" },
  logo: { textAlign:"center", marginBottom:4 },
  logoText: { fontSize:24, fontWeight:600, color:"#1a1a1a", letterSpacing:"-0.5px" },
  logoAmp: { fontSize:24, fontWeight:400, color:"#6b6b6b", margin:"0 2px" },
  subtitle: { textAlign:"center", fontSize:13, color:"#888", marginBottom:28, marginTop:0 },
  tabs: { display:"flex", background:"#f1f0ec", borderRadius:8, padding:3, marginBottom:24 },
  tab: { flex:1, border:"none", background:"transparent", padding:"8px 0", fontSize:13, color:"#666", cursor:"pointer", borderRadius:6, transition:"all .15s" },
  tabActive: { flex:1, border:"none", background:"#fff", padding:"8px 0", fontSize:13, color:"#1a1a1a", fontWeight:500, cursor:"pointer", borderRadius:6, boxShadow:"0 1px 3px rgba(0,0,0,0.1)" },
  form: { display:"flex", flexDirection:"column", gap:10 },
  input: { border:"1px solid #e5e5e5", borderRadius:8, padding:"11px 14px", fontSize:14, outline:"none", color:"#1a1a1a", background:"#fafafa" },
  error: { background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, padding:"8px 12px", fontSize:13, color:"#dc2626" },
  btnPrimary: { background:"#1a1a1a", color:"#fff", border:"none", borderRadius:8, padding:"12px", fontSize:14, fontWeight:500, cursor:"pointer", marginTop:4 },
  divider: { textAlign:"center", margin:"20px 0", position:"relative", borderTop:"1px solid #eee" },
  dividerText: { background:"#fff", padding:"0 12px", fontSize:12, color:"#aaa", position:"relative", top:-10 },
  btnGoogle: { width:"100%", border:"1px solid #e5e5e5", borderRadius:8, padding:"11px", fontSize:14, color:"#1a1a1a", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
}
