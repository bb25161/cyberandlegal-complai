import { useState, useEffect, useRef, useMemo } from "react"

// ── Jurisdiction Data (inline) ──────────────────────────────────────────────

const REGULATIONS = {
  EU_AI_ACT: { id:"EU_AI_ACT", name:"EU AI Act", enforcer:"European Commission", enforcement_date:"Aug 2026", status:"active", risk:"high", penalty:"Up to 7% global revenue", obligations:["Risk classification (Art. 6)","Human oversight (Art. 14)","Transparency (Art. 13)","Conformity assessment (Art. 43)"] },
  UK_AI: { id:"UK_AI", name:"UK AI Framework", enforcer:"DSIT / FCA / ICO", enforcement_date:"In force", status:"active", risk:"medium", penalty:"Sector-specific", obligations:["Safety & security","Transparency","Fairness","Accountability"] },
  MAS_FEAT: { id:"MAS_FEAT", name:"MAS FEAT (Singapore)", enforcer:"MAS", enforcement_date:"In force", status:"active", risk:"medium", penalty:"MAS regulatory action", obligations:["Fairness in decisions","Ethics in AI use","Accountability","Transparency"] },
  NIST_AI_RMF: { id:"NIST_AI_RMF", name:"NIST AI RMF", enforcer:"NIST (de facto)", enforcement_date:"In force", status:"active", risk:"low", penalty:"No direct penalty", obligations:["Govern","Map","Measure","Manage"] },
  US_EO_14110: { id:"US_EO_14110", name:"EO 14110 (USA)", enforcer:"Federal Agencies", enforcement_date:"In force", status:"active", risk:"medium", penalty:"Federal procurement risk", obligations:["Safety testing","Watermarking","Privacy-preserving AI"] },
  CHINA_AI: { id:"CHINA_AI", name:"China AI Regulations", enforcer:"CAC / MIIT", enforcement_date:"In force", status:"active", risk:"high", penalty:"¥100k per violation + suspension", obligations:["Content moderation","Algorithm transparency","Data localization"] },
  BRAZIL_LGPD: { id:"BRAZIL_LGPD", name:"Brazil LGPD + AI Bill", enforcer:"ANPD", enforcement_date:"In force", status:"active", risk:"medium", penalty:"2% Brazil revenue (max R$50M)", obligations:["Automated decision rights","Human review right","DPIA"] },
  UAE_AI: { id:"UAE_AI", name:"UAE AI Regulation", enforcer:"Ministry of AI", enforcement_date:"In force", status:"active", risk:"medium", penalty:"Sector-specific", obligations:["Ethics compliance","National AI strategy","DIFC/ADGM guidelines"] },
  CANADA_AIDA: { id:"CANADA_AIDA", name:"Canada AIDA (C-27)", enforcer:"ISED Canada", enforcement_date:"Upcoming 2025", status:"draft", risk:"medium", penalty:"Up to CAD 25M or 5% revenue", obligations:["High-impact designation","Risk mitigation","Transparency"] },
  AUSTRALIA_AI: { id:"AUSTRALIA_AI", name:"Australia AI Ethics", enforcer:"DCCEEW / DISR", enforcement_date:"In force", status:"active", risk:"low", penalty:"No direct penalty", obligations:["8 ethics principles (voluntary)"] },
  INDIA_AI: { id:"INDIA_AI", name:"India AI Policy (Draft)", enforcer:"MeitY", enforcement_date:"2024 draft", status:"draft", risk:"medium", penalty:"Under development", obligations:["Consent requirements","Labelling","Intermediary diligence"] },
  JAPAN_AI: { id:"JAPAN_AI", name:"Japan AI Guidelines", enforcer:"Cabinet Office / METI", enforcement_date:"In force", status:"active", risk:"low", penalty:"No direct penalty", obligations:["Voluntary guidelines","Human-centric AI"] },
  SOUTH_KOREA_AI: { id:"SOUTH_KOREA_AI", name:"Korea AI Act (Draft)", enforcer:"MSIT", enforcement_date:"Upcoming", status:"draft", risk:"medium", penalty:"Under development", obligations:["High-risk notification","Transparency","Impact assessment"] },
}

const COUNTRY_REGS = {
  AT:"EU_AI_ACT",BE:"EU_AI_ACT",BG:"EU_AI_ACT",HR:"EU_AI_ACT",CY:"EU_AI_ACT",
  CZ:"EU_AI_ACT",DK:"EU_AI_ACT",EE:"EU_AI_ACT",FI:"EU_AI_ACT",FR:"EU_AI_ACT",
  DE:"EU_AI_ACT",GR:"EU_AI_ACT",HU:"EU_AI_ACT",IE:"EU_AI_ACT",IT:"EU_AI_ACT",
  LV:"EU_AI_ACT",LT:"EU_AI_ACT",LU:"EU_AI_ACT",MT:"EU_AI_ACT",NL:"EU_AI_ACT",
  PL:"EU_AI_ACT",PT:"EU_AI_ACT",RO:"EU_AI_ACT",SK:"EU_AI_ACT",SI:"EU_AI_ACT",
  ES:"EU_AI_ACT",SE:"EU_AI_ACT",NO:"EU_AI_ACT",IS:"EU_AI_ACT",LI:"EU_AI_ACT",
  GB:"UK_AI", SG:"MAS_FEAT", US:"NIST_AI_RMF", CN:"CHINA_AI",
  BR:"BRAZIL_LGPD", AE:"UAE_AI", CA:"CANADA_AIDA", AU:"AUSTRALIA_AI",
  IN:"INDIA_AI", JP:"JAPAN_AI", KR:"SOUTH_KOREA_AI",
}

const COUNTRIES = [
  {code:"EE",name:"Estonia"},{code:"DE",name:"Germany"},{code:"FR",name:"France"},
  {code:"NL",name:"Netherlands"},{code:"IT",name:"Italy"},{code:"ES",name:"Spain"},
  {code:"PL",name:"Poland"},{code:"SE",name:"Sweden"},{code:"BE",name:"Belgium"},
  {code:"AT",name:"Austria"},{code:"DK",name:"Denmark"},{code:"FI",name:"Finland"},
  {code:"PT",name:"Portugal"},{code:"CZ",name:"Czech Republic"},{code:"RO",name:"Romania"},
  {code:"HU",name:"Hungary"},{code:"GR",name:"Greece"},{code:"IE",name:"Ireland"},
  {code:"HR",name:"Croatia"},{code:"SK",name:"Slovakia"},{code:"BG",name:"Bulgaria"},
  {code:"LT",name:"Lithuania"},{code:"LV",name:"Latvia"},{code:"SI",name:"Slovenia"},
  {code:"CY",name:"Cyprus"},{code:"LU",name:"Luxembourg"},{code:"MT",name:"Malta"},
  {code:"NO",name:"Norway"},{code:"IS",name:"Iceland"},{code:"LI",name:"Liechtenstein"},
  {code:"GB",name:"United Kingdom"},{code:"SG",name:"Singapore"},{code:"US",name:"United States"},
  {code:"CN",name:"China"},{code:"BR",name:"Brazil"},{code:"AE",name:"UAE"},
  {code:"CA",name:"Canada"},{code:"AU",name:"Australia"},{code:"IN",name:"India"},
  {code:"JP",name:"Japan"},{code:"KR",name:"South Korea"},{code:"CH",name:"Switzerland"},
  {code:"TR",name:"Turkey"},{code:"IL",name:"Israel"},{code:"ZA",name:"South Africa"},
]

const REG_COLORS = { high:"#E24B4A", medium:"#EF9F27", low:"#1D9E75", draft:"#888780" }
const REG_BG = { high:"#FCEBEB", medium:"#FAEEDA", low:"#E1F5EE", draft:"#F1EFE8" }
const REG_TEXT = { high:"#A32D2D", medium:"#854F0B", low:"#085041", draft:"#444441" }

const RISK_OPTIONS = [
  { key:"rt_stop", label:"Stop", desc:"Halt system — manually review every affected case", info:"EU AI Act Art. 14 · NIST GOVERN 1.3", infoDetail:"Strongest control posture. Required for life-changing decisions. Needs robust audit logging.", badge:"🔒 Strongest" },
  { key:"rt_escalate", label:"Escalate", desc:"Flag affected person for human review before any action", info:"EU AI Act Art. 14 · ISO 31000", infoDetail:"Good practice for high-criticality systems. Requires documented escalation paths.", badge:"✓ Strong" },
  { key:"rt_sample", label:"Sample", desc:"Investigate proportion of errors — act if threshold exceeded", info:"NIST MEASURE 2.5", infoDetail:"Acceptable for lower-risk systems. Define and document your error threshold.", badge:"~ Medium" },
  { key:"rt_monitor", label:"Monitor", desc:"Track performance trends — intervene if quality degrades", info:"NIST MANAGE 2.2", infoDetail:"Weakest posture. Acceptable only for minimal-risk, no individual-impact applications.", badge:"⚠ Weakest" },
]

const SEC_OPTIONS = [
  { key:"sec_zero", label:"Zero tolerance", desc:"One incident → immediate shutdown + full independent audit", info:"ISO 27001 · NIST CSF · EU AI Act Art. 62", infoDetail:"Best practice. Required posture for healthcare, finance, and critical infrastructure.", badge:"🔒 Best practice" },
  { key:"sec_low", label:"Low tolerance", desc:"Any incident → formal review, system paused", info:"EU AI Act Art. 62 · GDPR Art. 33", infoDetail:"Strong posture. Formal review process must be documented and regularly tested.", badge:"✓ Strong" },
  { key:"sec_medium", label:"Standard process", desc:"Follow standard incident response, report as required", info:"Sector-specific breach notification laws", infoDetail:"Acceptable for medium-risk systems. Review incident response plan annually.", badge:"~ Standard" },
  { key:"sec_high", label:"Managed risk", desc:"Incidents expected in production — manage as they arise", info:"ENISA threat landscape", infoDetail:"High tolerance increases attack surface. Regulatory exposure risk in regulated sectors.", badge:"⚠ Exposure risk" },
]

// ── InfoBubble ──────────────────────────────────────────────────────────────

function InfoBubble({ text, detail }) {
  const [open, setOpen] = useState(false)
  return (
    <span style={{ position:"relative", display:"inline-block", marginLeft:6 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:16, height:16, borderRadius:"50%", border:"1px solid var(--color-border-secondary)", background:"var(--color-background-secondary)", cursor:"pointer", fontSize:10, color:"var(--color-text-secondary)", lineHeight:"14px", padding:0, display:"inline-flex", alignItems:"center", justifyContent:"center" }}
      >i</button>
      {open && (
        <div style={{ position:"absolute", left:20, top:0, zIndex:50, background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-secondary)", borderRadius:8, padding:"10px 12px", width:260, boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--color-text-primary)", marginBottom:4 }}>{text}</div>
          <div style={{ fontSize:11, color:"var(--color-text-secondary)", lineHeight:1.5 }}>{detail}</div>
          <button onClick={() => setOpen(false)} style={{ marginTop:6, fontSize:10, color:"var(--color-text-tertiary)", background:"none", border:"none", cursor:"pointer", padding:0 }}>Close</button>
        </div>
      )}
    </span>
  )
}

// ── Radio Option with (i) ───────────────────────────────────────────────────

function RadioOption({ option, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(option.key)}
      style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", borderRadius:8, border:`1.5px solid ${selected ? "#7c6af7" : "var(--color-border-tertiary)"}`, background: selected ? "#f0effe" : "var(--color-background-primary)", cursor:"pointer", marginBottom:8, transition:"all .15s" }}
    >
      <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${selected ? "#7c6af7" : "var(--color-border-secondary)"}`, background: selected ? "#7c6af7" : "transparent", flexShrink:0, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {selected && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }} />}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <span style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)" }}>{option.label}</span>
          <span style={{ fontSize:10, padding:"2px 6px", borderRadius:4, background:"var(--color-background-secondary)", color:"var(--color-text-secondary)" }}>{option.badge}</span>
          <InfoBubble text={option.info} detail={option.infoDetail} />
        </div>
        <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>{option.desc}</div>
      </div>
    </div>
  )
}

// ── Applicable Laws Panel ───────────────────────────────────────────────────

function ApplicableLaws({ laws }) {
  const [expanded, setExpanded] = useState(null)
  if (!laws.length) return (
    <div style={{ padding:"20px", textAlign:"center", color:"var(--color-text-tertiary)", fontSize:13, background:"var(--color-background-secondary)", borderRadius:10, border:"0.5px solid var(--color-border-tertiary)" }}>
      Select your countries above to see applicable regulations
    </div>
  )
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {laws.map(law => {
        const reg = REGULATIONS[law]
        if (!reg) return null
        const isExp = expanded === law
        return (
          <div key={law} style={{ border:`0.5px solid ${REG_COLORS[reg.risk]}`, borderRadius:10, overflow:"hidden", background:REG_BG[reg.risk] }}>
            <div onClick={() => setExpanded(isExp ? null : law)} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:REG_COLORS[reg.risk], flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:REG_TEXT[reg.risk] }}>{reg.name}</div>
                <div style={{ fontSize:11, color:REG_TEXT[reg.risk], opacity:0.7 }}>{reg.enforcer} · {reg.enforcement_date}</div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {reg.status === "draft" && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:4, background:"rgba(0,0,0,0.08)", color:REG_TEXT[reg.risk] }}>Draft</span>}
                <span style={{ fontSize:11, color:REG_TEXT[reg.risk], opacity:0.7 }}>{isExp ? "▲" : "▼"}</span>
              </div>
            </div>
            {isExp && (
              <div style={{ padding:"0 14px 14px", borderTop:`0.5px solid ${REG_COLORS[reg.risk]}30` }}>
                <div style={{ fontSize:11, color:REG_TEXT[reg.risk], marginBottom:6, marginTop:8 }}>Max penalty: <strong>{reg.penalty}</strong></div>
                <div style={{ fontSize:11, color:REG_TEXT[reg.risk], marginBottom:4 }}>Key obligations:</div>
                {reg.obligations.map((o,i) => (
                  <div key={i} style={{ fontSize:11, color:REG_TEXT[reg.risk], opacity:0.85, padding:"2px 0 2px 10px", borderLeft:`2px solid ${REG_COLORS[reg.risk]}60` }}>
                    {o}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Country Selector ────────────────────────────────────────────────────────

function CountrySelector({ label, value, onChange, multi, hint }) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0,8)

  const toggle = (code) => {
    if (multi) {
      onChange(value.includes(code) ? value.filter(c => c !== code) : [...value, code])
    } else {
      onChange(code)
      setOpen(false)
      setSearch("")
    }
  }

  const displayValue = multi
    ? value.length === 0 ? "Select countries..." : value.map(c => COUNTRIES.find(x=>x.code===c)?.name).join(", ")
    : value ? COUNTRIES.find(c=>c.code===value)?.name : "Select country..."

  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", display:"block", marginBottom:4 }}>{label}</label>
      {hint && <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginBottom:6, lineHeight:1.5 }}>{hint}</div>}
      <div style={{ position:"relative" }}>
        <div onClick={() => setOpen(o=>!o)} style={{ border:"1.5px solid var(--color-border-secondary)", borderRadius:8, padding:"9px 12px", fontSize:13, color: (!multi&&value)||(multi&&value.length) ? "var(--color-text-primary)" : "var(--color-text-tertiary)", cursor:"pointer", background:"var(--color-background-primary)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayValue}</span>
          <span style={{ flexShrink:0, marginLeft:8 }}>▾</span>
        </div>
        {open && (
          <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-secondary)", borderRadius:8, zIndex:100, boxShadow:"0 4px 16px rgba(0,0,0,0.1)", overflow:"hidden" }}>
            <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ width:"100%", padding:"9px 12px", border:"none", borderBottom:"0.5px solid var(--color-border-tertiary)", fontSize:13, background:"var(--color-background-secondary)", boxSizing:"border-box", outline:"none" }} />
            <div style={{ maxHeight:200, overflowY:"auto" }}>
              {filtered.map(c => {
                const isSel = multi ? value.includes(c.code) : value === c.code
                const regId = COUNTRY_REGS[c.code]
                const reg = REGULATIONS[regId]
                return (
                  <div key={c.code} onClick={() => toggle(c.code)} style={{ padding:"8px 12px", fontSize:13, cursor:"pointer", background: isSel ? "#f0effe" : "transparent", display:"flex", alignItems:"center", gap:8 }}>
                    {multi && <div style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${isSel ? "#7c6af7" : "var(--color-border-secondary)"}`, background: isSel ? "#7c6af7" : "transparent", flexShrink:0 }} />}
                    <span style={{ flex:1 }}>{c.name}</span>
                    {reg && <span style={{ fontSize:10, padding:"1px 5px", borderRadius:3, background:REG_BG[reg.risk], color:REG_TEXT[reg.risk] }}>{reg.name.split(" ")[0]} {reg.name.split(" ")[1]}</span>}
                  </div>
                )
              })}
              {filtered.length === 0 && <div style={{ padding:"12px", fontSize:12, color:"var(--color-text-tertiary)" }}>No results</div>}
            </div>
            {multi && <div onClick={() => { setOpen(false); setSearch("") }} style={{ padding:"8px 12px", borderTop:"0.5px solid var(--color-border-tertiary)", fontSize:12, color:"#7c6af7", cursor:"pointer", textAlign:"center" }}>Done ({value.length} selected)</div>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function JurisdictionStep({ form, set, lang = "en" }) {
  const registeredCountry = form.registered_country || ""
  const servedCountries = form.served_countries || []
  const role = form.role || ""
  const riskTolerance = form.risk_tolerance || ""
  const secTolerance = form.security_tolerance || ""

  const applicableLaws = useMemo(() => {
    const ids = new Set()
    if (registeredCountry && COUNTRY_REGS[registeredCountry]) ids.add(COUNTRY_REGS[registeredCountry])
    servedCountries.forEach(c => { if (COUNTRY_REGS[c]) ids.add(COUNTRY_REGS[c]) })
    return Array.from(ids).sort((a,b) => {
      const o = {high:0, medium:1, low:2}
      return (o[REGULATIONS[a]?.risk]??2) - (o[REGULATIONS[b]?.risk]??2)
    })
  }, [registeredCountry, servedCountries])

  const ROLES = [
    { key:"provider", label: lang==="tr" ? "Sağlayıcı" : "Provider", desc: lang==="tr" ? "Bu AI sistemini biz geliştirdik" : "We built or trained this AI system", info:"EU AI Act Art. 3(3)", infoDetail:"Primary obligations: conformity assessment, technical documentation, CE marking." },
    { key:"deployer", label: lang==="tr" ? "Dağıtıcı" : "Deployer", desc: lang==="tr" ? "Hazır sistemi kullanıyoruz" : "We use a ready-made AI from a third party", info:"EU AI Act Art. 3(4)", infoDetail:"Must implement human oversight, monitor performance, report serious incidents." },
    { key:"both", label: lang==="tr" ? "Her ikisi" : "Both", desc: lang==="tr" ? "Geliştirdik ve kullanıyoruz" : "We built it and use it ourselves", info:"EU AI Act Art. 3(3) + 3(4)", infoDetail:"Highest compliance burden — both provider and deployer obligations apply." },
    { key:"importer", label: lang==="tr" ? "İthalatçı" : "Importer", desc: lang==="tr" ? "AB dışından getiriyoruz" : "We bring an AI system into the EU market", info:"EU AI Act Art. 3(6)", infoDetail:"Must verify provider compliance before placing the system on the EU market." },
  ]

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

      {/* Company + Role */}
      <div style={{ background:"var(--color-background-primary)", borderRadius:12, border:"0.5px solid var(--color-border-tertiary)", padding:"24px" }}>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:16 }}>
          {lang==="tr" ? "Organizasyon lokasyonu" : "Organisation location"}
        </div>

        <CountrySelector
          label={lang==="tr" ? "Organizasyonunuz nerede tescilli?" : "Where is your organisation registered?"}
          value={registeredCountry}
          onChange={v => set("registered_country", v)}
          multi={false}
          hint={lang==="tr" ? "Tescil ülkeniz birincil düzenleyici yükümlülüklerinizi belirler." : "Your registration country determines your primary regulatory obligations."}
        />

        <CountrySelector
          label={lang==="tr" ? "Bu AI sistemiyle hangi ülkelere hizmet veriyorsunuz?" : "Which countries do you serve with this AI system?"}
          value={servedCountries}
          onChange={v => set("served_countries", v)}
          multi={true}
          hint={lang==="tr" ? "AI sisteminizin etkilediği her ülke düzenleyici yükümlülükler yaratabilir." : "Any country where your AI affects people may create regulatory obligations — even without physical presence."}
        />

        {/* Role */}
        <div style={{ marginBottom:4 }}>
          <label style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", display:"block", marginBottom:4 }}>
            {lang==="tr" ? "Bu AI sistemiyle rolünüz nedir?" : "What is your role with this AI system?"}
          </label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
            {ROLES.map(r => (
              <div key={r.key} onClick={() => set("role", r.key)} style={{ padding:"10px 12px", borderRadius:8, border:`1.5px solid ${role===r.key ? "#7c6af7" : "var(--color-border-tertiary)"}`, background: role===r.key ? "#f0effe" : "var(--color-background-primary)", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:13, fontWeight:500, color: role===r.key ? "#534AB7" : "var(--color-text-primary)" }}>{r.label}</span>
                  <InfoBubble text={r.info} detail={r.infoDetail} />
                </div>
                <div style={{ fontSize:11, color:"var(--color-text-secondary)", marginTop:2 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applicable Laws */}
      <div style={{ background:"var(--color-background-primary)", borderRadius:12, border:"0.5px solid var(--color-border-tertiary)", padding:"24px" }}>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>
          {lang==="tr" ? "Geçerli düzenlemeler" : "Applicable regulations"}
        </div>
        <div style={{ fontSize:12, color:"var(--color-text-tertiary)", marginBottom:16 }}>
          {lang==="tr" ? "Tescil ve hizmet ülkelerinize göre otomatik hesaplandı" : "Auto-calculated from your registration and service countries"}
        </div>
        <ApplicableLaws laws={applicableLaws} />
        {applicableLaws.length > 0 && (
          <div style={{ marginTop:12, fontSize:11, color:"var(--color-text-tertiary)", padding:"8px 10px", background:"var(--color-background-secondary)", borderRadius:6 }}>
            {lang==="tr"
              ? `${applicableLaws.length} düzenleme geçerli. Bu sistem boyunca göz önünde bulundurulacak.`
              : `${applicableLaws.length} regulation${applicableLaws.length>1?"s":""} apply. These will be referenced throughout the assessment.`}
          </div>
        )}
      </div>

      {/* Risk Appetite — Operational */}
      <div style={{ background:"var(--color-background-primary)", borderRadius:12, border:"0.5px solid var(--color-border-tertiary)", padding:"24px" }}>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>
          {lang==="tr" ? "Operasyonel risk iştahı" : "Operational risk appetite"}
        </div>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", marginBottom:4 }}>
          {lang==="tr" ? "Bu AI sistemi yanlış bir karar verdiğinde ne yaparsınız?" : "When this AI system makes a wrong decision, what does your organisation do?"}
        </div>
        <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginBottom:14, lineHeight:1.5 }}>
          {lang==="tr"
            ? "ISO 31000: Risk iştahı, kabul etmeye hazır olduğunuz risk miktarı ve türüdür. NIST MAP 1.5 bunu belgelemenizi gerektirir."
            : "ISO 31000: Risk appetite is the amount and type of risk you are willing to accept. NIST AI RMF MAP 1.5 requires this to be documented."}
        </div>
        {RISK_OPTIONS.map(opt => (
          <RadioOption key={opt.key} option={opt} selected={riskTolerance===opt.key} onSelect={v => set("risk_tolerance", v)} />
        ))}
      </div>

      {/* Risk Appetite — Security */}
      <div style={{ background:"var(--color-background-primary)", borderRadius:12, border:"0.5px solid var(--color-border-tertiary)", padding:"24px" }}>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>
          {lang==="tr" ? "Güvenlik risk iştahı" : "Security risk appetite"}
        </div>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", marginBottom:4 }}>
          {lang==="tr" ? "Bir veri ihlali veya güvenlik olayında organizasyonunuzun tutumu nedir?" : "If this AI system caused a data breach or security incident, what is your organisation's position?"}
        </div>
        <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginBottom:14, lineHeight:1.5 }}>
          {lang==="tr"
            ? "Güvenlik risk iştahı operasyonel risk iştahından farklı olabilir. Finans ve sağlık sektörlerinde genellikle daha düşüktür."
            : "Security risk appetite may differ from operational risk appetite — often stricter in finance, health, and critical infrastructure."}
        </div>
        {SEC_OPTIONS.map(opt => (
          <RadioOption key={opt.key} option={opt} selected={secTolerance===opt.key} onSelect={v => set("security_tolerance", v)} />
        ))}
      </div>

    </div>
  )
}
