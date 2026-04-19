/**
 * EUScreening.jsx
 * 
 * Implements the EU AI Act Compliance Checker decision tree (7 checks)
 * as a sequential question flow — each answer unlocks the next question.
 *
 * Props:
 *   lang        — "en" | "tr"
 *   onComplete  — (result: ScreeningResult) => void
 *
 * ScreeningResult:
 *   { status: "out_of_scope" | "exempt" | "prohibited" | "continue",
 *     role, is_gpai, gpai_systemic_risk, risk_category, obligations: [] }
 */

import { useState } from "react"

const T = {
  en: {
    title:  "EU AI Act Screening",
    sub:    "We follow the official Compliance Checker methodology (7 checks) to determine your obligations before the risk assessment.",
    disclaimer: "This screening is for informational purposes only and does not constitute legal advice. Results do not represent an official assessment by the European Commission.",
    check:  (n, total) => `Check ${n} of ${total}`,
    yes: "Yes", no: "No",
    back: "← Back",
    continue: "Continue to assessment →",

    // Check 1
    c1_title: "Is this an AI system?",
    c1_body:  "Does the system operate with autonomy or minimal human intervention, producing outputs — predictions, content, recommendations, or decisions — based on inputs it receives? Traditional rule-based software that only executes explicit instructions does not qualify.",
    c1_hint:  "Definition aligned with EU AI Act Art. 3(1) and OECD AI Principles.",
    c1_yes: "Yes — it processes inputs and generates outputs with some autonomy",
    c1_no:  "No — it only follows fixed, explicit rules with no autonomous inference",
    c1_result_no: "Out of scope",
    c1_result_no_body: "This system does not meet the EU AI Act definition of an AI system. The regulation does not apply.",
    c1_ref: "Art. 3(1)",

    // Check 2
    c2_title: "Is the system exempt?",
    c2_body:  "Is the system developed or deployed exclusively for one of the following purposes: military, defence or national security; scientific research and development (not yet on the market); or personal non-professional use?",
    c2_hint:  "The EU AI Act deliberately excludes these areas to avoid restricting national security prerogatives and free scientific inquiry.",
    c2_yes: "Yes — it falls under one of these exemption categories",
    c2_no:  "No — it is used in a professional or commercial context",
    c2_result_yes: "Exempt from the EU AI Act",
    c2_result_yes_body: "Your system is outside the scope of the EU AI Act. No formal compliance obligations apply under this regulation.",
    c2_ref: "Art. 2(3)",

    // Check 3
    c3_title: "What is your role in the supply chain?",
    c3_body:  "The EU AI Act assigns obligations asymmetrically depending on your role. Identify the role that best describes your position.",
    c3_hint:  "Obligations are most extensive for Providers and decrease along the supply chain.",
    c3_ref: "Art. 3(3–8), Art. 25",
    c3_opt_provider:   "Provider — I develop, train or place this AI system on the EU market under my own brand",
    c3_opt_deployer:   "Deployer — I use this AI system in my own professional activity (I did not build it)",
    c3_opt_both:       "Both — I built it and deploy it in my own operations",
    c3_opt_importer:   "Importer / Distributor — I bring it into the EU from a third country or distribute it",
    c3_role_notes: {
      provider:  "As a Provider you bear the most extensive obligations: technical documentation, a quality management system, conformity assessment, CE marking, and EU database registration.",
      deployer:  "As a Deployer your primary obligations are: use the system according to instructions, ensure meaningful human oversight, and inform users when required.",
      both:      "Both Provider and Deployer obligations apply to you. The Provider obligations are more extensive and should be addressed first.",
      importer:  "As an Importer or Distributor you must verify the provider's conformity and may need to ensure an EU authorised representative is appointed.",
    },

    // Check 4
    c4_title: "Is the system used for a prohibited practice?",
    c4_body:  "Does the system serve any of the following purposes — any single match is sufficient:",
    c4_hint:  "These practices are incompatible with fundamental rights and are absolutely banned in the EU.",
    c4_ref: "Art. 5",
    c4_items: [
      "Social scoring of individuals by public authorities based on behaviour or personal characteristics",
      "Subliminal, manipulative or deceptive techniques that exploit psychological weaknesses",
      "Exploitation of vulnerability of specific groups (age, disability) to distort behaviour",
      "Untargeted scraping of facial images from the Internet or CCTV to create biometric databases",
      "Emotion inference in the workplace or educational institutions",
      "Real-time remote biometric identification (e.g. facial recognition) in publicly accessible spaces",
      "Predictive policing based solely on profiling or personality assessment",
    ],
    c4_yes: "Yes — the system is used for one or more of these purposes",
    c4_no:  "No — none of these purposes apply",
    c4_result_yes: "Prohibited practice — system cannot be deployed in the EU",
    c4_result_yes_body: "Under Article 5 of the EU AI Act, placing or putting into service this system in the European Union is strictly prohibited. We strongly recommend obtaining legal advice.",

    // Check 5
    c5_title: "Does the system fall under Annex III (High-Risk)?",
    c5_body:  "The system qualifies as high-risk if it is used in any of the following areas listed in Annex III, or if it is a safety component in a product regulated under existing EU product safety legislation (e.g. medical devices, machinery):",
    c5_hint:  "High-risk classification triggers the most demanding compliance obligations.",
    c5_ref: "Art. 6, Annex III",
    c5_items: [
      "Critical infrastructure management (water, electricity, gas, transport, digital)",
      "Education and vocational training (admissions, assessments, student monitoring)",
      "Employment and HR (recruitment, selection, performance evaluation, promotion/dismissal)",
      "Access to essential private and public services (credit scoring, insurance risk, social benefits, emergency services)",
      "Law enforcement (risk assessment of individuals, evidence evaluation, predictive policing)",
      "Migration, asylum and border control (risk assessment, document authentication)",
      "Administration of justice and democratic processes (legal interpretation, elections)",
      "Safety component in a product subject to EU product safety legislation (medical devices, aviation, vehicles, machinery)",
    ],
    c5_yes: "Yes — it is used in one of these areas or is a safety component",
    c5_no:  "No — none of these areas apply",

    // Check 6
    c6_title: "Does the system have limited-risk transparency obligations?",
    c6_body:  "Does the system do any of the following?",
    c6_hint:  "Users have the right to know when they are interacting with AI or consuming AI-generated content.",
    c6_ref: "Art. 50",
    c6_items: [
      "Interact directly with humans as a chatbot or virtual assistant",
      "Generate or manipulate synthetic audio, images, video or text that could be mistaken for real content (deepfakes)",
    ],
    c6_yes: "Yes — at least one applies",
    c6_no:  "No — neither applies",

    // Check 7
    c7_title: "Is this a General-Purpose AI (GPAI) model?",
    c7_body:  "Is the underlying model a general-purpose AI that can perform a wide variety of tasks (e.g. a large language model or foundation model)? If yes: was it trained with compute above 10²⁵ FLOPs (indicating frontier/systemic-risk scale)?",
    c7_hint:  "GPAI providers have additional obligations: copyright compliance summaries and technical capability documentation. Systemic-risk models (frontier scale) must also conduct red-teaming and report serious incidents.",
    c7_ref: "Art. 51–55",
    c7_yes_systemic: "Yes — GPAI with likely systemic risk (frontier-scale training, e.g. GPT-4 class)",
    c7_yes_no_systemic: "Yes — GPAI but no systemic risk (smaller or open-weight model)",
    c7_no:  "No — not a GPAI model",

    // Risk levels
    risk_unacceptable: "Unacceptable (Prohibited)",
    risk_high: "High Risk",
    risk_limited: "Limited Risk",
    risk_minimal: "Minimal Risk",
    risk_gpai: "GPAI",
    risk_gpai_systemic: "GPAI + Systemic Risk",

    // Obligations
    oblig_header: "Key obligations for your profile:",
    oblig_provider_high: [
      "Establish a Quality Management System (QMS) — Art. 17",
      "Prepare full technical documentation — Art. 11 + Annex IV",
      "Conduct a conformity assessment — Art. 43",
      "Affix CE marking and draw up EU Declaration of Conformity — Art. 48",
      "Register in the EU AI Act database — Art. 49",
      "Ensure meaningful human oversight — Art. 14",
      "Implement logging and monitoring — Art. 12",
      "Establish post-market monitoring — Art. 72",
      "Report serious incidents to authorities — Art. 73",
    ],
    oblig_deployer_high: [
      "Use system only according to provider instructions — Art. 26",
      "Ensure meaningful human oversight by trained staff — Art. 26(2)",
      "Perform a fundamental rights impact assessment — Art. 27",
      "Inform users that AI is involved where required — Art. 26(6)",
      "Implement logging with retention ≥ 6 months — Art. 26(5)",
      "Report serious incidents to provider and authorities — Art. 26(5)",
    ],
    oblig_transparency: [
      "Inform users they are interacting with AI (chatbots) — Art. 50(1)",
      "Label AI-generated content / apply watermarking — Art. 50(2)",
    ],
    oblig_gpai: [
      "Publish a summary of training data (copyright compliance) — Art. 53(1)(d)",
      "Prepare and maintain technical documentation of model capabilities — Art. 53",
      "Publish and keep up-to-date a model policy — Art. 53(1)(b)",
    ],
    oblig_gpai_systemic: [
      "All standard GPAI obligations above",
      "Conduct adversarial testing / red-teaming — Art. 55(1)(a)",
      "Report serious incidents to the AI Office within 2 weeks — Art. 55(1)(c)",
      "Implement cybersecurity measures — Art. 55(1)(b)",
      "Ensure energy efficiency documentation — Art. 55(1)(d)",
    ],
    oblig_minimal: [
      "No mandatory obligations under EU AI Act",
      "Voluntary adherence to codes of conduct is encouraged — Art. 95",
    ],

    done_title: "Screening complete",
    done_sub: "Your EU AI Act profile has been determined. The full risk assessment follows.",
  },

  tr: {
    title: "AB AI Act Ön Değerlendirme",
    sub:   "Risk değerlendirmesine geçmeden önce, resmi Uyumluluk Kontrol Aracı metodolojisini (7 kontrol) takip ederek yükümlülüklerinizi belirliyoruz.",
    disclaimer: "Bu değerlendirme yalnızca bilgilendirme amaçlıdır ve hukuki tavsiye niteliği taşımaz. Sonuçlar Avrupa Komisyonu'nun resmi değerlendirmesini temsil etmez.",
    check: (n, total) => `Kontrol ${n} / ${total}`,
    yes: "Evet", no: "Hayır",
    back: "← Geri",
    continue: "Değerlendirmeye devam →",

    c1_title: "Bu bir yapay zeka sistemi mi?",
    c1_body:  "Sistem, aldığı girdilere dayanarak özerk veya minimum insan müdahalesiyle tahminler, içerik, tavsiyeler veya kararlar üretiyor mu? Yalnızca sabit kurallara göre çalışan geleneksel yazılımlar bu kapsama girmez.",
    c1_hint:  "AB Yapay Zeka Yasası Madde 3(1) ve OECD AI ilkeleriyle uyumlu tanım.",
    c1_yes: "Evet — girdileri işliyor ve belirli bir özerklikle çıktılar üretiyor",
    c1_no:  "Hayır — yalnızca sabit, açık kurallara göre çalışıyor, özerk çıkarım yok",
    c1_result_no: "Kapsam dışı",
    c1_result_no_body: "Bu sistem AB Yapay Zeka Yasası tanımını karşılamıyor. Yasa uygulanmaz.",
    c1_ref: "Madde 3(1)",

    c2_title: "Sistem muafiyetten yararlanıyor mu?",
    c2_body:  "Sistem yalnızca şu amaçlardan biri için mi geliştirildi ya da kullanılıyor: askeri, savunma veya ulusal güvenlik; bilimsel araştırma ve geliştirme (henüz piyasada değil); kişisel, profesyonel olmayan kullanım?",
    c2_hint:  "AB AI Yasası bu alanları ulusal güvenlik egemenliğini ve serbest bilimsel araştırmayı korumak için kapsam dışında bırakmaktadır.",
    c2_yes: "Evet — bu muafiyet kategorilerinden birine giriyor",
    c2_no:  "Hayır — profesyonel veya ticari bir bağlamda kullanılıyor",
    c2_result_yes: "AB Yapay Zeka Yasası kapsamı dışında",
    c2_result_yes_body: "Sisteminiz AB AI Act kapsamı dışındadır. Bu yasa kapsamında resmi uyumluluk yükümlülüğü bulunmamaktadır.",
    c2_ref: "Madde 2(3)",

    c3_title: "Tedarik zincirindeki rolünüz nedir?",
    c3_body:  "AB AI Yasası yükümlülükleri role göre asimetrik olarak dağıtır. Konumunuzu en iyi tanımlayan rolü seçin.",
    c3_hint:  "Yükümlülükler sağlayıcı için en kapsamlıdır ve tedarik zincirinde azalır.",
    c3_ref: "Madde 3(3–8), Madde 25",
    c3_opt_provider:  "Sağlayıcı — Bu AI sistemini kendi markamla geliştirip AB pazarına sunuyorum",
    c3_opt_deployer:  "Dağıtıcı — Bu AI sistemini kendi profesyonel faaliyetimde kullanıyorum (geliştirmedim)",
    c3_opt_both:      "Her ikisi — Hem geliştirdim hem de kendi operasyonlarımda kullanıyorum",
    c3_opt_importer:  "İthalatçı / Distribütör — Sistemi üçüncü bir ülkeden AB'ye getiriyorum veya dağıtıyorum",
    c3_role_notes: {
      provider:  "Sağlayıcı olarak en kapsamlı yükümlülüklere sahipsiniz: teknik dokümantasyon, kalite yönetim sistemi, uygunluk değerlendirmesi, CE işareti ve AB veritabanı kaydı.",
      deployer:  "Dağıtıcı olarak temel yükümlülükleriniz: sistemi talimatlara göre kullanmak, anlamlı insan gözetimi sağlamak ve gerektiğinde kullanıcıları bilgilendirmektir.",
      both:      "Hem Sağlayıcı hem Dağıtıcı yükümlülükleri geçerlidir. Daha kapsamlı olan Sağlayıcı yükümlülükleri öncelikle ele alınmalıdır.",
      importer:  "İthalatçı veya Distribütör olarak sağlayıcının uygunluğunu doğrulamanız ve AB yetkili temsilcisi atanmasını sağlamanız gerekebilir.",
    },

    c4_title: "Sistem yasaklı bir uygulama için mi kullanılıyor?",
    c4_body:  "Sistem aşağıdaki amaçlardan herhangi biri için kullanılıyor mu? (Tek bir eşleşme yeterlidir):",
    c4_hint:  "Bu uygulamalar temel haklarla bağdaşmaz ve AB'de kesinlikle yasaktır.",
    c4_ref: "Madde 5",
    c4_items: [
      "Kamu otoritelerinin bireysel sosyal puanlaması (davranış veya kişisel özelliklere dayalı)",
      "Psikolojik zayıflıkları istismar eden bilinçaltı, manipülatif veya aldatıcı teknikler",
      "Davranışı çarpıtmak amacıyla savunmasız grupların (yaş, engellilik) istismarı",
      "İnternetten veya CCTV'den yüz görüntüsü toplamak için ayrım gözetmeyen biyometrik veritabanı oluşturma",
      "İşyerinde veya eğitim kurumlarında duygu çıkarımı",
      "Kamuya açık alanlarda gerçek zamanlı uzaktan biyometrik tanımlama (örn. yüz tanıma)",
      "Yalnızca profilleme veya kişilik değerlendirmesine dayalı tahmine dayalı polislik",
    ],
    c4_yes: "Evet — sistem bu amaçlardan en az biri için kullanılıyor",
    c4_no:  "Hayır — bu amaçların hiçbiri geçerli değil",
    c4_result_yes: "Yasaklı uygulama — sistem AB'de kullanılamaz",
    c4_result_yes_body: "AB Yapay Zeka Yasası'nın 5. Maddesi uyarınca bu sistemi AB'de piyasaya sürmek veya hizmete koymak kesinlikle yasaktır. Hukuki danışmanlık almanızı şiddetle tavsiye ederiz.",

    c5_title: "Sistem Ek III kapsamında Yüksek Riskli mi?",
    c5_body:  "Sistem aşağıdaki Ek III'te listelenen alanlardan birinde mi kullanılıyor ya da mevcut AB ürün güvenliği mevzuatına (örn. tıbbi cihazlar, makineler) tabi bir ürünün güvenlik bileşeni mi?",
    c5_hint:  "Yüksek riskli sınıflandırma en kapsamlı uyumluluk yükümlülüklerini tetikler.",
    c5_ref: "Madde 6, Ek III",
    c5_items: [
      "Kritik altyapı yönetimi (su, elektrik, gaz, ulaşım, dijital altyapı)",
      "Eğitim ve mesleki eğitim (kabul süreçleri, değerlendirmeler, öğrenci izleme)",
      "İstihdam ve İK (işe alım, seçim, performans değerlendirme, terfi/işten çıkarma)",
      "Temel özel ve kamu hizmetlerine erişim (kredi skorlama, sigorta riski, sosyal yardımlar, acil servisler)",
      "Kolluk kuvvetleri (bireysel risk değerlendirmesi, delil değerlendirmesi, tahmine dayalı polislik)",
      "Göç, iltica ve sınır kontrolü (risk değerlendirmesi, belge doğrulama)",
      "Adalet ve demokratik süreçlerin yönetimi (hukuki yorum, seçimler)",
      "AB ürün güvenliği mevzuatına tabi bir ürünün güvenlik bileşeni (tıbbi cihaz, havacılık, araçlar, makineler)",
    ],
    c5_yes: "Evet — bu alanlardan birinde kullanılıyor veya güvenlik bileşeni",
    c5_no:  "Hayır — bu alanların hiçbiri geçerli değil",

    c6_title: "Sistem sınırlı risk şeffaflık yükümlülüklerine tabi mi?",
    c6_body:  "Sistem aşağıdakilerden en az birini yapıyor mu?",
    c6_hint:  "Kullanıcıların bir AI ile etkileşimde olduklarını veya AI üretimi içerik tükettiklerini bilme hakları vardır.",
    c6_ref: "Madde 50",
    c6_items: [
      "Chatbot veya sanal asistan olarak insanlarla doğrudan etkileşime girmek",
      "Gerçek içerikle karıştırılabilecek sentetik ses, görüntü, video veya metin üretmek ya da manipüle etmek (deepfake)",
    ],
    c6_yes: "Evet — en az biri geçerli",
    c6_no:  "Hayır — hiçbiri geçerli değil",

    c7_title: "Genel Amaçlı Yapay Zeka (GPAI) modeli mi?",
    c7_body:  "Altta yatan model, geniş bir görev yelpazesini yerine getirebilen genel amaçlı bir AI mi (örn. büyük dil modeli veya temel model)? Eğer öyleyse: 10²⁵ FLOP üzerinde hesaplama gücüyle mi eğitildi (sistemik risk ölçeği)?",
    c7_hint:  "GPAI sağlayıcılarının ek yükümlülükleri vardır: eğitim verisi özeti ve teknik yetenek belgesi. Sistemik riskli modeller (frontier ölçeği) ayrıca red-teaming yapmalı ve ciddi olayları bildirmelidir.",
    c7_ref: "Madde 51–55",
    c7_yes_systemic:    "Evet — Muhtemelen sistemik riskli GPAI (frontier ölçeği, örn. GPT-4 sınıfı)",
    c7_yes_no_systemic: "Evet — GPAI, ancak sistemik risk yok (daha küçük veya açık ağırlıklı model)",
    c7_no:  "Hayır — GPAI modeli değil",

    risk_unacceptable: "Kabul Edilemez (Yasak)",
    risk_high: "Yüksek Risk",
    risk_limited: "Sınırlı Risk",
    risk_minimal: "Minimal Risk",
    risk_gpai: "GPAI",
    risk_gpai_systemic: "GPAI + Sistemik Risk",

    oblig_header: "Profiliniz için temel yükümlülükler:",
    oblig_provider_high: [
      "Kalite Yönetim Sistemi (KYS) kurmak — Madde 17",
      "Tam teknik dokümantasyon hazırlamak — Madde 11 + Ek IV",
      "Uygunluk değerlendirmesi yapmak — Madde 43",
      "CE işareti ve AB Uygunluk Beyanı düzenlemek — Madde 48",
      "AB AI Act veritabanına kayıt — Madde 49",
      "Anlamlı insan gözetimi sağlamak — Madde 14",
      "Kayıt ve izleme uygulamak — Madde 12",
      "Piyasa sonrası izleme kurmak — Madde 72",
      "Ciddi olayları yetkililere bildirmek — Madde 73",
    ],
    oblig_deployer_high: [
      "Sistemi yalnızca sağlayıcı talimatlarına göre kullanmak — Madde 26",
      "Eğitimli personel tarafından anlamlı insan gözetimi sağlamak — Madde 26(2)",
      "Temel hak etki değerlendirmesi yapmak — Madde 27",
      "Gerektiğinde kullanıcıları AI kullanımı hakkında bilgilendirmek — Madde 26(6)",
      "En az 6 aylık kayıt saklama — Madde 26(5)",
      "Ciddi olayları sağlayıcıya ve yetkililere bildirmek — Madde 26(5)",
    ],
    oblig_transparency: [
      "Kullanıcıları AI ile etkileşimde olduklarından haberdar etmek (chatbot) — Madde 50(1)",
      "AI üretimi içeriği etiketlemek / filigran uygulamak — Madde 50(2)",
    ],
    oblig_gpai: [
      "Eğitim verisi özeti yayımlamak (telif uyumu) — Madde 53(1)(d)",
      "Model yeteneklerinin teknik dokümantasyonunu hazırlamak — Madde 53",
      "Model politikasını yayımlamak ve güncel tutmak — Madde 53(1)(b)",
    ],
    oblig_gpai_systemic: [
      "Tüm standart GPAI yükümlülükleri",
      "Kırmızı takım (red-teaming) testi yapmak — Madde 55(1)(a)",
      "Ciddi olayları 2 hafta içinde AI Ofisi'ne bildirmek — Madde 55(1)(c)",
      "Siber güvenlik önlemleri uygulamak — Madde 55(1)(b)",
      "Enerji verimliliği dokümantasyonu — Madde 55(1)(d)",
    ],
    oblig_minimal: [
      "AB AI Act kapsamında zorunlu yükümlülük bulunmamaktadır",
      "Gönüllü davranış kurallarına uyum teşvik edilmektedir — Madde 95",
    ],

    done_title: "Ön değerlendirme tamamlandı",
    done_sub: "AB AI Act profiliniz belirlendi. Sırada tam risk değerlendirmesi var.",
  }
}

const RISK_COLORS = {
  prohibited:    { bg:"#fef2f2", border:"#fecaca", text:"#991b1b", dot:"#dc2626" },
  high:          { bg:"#fff7ed", border:"#fed7aa", text:"#92400e", dot:"#f97316" },
  limited:       { bg:"#fefce8", border:"#fde68a", text:"#854d0e", dot:"#eab308" },
  minimal:       { bg:"#f0fdf4", border:"#bbf7d0", text:"#166534", dot:"#22c55e" },
  gpai:          { bg:"#f5f3ff", border:"#ddd6fe", text:"#5b21b6", dot:"#7c3aed" },
  gpai_systemic: { bg:"#fdf4ff", border:"#f0abfc", text:"#86198f", dot:"#d946ef" },
  out_of_scope:  { bg:"#f8fafc", border:"#e2e8f0", text:"#475569", dot:"#94a3b8" },
  exempt:        { bg:"#f0fdf4", border:"#bbf7d0", text:"#166534", dot:"#22c55e" },
}

export default function EUScreening({ lang = "en", onComplete }) {
  const L = T[lang] || T.en
  const [answers, setAnswers] = useState({})
  const [currentCheck, setCurrentCheck] = useState(1)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)
  const [roleNote, setRoleNote] = useState("")

  function answer(check, value) {
    const next = { ...answers, [check]: value }
    setAnswers(next)

    // Decision tree logic
    if (check === 1) {
      if (value === false) { finalise(next, "out_of_scope"); return }
      setCurrentCheck(2)
    }
    else if (check === 2) {
      if (value === true) { finalise(next, "exempt"); return }
      setCurrentCheck(3)
    }
    else if (check === "3_role") {
      setRoleNote(L.c3_role_notes[value] || "")
      setCurrentCheck(4)
    }
    else if (check === 4) {
      if (value === true) { finalise(next, "prohibited"); return }
      setCurrentCheck(5)
    }
    else if (check === 5) {
      setCurrentCheck(6)
    }
    else if (check === 6) {
      setCurrentCheck(7)
    }
    else if (check === 7) {
      finalise(next, computeRisk(next))
    }
  }

  function goBack() {
    const prev = currentCheck === 4 ? "3_role" : currentCheck - 1
    const newAnswers = { ...answers }
    delete newAnswers[currentCheck]
    delete newAnswers["3_role"]
    setAnswers(newAnswers)
    setDone(false)
    setResult(null)
    setCurrentCheck(typeof prev === "string" ? 3 : prev)
  }

  function computeRisk(a) {
    const isHigh = a[5] === true
    const isLimited = !isHigh && a[6] === true
    const gpai = a[7]
    if (gpai === "systemic") return "gpai_systemic"
    if (isHigh) return "high"
    if (gpai === "yes") return "gpai"
    if (isLimited) return "limited"
    return "minimal"
  }

  function finalise(a, status) {
    const role = a["3_role"] || null
    const isHigh = a[5] === true
    const gpai = a[7]
    const obligations = buildObligations(status, role, isHigh, gpai, L)
    const r = { status, role, risk_category: status, obligations, answers: a }
    setResult(r)
    setDone(true)
  }

  if (done && result) {
    return <DoneScreen result={result} L={L} lang={lang} onContinue={() => onComplete(result)} />
  }

  return (
    <div style={sc.wrap}>
      <div style={sc.header}>
        <div>
          <h2 style={sc.title}>{L.title}</h2>
          <p style={sc.sub}>{L.sub}</p>
        </div>
        <CheckNav current={currentCheck} L={L} />
      </div>

      <div style={sc.disclaimer}>{L.disclaimer}</div>

      <div style={sc.body}>
        {currentCheck === 1 && <Check1 L={L} onAnswer={v => answer(1, v)} />}
        {currentCheck === 2 && <Check2 L={L} onAnswer={v => answer(2, v)} onBack={goBack} />}
        {currentCheck === 3 && <Check3 L={L} onAnswer={v => answer("3_role", v)} roleNote={roleNote} onBack={goBack} />}
        {currentCheck === 4 && <Check4 L={L} onAnswer={v => answer(4, v)} onBack={goBack} />}
        {currentCheck === 5 && <Check5 L={L} onAnswer={v => answer(5, v)} onBack={goBack} />}
        {currentCheck === 6 && <Check6 L={L} onAnswer={v => answer(6, v)} onBack={goBack} />}
        {currentCheck === 7 && <Check7 L={L} onAnswer={v => answer(7, v)} onBack={goBack} />}
      </div>
    </div>
  )
}

function CheckNav({ current, L }) {
  const checks = [1,2,3,4,5,6,7]
  return (
    <div style={sc.nav}>
      {checks.map(n => (
        <div key={n} style={{ ...sc.navDot, ...(n === current ? sc.navDotActive : n < current ? sc.navDotDone : {}) }}>
          {n < current ? "✓" : n}
        </div>
      ))}
    </div>
  )
}

function CheckWrap({ label, title, body, hint, ref_, children, onBack }) {
  return (
    <div>
      <div style={sc.checkLabel}>{label}</div>
      <h3 style={sc.checkTitle}>{title}</h3>
      <p style={sc.checkBody}>{body}</p>
      {hint && <p style={sc.checkHint}>{hint}</p>}
      <div style={{ marginBottom:8, textAlign:"right" }}>
        <span style={sc.refBadge}>{ref_}</span>
      </div>
      {children}
      {onBack && <button style={sc.backBtn} onClick={onBack}>← Back</button>}
    </div>
  )
}

function YesNo({ L, onYes, onNo, yesLabel, noLabel }) {
  return (
    <div style={sc.ynGroup}>
      <button style={sc.ynYes} onClick={onYes}>{yesLabel || L.yes}</button>
      <button style={sc.ynNo}  onClick={onNo}>{noLabel || L.no}</button>
    </div>
  )
}

function Check1({ L, onAnswer }) {
  return (
    <CheckWrap label={L.check(1,7)} title={L.c1_title} body={L.c1_body} hint={L.c1_hint} ref_={L.c1_ref}>
      <YesNo L={L} onYes={() => onAnswer(true)} onNo={() => onAnswer(false)} yesLabel={L.c1_yes} noLabel={L.c1_no} />
    </CheckWrap>
  )
}

function Check2({ L, onAnswer, onBack }) {
  return (
    <CheckWrap label={L.check(2,7)} title={L.c2_title} body={L.c2_body} hint={L.c2_hint} ref_={L.c2_ref} onBack={onBack}>
      <YesNo L={L} onYes={() => onAnswer(true)} onNo={() => onAnswer(false)} yesLabel={L.c2_yes} noLabel={L.c2_no} />
    </CheckWrap>
  )
}

function Check3({ L, onAnswer, roleNote, onBack }) {
  const opts = [
    ["provider", L.c3_opt_provider],
    ["deployer", L.c3_opt_deployer],
    ["both",     L.c3_opt_both],
    ["importer", L.c3_opt_importer],
  ]
  return (
    <CheckWrap label={L.check(3,7)} title={L.c3_title} body={L.c3_body} hint={L.c3_hint} ref_={L.c3_ref} onBack={onBack}>
      <div style={sc.roleGrid}>
        {opts.map(([val, label]) => (
          <button key={val} style={sc.roleBtn} onClick={() => onAnswer(val)}>
            <span style={sc.roleIcon}>{val==="provider"?"🏭":val==="deployer"?"🏢":val==="both"?"⚙️":"🌐"}</span>
            <span style={sc.roleLabel}>{label}</span>
          </button>
        ))}
      </div>
      {roleNote && <div style={sc.roleNote}>{roleNote}</div>}
    </CheckWrap>
  )
}

function Check4({ L, onAnswer, onBack }) {
  return (
    <CheckWrap label={L.check(4,7)} title={L.c4_title} body={L.c4_body} hint={L.c4_hint} ref_={L.c4_ref} onBack={onBack}>
      <ul style={sc.checklist}>
        {L.c4_items.map((item, i) => (
          <li key={i} style={sc.checklistItem}>
            <span style={sc.checklistDot} />
            {item}
          </li>
        ))}
      </ul>
      <YesNo L={L} onYes={() => onAnswer(true)} onNo={() => onAnswer(false)} yesLabel={L.c4_yes} noLabel={L.c4_no} />
    </CheckWrap>
  )
}

function Check5({ L, onAnswer, onBack }) {
  return (
    <CheckWrap label={L.check(5,7)} title={L.c5_title} body={L.c5_body} hint={L.c5_hint} ref_={L.c5_ref} onBack={onBack}>
      <ul style={sc.checklist}>
        {L.c5_items.map((item, i) => (
          <li key={i} style={sc.checklistItem}>
            <span style={sc.checklistDot} />
            {item}
          </li>
        ))}
      </ul>
      <YesNo L={L} onYes={() => onAnswer(true)} onNo={() => onAnswer(false)} yesLabel={L.c5_yes} noLabel={L.c5_no} />
    </CheckWrap>
  )
}

function Check6({ L, onAnswer, onBack }) {
  return (
    <CheckWrap label={L.check(6,7)} title={L.c6_title} body={L.c6_body} hint={L.c6_hint} ref_={L.c6_ref} onBack={onBack}>
      <ul style={sc.checklist}>
        {L.c6_items.map((item, i) => (
          <li key={i} style={sc.checklistItem}>
            <span style={sc.checklistDot} />
            {item}
          </li>
        ))}
      </ul>
      <YesNo L={L} onYes={() => onAnswer(true)} onNo={() => onAnswer(false)} yesLabel={L.c6_yes} noLabel={L.c6_no} />
    </CheckWrap>
  )
}

function Check7({ L, onAnswer, onBack }) {
  return (
    <CheckWrap label={L.check(7,7)} title={L.c7_title} body={L.c7_body} hint={L.c7_hint} ref_={L.c7_ref} onBack={onBack}>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:16 }}>
        <button style={sc.ynYes} onClick={() => onAnswer("systemic")}>{L.c7_yes_systemic}</button>
        <button style={{ ...sc.ynYes, background:"#f5f3ff", color:"#5b21b6", border:"2px solid #ddd6fe" }} onClick={() => onAnswer("yes")}>{L.c7_yes_no_systemic}</button>
        <button style={sc.ynNo} onClick={() => onAnswer(false)}>{L.c7_no}</button>
      </div>
    </CheckWrap>
  )
}

function DoneScreen({ result, L, lang, onContinue }) {
  const { status, role, obligations } = result
  const riskKey = {
    out_of_scope: "out_of_scope", exempt: "exempt", prohibited: "prohibited",
    high: "high", limited: "limited", minimal: "minimal",
    gpai: "gpai", gpai_systemic: "gpai_systemic",
  }[status] || "minimal"
  const col = RISK_COLORS[riskKey] || RISK_COLORS.minimal
  const riskLabel = {
    out_of_scope: lang==="tr" ? "Kapsam Dışı" : "Out of Scope",
    exempt: lang==="tr" ? "Muaf" : "Exempt",
    prohibited: lang==="tr" ? "Yasak Uygulama ⛔" : "Prohibited ⛔",
    high: lang==="tr" ? "Yüksek Risk" : "High Risk",
    limited: lang==="tr" ? "Sınırlı Risk" : "Limited Risk",
    minimal: lang==="tr" ? "Minimal Risk" : "Minimal Risk",
    gpai: "GPAI",
    gpai_systemic: lang==="tr" ? "GPAI + Sistemik Risk" : "GPAI + Systemic Risk",
  }[status] || status

  const canContinue = !["out_of_scope","exempt","prohibited"].includes(status)

  return (
    <div style={sc.wrap}>
      <div style={sc.doneHeader}>
        <h2 style={sc.title}>{L.done_title}</h2>
        <p style={sc.sub}>{L.done_sub}</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
        <div style={{ ...sc.resultCard, borderColor:col.border, background:col.bg }}>
          <div style={sc.resultCardLabel}>{lang==="tr" ? "Risk kategorisi" : "Risk category"}</div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:col.dot, flexShrink:0 }} />
            <span style={{ fontSize:18, fontWeight:700, color:col.text }}>{riskLabel}</span>
          </div>
        </div>
        <div style={{ ...sc.resultCard }}>
          <div style={sc.resultCardLabel}>{lang==="tr" ? "Rolünüz" : "Your role"}</div>
          <div style={{ fontSize:16, fontWeight:600, color:"#0f0f0e", marginTop:8 }}>
            {{ provider: lang==="tr"?"Sağlayıcı":"Provider", deployer: lang==="tr"?"Dağıtıcı":"Deployer", both: lang==="tr"?"Her ikisi":"Both", importer: lang==="tr"?"İthalatçı":"Importer" }[role] || (lang==="tr" ? "Belirtilmedi" : "Not specified")}
          </div>
        </div>
      </div>

      {obligations.length > 0 && (
        <div style={sc.obligWrap}>
          <div style={sc.obligHeader}>{L.oblig_header}</div>
          <ul style={sc.obligList}>
            {obligations.map((o, i) => (
              <li key={i} style={sc.obligItem}>
                <span style={{ ...sc.obligDot, background:col.dot }} />
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "prohibited" && (
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"14px 16px", marginBottom:20, fontSize:13, color:"#991b1b", lineHeight:1.6 }}>
          {L.c4_result_yes_body}
        </div>
      )}

      {status === "exempt" && (
        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"14px 16px", marginBottom:20, fontSize:13, color:"#166534", lineHeight:1.6 }}>
          {L.c2_result_yes_body}
        </div>
      )}

      {status === "out_of_scope" && (
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"14px 16px", marginBottom:20, fontSize:13, color:"#475569", lineHeight:1.6 }}>
          {L.c1_result_no_body}
        </div>
      )}

      {canContinue && (
        <button style={sc.continueBtn} onClick={onContinue}>{L.continue}</button>
      )}
    </div>
  )
}

function buildObligations(status, role, isHigh, gpai, L) {
  if (["out_of_scope","exempt","prohibited"].includes(status)) return []
  const list = []
  if (isHigh) {
    if (role === "provider" || role === "both") list.push(...L.oblig_provider_high)
    if (role === "deployer" || role === "both") list.push(...L.oblig_deployer_high)
  }
  if (status === "limited") list.push(...L.oblig_transparency)
  if (gpai === "yes") list.push(...L.oblig_gpai)
  if (gpai === "systemic") list.push(...L.oblig_gpai_systemic)
  if (status === "minimal" && !list.length) list.push(...L.oblig_minimal)
  return list
}

const sc = {
  wrap: { maxWidth:760, margin:"0 auto" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, gap:20 },
  title: { fontSize:20, fontWeight:700, color:"#0f0f0e", margin:0, letterSpacing:"-0.3px" },
  sub: { fontSize:13, color:"#666", marginTop:6, marginBottom:0, lineHeight:1.5 },
  disclaimer: { fontSize:11.5, color:"#999", background:"#fafaf8", border:"1px solid #e8e6e0", borderRadius:8, padding:"8px 12px", marginBottom:24, lineHeight:1.5 },
  nav: { display:"flex", gap:6, flexShrink:0 },
  navDot: { width:26, height:26, borderRadius:"50%", background:"#e8e6e0", color:"#999", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" },
  navDotActive: { background:"#7c6af7", color:"#fff" },
  navDotDone: { background:"#22c55e", color:"#fff" },
  body: { background:"#fafaf8", border:"1px solid #e8e6e0", borderRadius:12, padding:"28px 28px 24px" },
  checkLabel: { fontSize:11, fontWeight:700, color:"#7c6af7", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 },
  checkTitle: { fontSize:17, fontWeight:700, color:"#0f0f0e", margin:"0 0 10px", letterSpacing:"-0.2px" },
  checkBody: { fontSize:13.5, color:"#333", lineHeight:1.7, marginBottom:10 },
  checkHint: { fontSize:12, color:"#888", background:"#f0f0f0", borderRadius:6, padding:"7px 10px", marginBottom:14, lineHeight:1.5 },
  refBadge: { fontSize:10, fontWeight:700, color:"#534ab7", background:"#eeedfe", padding:"2px 8px", borderRadius:8 },
  ynGroup: { display:"flex", flexDirection:"column", gap:10, marginTop:16 },
  ynYes: { border:"2px solid #7c6af7", background:"#f0effe", color:"#4c3fbf", borderRadius:10, padding:"12px 18px", fontSize:13, fontWeight:500, cursor:"pointer", textAlign:"left", lineHeight:1.4 },
  ynNo:  { border:"2px solid #e2e8f0", background:"#f8fafc", color:"#475569", borderRadius:10, padding:"12px 18px", fontSize:13, fontWeight:500, cursor:"pointer", textAlign:"left", lineHeight:1.4 },
  roleGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16 },
  roleBtn: { border:"1.5px solid #e8e6e0", background:"#fff", borderRadius:10, padding:"14px 14px", cursor:"pointer", textAlign:"left", display:"flex", gap:10, alignItems:"flex-start" },
  roleIcon: { fontSize:20, flexShrink:0 },
  roleLabel: { fontSize:12.5, color:"#1a1a1a", fontWeight:500, lineHeight:1.4 },
  roleNote: { marginTop:14, background:"#f0effe", border:"1px solid #ddd6fe", borderRadius:8, padding:"10px 14px", fontSize:12.5, color:"#4c3fbf", lineHeight:1.6 },
  checklist: { margin:"0 0 16px", padding:"0 0 0 4px", listStyle:"none", display:"flex", flexDirection:"column", gap:8 },
  checklistItem: { display:"flex", gap:10, alignItems:"flex-start", fontSize:13, color:"#333", lineHeight:1.5 },
  checklistDot: { width:6, height:6, borderRadius:"50%", background:"#7c6af7", flexShrink:0, marginTop:6 },
  backBtn: { marginTop:20, background:"transparent", border:"none", color:"#999", fontSize:12, cursor:"pointer", padding:0 },
  doneHeader: { marginBottom:20 },
  resultCard: { border:"1.5px solid #e8e6e0", borderRadius:12, padding:"16px 18px", background:"#fff" },
  resultCardLabel: { fontSize:11, fontWeight:600, color:"#999", textTransform:"uppercase", letterSpacing:"0.05em" },
  obligWrap: { background:"#fff", border:"1px solid #e8e6e0", borderRadius:12, padding:"18px 20px", marginBottom:20 },
  obligHeader: { fontSize:12, fontWeight:700, color:"#333", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:12 },
  obligList: { margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:8 },
  obligItem: { display:"flex", gap:10, alignItems:"flex-start", fontSize:13, color:"#333", lineHeight:1.5 },
  obligDot: { width:6, height:6, borderRadius:"50%", flexShrink:0, marginTop:6 },
  continueBtn: { width:"100%", background:"#0f0f0e", color:"#fff", border:"none", borderRadius:10, padding:"14px", fontSize:14, fontWeight:600, cursor:"pointer", letterSpacing:"-0.1px" },
}
