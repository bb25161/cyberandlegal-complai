// i18n_jurisdiction.js
// Step 0: Jurisdiction + Risk Appetite sorular
// Her soruya (i) tehdit mapping'i ekli

export const jurisdictionTranslations = {
  en: {

    // ── Step 0 başlık ──
    step0_title: "Where you operate",
    step0_sub: "This determines which AI regulations apply to your system",

    // ── Bileşen: Şirket lokasyonu ──
    f_registered_country: "Where is your organisation registered?",
    f_registered_country_ph: "Search for a country...",
    f_registered_country_hint: "Your registration country determines your primary regulatory obligations. An Estonia-registered company is subject to EU AI Act regardless of where it serves customers.",

    // ── Bileşen: Hizmet verilen ülkeler ──
    f_served_countries: "Which countries do you serve with this AI system?",
    f_served_countries_ph: "Select countries or click on the map...",
    f_served_countries_hint: "Any country where your AI system's output affects people may create regulatory obligations — even if you are not physically present there.",

    // ── Bileşen: Rol ──
    f_role: "What is your role with this AI system?",
    f_role_ph: "Select your role",

    role_provider: "Provider — we built or trained this AI system",
    role_deployer: "Deployer — we use a ready-made AI system from a third party",
    role_both: "Both — we built it and we use it ourselves",
    role_importer: "Importer — we bring an AI system from outside the EU into the EU market",

    role_provider_info: "EU AI Act Art. 3(3): Providers bear primary obligations — conformity assessment, technical documentation, CE marking.",
    role_deployer_info: "EU AI Act Art. 3(4): Deployers must implement human oversight, monitor performance, and report incidents.",
    role_both_info: "Both provider and deployer obligations apply. This is the highest compliance burden.",
    role_importer_info: "EU AI Act Art. 3(6): Importers must verify provider compliance before placing the system on the EU market.",

    // ── Applicable laws paneli ──
    applicable_laws_title: "Applicable regulations",
    applicable_laws_sub: "Based on your registration and service countries",
    applicable_laws_empty: "Select your countries above to see applicable regulations",
    applicable_laws_enforcement: "Enforcement",
    applicable_laws_penalty: "Max penalty",
    applicable_laws_obligations: "Key obligations",
    applicable_law_status_active: "In force",
    applicable_law_status_draft: "Upcoming",

    // ── Risk iştahı — Operasyonel ──
    f_risk_tolerance: "When this AI system makes a wrong decision, what does your organisation do?",
    f_risk_tolerance_ph: "Select your response approach",
    f_risk_tolerance_hint: "ISO 31000 defines risk appetite as the amount and type of risk an organisation is willing to accept. NIST AI RMF MAP 1.5 requires this to be documented before deployment.",

    rt_stop: "Stop — we halt the system and manually review every affected case",
    rt_escalate: "Escalate — the affected person is flagged for human review before any action is taken",
    rt_sample: "Sample — we investigate a proportion of errors and act if rates exceed our threshold",
    rt_monitor: "Monitor — we track performance trends and intervene if overall quality degrades",

    rt_stop_info: "Regulation: EU AI Act Art. 14 (human oversight) · NIST GOVERN 1.3\nRisk signal: Strongest control posture. Requires robust audit logging and escalation paths.",
    rt_escalate_info: "Regulation: EU AI Act Art. 14 · ISO 31000 risk response\nRisk signal: Good practice for high-criticality decisions. Requires clear escalation procedures.",
    rt_sample_info: "Regulation: NIST MEASURE 2.5 (performance monitoring)\nRisk signal: Acceptable for lower-risk systems. Define and document your error threshold.",
    rt_monitor_info: "Regulation: NIST MANAGE 2.2\nRisk signal: Weakest oversight posture. Acceptable only for minimal-risk applications with no individual impact.",

    // ── Risk iştahı — Güvenlik ──
    f_security_tolerance: "If this AI system caused a data breach or security incident, what is your organisation's position?",
    f_security_tolerance_ph: "Select your security risk appetite",
    f_security_tolerance_hint: "Security risk appetite is often stricter than operational risk appetite. A breach can trigger regulatory investigations, reputational harm, and licence revocation — separate from the AI decision risk.",

    sec_zero: "Zero tolerance — one incident triggers immediate shutdown and a full independent audit",
    sec_low: "Low — any incident triggers formal review; system is paused pending investigation",
    sec_medium: "Medium — we follow our standard incident response process and report as required",
    sec_high: "High — incidents are expected in production; we manage them as they arise",

    sec_zero_info: "Regulation: ISO 27001 · NIST CSF · EU AI Act Art. 62 (serious incident reporting)\nRisk signal: Best practice. Required posture for healthcare, finance, and critical infrastructure.",
    sec_low_info: "Regulation: EU AI Act Art. 62 · GDPR Art. 33\nRisk signal: Strong posture. Formal review process must be documented and tested.",
    sec_medium_info: "Regulation: Sector-specific breach notification laws may impose stricter timelines.\nRisk signal: Acceptable for medium-risk systems. Review incident response plan annually.",
    sec_high_info: "Regulation: ENISA threat landscape — high tolerance increases attack surface exposure.\nRisk signal: Regulatory exposure risk. Sectors like finance and health typically require lower tolerance.",

    // ── Harita açıklamaları ──
    map_legend_registered: "Registered country",
    map_legend_served: "Served country",
    map_legend_high_reg: "High regulation",
    map_legend_medium_reg: "Medium regulation",
    map_legend_low_reg: "Low / voluntary",
    map_hover_click: "Click a country to add to served countries",
    map_hover_regulation: "Click to see regulations",
  },

  tr: {
    step0_title: "Faaliyet gösterdiğiniz yerler",
    step0_sub: "Bu, sisteminize hangi AI düzenlemelerinin uygulandığını belirler",

    f_registered_country: "Organizasyonunuz nerede tescilli?",
    f_registered_country_ph: "Ülke ara...",
    f_registered_country_hint: "Tescil ülkeniz birincil düzenleyici yükümlülüklerinizi belirler. Estonya'da tescilli bir şirket, müşterilere nerede hizmet verdiğinden bağımsız olarak AB Yapay Zeka Yasası'na tabidir.",

    f_served_countries: "Bu AI sistemiyle hangi ülkelere hizmet veriyorsunuz?",
    f_served_countries_ph: "Ülke seçin veya haritaya tıklayın...",
    f_served_countries_hint: "AI sisteminizin çıktısının insanları etkilediği her ülke düzenleyici yükümlülükler yaratabilir — orada fiziksel varlığınız olmasa bile.",

    f_role: "Bu AI sistemiyle rolünüz nedir?",
    f_role_ph: "Rolünüzü seçin",

    role_provider: "Sağlayıcı — bu AI sistemini biz geliştirdik veya eğittik",
    role_deployer: "Dağıtıcı — üçüncü taraftan hazır bir AI sistemi kullanıyoruz",
    role_both: "Her ikisi — geliştirdik ve kendimiz kullanıyoruz",
    role_importer: "İthalatçı — AB dışından bir AI sistemini AB pazarına getiriyoruz",

    role_provider_info: "AB Yapay Zeka Yasası Madde 3(3): Sağlayıcılar birincil yükümlülükleri taşır — uygunluk değerlendirmesi, teknik belgeleme, CE işareti.",
    role_deployer_info: "AB Yapay Zeka Yasası Madde 3(4): Dağıtıcılar insan gözetimini uygulamalı, performansı izlemeli ve olayları raporlamalıdır.",
    role_both_info: "Hem sağlayıcı hem dağıtıcı yükümlülükleri geçerlidir. Bu en yüksek uyum yüküdür.",
    role_importer_info: "AB Yapay Zeka Yasası Madde 3(6): İthalatçılar, sistemi AB pazarına sunmadan önce sağlayıcı uyumluluğunu doğrulamalıdır.",

    applicable_laws_title: "Geçerli düzenlemeler",
    applicable_laws_sub: "Tescil ve hizmet ülkelerinize göre",
    applicable_laws_empty: "Geçerli düzenlemeleri görmek için yukarıdan ülkelerinizi seçin",
    applicable_laws_enforcement: "Yürürlük",
    applicable_laws_penalty: "Azami ceza",
    applicable_laws_obligations: "Temel yükümlülükler",
    applicable_law_status_active: "Yürürlükte",
    applicable_law_status_draft: "Yakında",

    f_risk_tolerance: "Bu AI sistemi yanlış bir karar verdiğinde organizasyonunuz ne yapar?",
    f_risk_tolerance_ph: "Yaklaşımınızı seçin",
    f_risk_tolerance_hint: "ISO 31000, risk iştahını bir organizasyonun kabul etmeye hazır olduğu risk miktarı ve türü olarak tanımlar. NIST AI RMF MAP 1.5, bunun dağıtımdan önce belgelenmesini gerektirir.",

    rt_stop: "Dur — sistemi durdurur ve etkilenen her vakayı manuel olarak inceleriz",
    rt_escalate: "Eskalasyon — etkilenen kişi herhangi bir işlem yapılmadan önce insan incelemesine alınır",
    rt_sample: "Örnekleme — hataların bir kısmını araştırır, eşiği aşarsa müdahale ederiz",
    rt_monitor: "İzleme — performans trendlerini takip eder, genel kalite düşerse müdahale ederiz",

    rt_stop_info: "Düzenleme: AB YZ Yasası Md. 14 · NIST GOVERN 1.3\nRisk sinyali: En güçlü kontrol duruşu. Sağlam denetim kaydı ve eskalasyon yolları gerektirir.",
    rt_escalate_info: "Düzenleme: AB YZ Yasası Md. 14 · ISO 31000\nRisk sinyali: Yüksek kritikliğe sahip kararlar için iyi uygulama. Net eskalasyon prosedürleri gerektirir.",
    rt_sample_info: "Düzenleme: NIST MEASURE 2.5\nRisk sinyali: Düşük riskli sistemler için kabul edilebilir. Hata eşiğinizi tanımlayın ve belgeleyin.",
    rt_monitor_info: "Düzenleme: NIST MANAGE 2.2\nRisk sinyali: En zayıf gözetim duruşu. Yalnızca bireysel etkisi olmayan minimal riskli uygulamalar için kabul edilebilir.",

    f_security_tolerance: "Bu AI sistemi bir veri ihlali veya güvenlik olayına yol açsaydı organizasyonunuzun tutumu ne olurdu?",
    f_security_tolerance_ph: "Güvenlik risk iştahınızı seçin",
    f_security_tolerance_hint: "Güvenlik risk iştahı genellikle operasyonel risk iştahından daha katıdır. Bir ihlal, AI karar riskinden bağımsız olarak düzenleyici soruşturmaları, itibar zararını ve lisans iptalini tetikleyebilir.",

    sec_zero: "Sıfır tolerans — tek bir olay sistemi kapatır ve tam bağımsız denetim başlatır",
    sec_low: "Düşük — herhangi bir olay resmi inceleme başlatır; soruşturma tamamlanana kadar sistem duraklatılır",
    sec_medium: "Orta — standart olay müdahale sürecimizi izler ve gerektiği gibi raporlarız",
    sec_high: "Yüksek — üretimdeki olaylar beklenir; ortaya çıktıkça yönetiriz",

    sec_zero_info: "Düzenleme: ISO 27001 · NIST CSF · AB YZ Yasası Md. 62\nRisk sinyali: En iyi uygulama. Sağlık, finans ve kritik altyapı için zorunlu duruş.",
    sec_low_info: "Düzenleme: AB YZ Yasası Md. 62 · GDPR Md. 33\nRisk sinyali: Güçlü duruş. Resmi inceleme süreci belgelenmeli ve test edilmelidir.",
    sec_medium_info: "Düzenleme: Sektöre özgü ihlal bildirimi yasaları daha sıkı süreler getirebilir.\nRisk sinyali: Orta riskli sistemler için kabul edilebilir. Olay müdahale planını yıllık gözden geçirin.",
    sec_high_info: "Düzenleme: ENISA tehdit ortamı — yüksek tolerans saldırı yüzeyini artırır.\nRisk sinyali: Düzenleyici maruz kalma riski. Finans ve sağlık gibi sektörler genellikle daha düşük tolerans gerektirir.",

    map_legend_registered: "Tescil ülkesi",
    map_legend_served: "Hizmet ülkesi",
    map_legend_high_reg: "Yüksek düzenleme",
    map_legend_medium_reg: "Orta düzenleme",
    map_legend_low_reg: "Düşük / gönüllü",
    map_hover_click: "Hizmet ülkesi eklemek için tıklayın",
    map_hover_regulation: "Düzenlemeleri görmek için tıklayın",
  }
}
