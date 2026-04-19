import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./hooks/useAuth"
import AuthPage from "./pages/AuthPage"
import DashboardPage from "./pages/DashboardPage"
import AssessmentPage from "./pages/AssessmentPage"
import ReportPage from "./pages/ReportPage"

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:"#666", fontSize:14 }}>Loading…</div>
  return user ? children : <Navigate to="/auth" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

function AppRoutes() {
  const [lang, setLang] = useState("en")
  const toggleLang = () => setLang(l => l === "en" ? "tr" : "en")

  return (
    <Routes>
      <Route path="/auth" element={
        <PublicRoute><AuthPage lang={lang} onToggleLang={toggleLang} /></PublicRoute>
      } />
      <Route path="/" element={
        <PrivateRoute><DashboardPage lang={lang} onToggleLang={toggleLang} /></PrivateRoute>
      } />
      <Route path="/assessment" element={
        <PrivateRoute><AssessmentPage lang={lang} onToggleLang={toggleLang} /></PrivateRoute>
      } />
      <Route path="/report" element={
        <PrivateRoute><ReportPage lang={lang} onToggleLang={toggleLang} /></PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
