// jurisdictionData.js
// Applicable AI regulations by country
// Sources: EU AI Act, UK AI Framework, MAS FEAT, NIST AI RMF, etc.

export const REGULATIONS = {
  EU_AI_ACT: {
    id: "EU_AI_ACT",
    name: "EU AI Act",
    shortName: "EU AI Act",
    enforcer: "European Commission",
    enforcement_date: "2026-08-02",
    status: "active",
    risk: "high",
    url: "https://artificialintelligenceact.eu",
    applies_to: ["provider", "deployer", "importer"],
    key_obligations: [
      "Risk classification (Art. 6)",
      "Human oversight (Art. 14)",
      "Transparency (Art. 13)",
      "Data governance (Art. 10)",
      "Conformity assessment (Art. 43)",
    ],
    penalty: "Up to 7% global annual turnover",
  },
  UK_AI: {
    id: "UK_AI",
    name: "UK AI Principles Framework",
    shortName: "UK AI Framework",
    enforcer: "DSIT / FCA / ICO",
    enforcement_date: "2024-01-01",
    status: "active",
    risk: "medium",
    url: "https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "Safety and security",
      "Transparency and explainability",
      "Fairness",
      "Accountability and governance",
      "Contestability and redress",
    ],
    penalty: "Sector-specific enforcement",
  },
  MAS_FEAT: {
    id: "MAS_FEAT",
    name: "MAS FEAT Principles",
    shortName: "MAS FEAT",
    enforcer: "Monetary Authority of Singapore",
    enforcement_date: "2019-11-01",
    status: "active",
    risk: "medium",
    url: "https://www.mas.gov.sg/regulation/explainers/feat",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "Fairness in AI decisions",
      "Ethics in AI use",
      "Accountability structures",
      "Transparency to customers",
    ],
    penalty: "MAS regulatory action",
    sector: "financial_services",
  },
  NIST_AI_RMF: {
    id: "NIST_AI_RMF",
    name: "NIST AI Risk Management Framework",
    shortName: "NIST AI RMF",
    enforcer: "NIST (voluntary / de facto mandatory in federal)",
    enforcement_date: "2023-01-26",
    status: "active",
    risk: "low",
    url: "https://www.nist.gov/system/files/documents/2023/01/26/AI RMF 1.0.pdf",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "Govern — establish accountability",
      "Map — identify context and risks",
      "Measure — analyze and monitor",
      "Manage — prioritize and respond",
    ],
    penalty: "No direct penalty (voluntary)",
  },
  US_EO_14110: {
    id: "US_EO_14110",
    name: "Executive Order 14110 on Safe AI",
    shortName: "EO 14110",
    enforcer: "US Federal Agencies",
    enforcement_date: "2023-10-30",
    status: "active",
    risk: "medium",
    url: "https://www.whitehouse.gov/briefing-room/presidential-actions/2023/10/30/executive-order-on-the-safe-secure-and-trustworthy-development-and-use-of-artificial-intelligence/",
    applies_to: ["provider"],
    key_obligations: [
      "Safety testing for frontier models",
      "Watermarking AI-generated content",
      "Privacy-preserving techniques",
      "Federal agency AI governance",
    ],
    penalty: "Federal procurement exclusion risk",
  },
  CHINA_AI: {
    id: "CHINA_AI",
    name: "China Generative AI Regulations",
    shortName: "China AI Regs",
    enforcer: "CAC / MIIT",
    enforcement_date: "2023-08-15",
    status: "active",
    risk: "high",
    url: "https://www.cac.gov.cn",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "Content moderation requirements",
      "Algorithm transparency filing",
      "Data localization",
      "Security assessment for cross-border data",
    ],
    penalty: "Up to ¥100,000 per violation + service suspension",
  },
  BRAZIL_LGPD: {
    id: "BRAZIL_LGPD",
    name: "Brazil LGPD + AI Bill",
    shortName: "Brazil LGPD",
    enforcer: "ANPD",
    enforcement_date: "2020-09-18",
    status: "active",
    risk: "medium",
    url: "https://www.gov.br/anpd",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "Data subject rights for automated decisions",
      "Right to human review",
      "Data protection impact assessment",
    ],
    penalty: "Up to 2% of Brazil revenue (max R$50M)",
  },
  UAE_AI: {
    id: "UAE_AI",
    name: "UAE AI Regulation",
    shortName: "UAE AI",
    enforcer: "UAE Ministry of AI",
    enforcement_date: "2024-01-01",
    status: "active",
    risk: "medium",
    url: "https://ai.gov.ae",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "AI ethics principles compliance",
      "National AI strategy alignment",
      "Sector-specific guidelines (DIFC, ADGM)",
    ],
    penalty: "Sector-specific enforcement",
  },
  CANADA_AIDA: {
    id: "CANADA_AIDA",
    name: "Canada AIDA (Bill C-27)",
    shortName: "Canada AIDA",
    enforcer: "ISED Canada",
    enforcement_date: "2025-01-01",
    status: "draft",
    risk: "medium",
    url: "https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "High-impact system designation",
      "Risk mitigation measures",
      "Transparency obligations",
      "Human oversight requirements",
    ],
    penalty: "Up to CAD 25M or 5% global revenue",
  },
  AUSTRALIA_AI: {
    id: "AUSTRALIA_AI",
    name: "Australia AI Ethics Framework",
    shortName: "Australia AI",
    enforcer: "DCCEEW / DISR",
    enforcement_date: "2019-11-01",
    status: "active",
    risk: "low",
    url: "https://www.industry.gov.au/publications/australias-artificial-intelligence-ethics-framework",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "8 AI ethics principles (voluntary)",
      "Transparency and explainability",
      "Human-centered values",
    ],
    penalty: "No direct penalty (voluntary)",
  },
  INDIA_AI: {
    id: "INDIA_AI",
    name: "India AI Policy (Draft)",
    shortName: "India AI",
    enforcer: "MeitY",
    enforcement_date: "2024-03-01",
    status: "draft",
    risk: "medium",
    url: "https://www.meity.gov.in",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "Consent for AI-generated content",
      "Labelling requirements",
      "Intermediary due diligence",
    ],
    penalty: "Under development",
  },
  JAPAN_AI: {
    id: "JAPAN_AI",
    name: "Japan AI Strategy / Guidelines",
    shortName: "Japan AI",
    enforcer: "Cabinet Office / METI",
    enforcement_date: "2023-05-01",
    status: "active",
    risk: "low",
    url: "https://www.meti.go.jp/english/policy/economy/ai/index.html",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "AI guidelines compliance (voluntary)",
      "Human-centric AI principles",
      "Social principles of human-centric AI",
    ],
    penalty: "No direct penalty (voluntary)",
  },
  SOUTH_KOREA_AI: {
    id: "SOUTH_KOREA_AI",
    name: "South Korea AI Act (Draft)",
    shortName: "Korea AI Act",
    enforcer: "MSIT",
    enforcement_date: "2024-01-01",
    status: "draft",
    risk: "medium",
    url: "https://www.msit.go.kr",
    applies_to: ["provider", "deployer"],
    key_obligations: [
      "High-risk AI system notification",
      "Transparency requirements",
      "Impact assessment",
    ],
    penalty: "Under development",
  },
}

// Country → Applicable Regulations mapping
export const COUNTRY_REGULATIONS = {
  // EU Member States → EU AI Act mandatory
  AT: ["EU_AI_ACT"], BE: ["EU_AI_ACT"], BG: ["EU_AI_ACT"],
  HR: ["EU_AI_ACT"], CY: ["EU_AI_ACT"], CZ: ["EU_AI_ACT"],
  DK: ["EU_AI_ACT"], EE: ["EU_AI_ACT"], FI: ["EU_AI_ACT"],
  FR: ["EU_AI_ACT"], DE: ["EU_AI_ACT"], GR: ["EU_AI_ACT"],
  HU: ["EU_AI_ACT"], IE: ["EU_AI_ACT"], IT: ["EU_AI_ACT"],
  LV: ["EU_AI_ACT"], LT: ["EU_AI_ACT"], LU: ["EU_AI_ACT"],
  MT: ["EU_AI_ACT"], NL: ["EU_AI_ACT"], PL: ["EU_AI_ACT"],
  PT: ["EU_AI_ACT"], RO: ["EU_AI_ACT"], SK: ["EU_AI_ACT"],
  SI: ["EU_AI_ACT"], ES: ["EU_AI_ACT"], SE: ["EU_AI_ACT"],

  // EEA
  NO: ["EU_AI_ACT"], IS: ["EU_AI_ACT"], LI: ["EU_AI_ACT"],

  // Others
  GB: ["UK_AI"],
  SG: ["MAS_FEAT"],
  US: ["NIST_AI_RMF", "US_EO_14110"],
  CN: ["CHINA_AI"],
  BR: ["BRAZIL_LGPD"],
  AE: ["UAE_AI"],
  CA: ["CANADA_AIDA"],
  AU: ["AUSTRALIA_AI"],
  IN: ["INDIA_AI"],
  JP: ["JAPAN_AI"],
  KR: ["SOUTH_KOREA_AI"],
}

// Country metadata for map display
export const COUNTRY_META = {
  AT: { name: "Austria", iso3: "AUT", continent: "EU" },
  BE: { name: "Belgium", iso3: "BEL", continent: "EU" },
  BG: { name: "Bulgaria", iso3: "BGR", continent: "EU" },
  HR: { name: "Croatia", iso3: "HRV", continent: "EU" },
  CY: { name: "Cyprus", iso3: "CYP", continent: "EU" },
  CZ: { name: "Czech Republic", iso3: "CZE", continent: "EU" },
  DK: { name: "Denmark", iso3: "DNK", continent: "EU" },
  EE: { name: "Estonia", iso3: "EST", continent: "EU" },
  FI: { name: "Finland", iso3: "FIN", continent: "EU" },
  FR: { name: "France", iso3: "FRA", continent: "EU" },
  DE: { name: "Germany", iso3: "DEU", continent: "EU" },
  GR: { name: "Greece", iso3: "GRC", continent: "EU" },
  HU: { name: "Hungary", iso3: "HUN", continent: "EU" },
  IE: { name: "Ireland", iso3: "IRL", continent: "EU" },
  IT: { name: "Italy", iso3: "ITA", continent: "EU" },
  LV: { name: "Latvia", iso3: "LVA", continent: "EU" },
  LT: { name: "Lithuania", iso3: "LTU", continent: "EU" },
  LU: { name: "Luxembourg", iso3: "LUX", continent: "EU" },
  MT: { name: "Malta", iso3: "MLT", continent: "EU" },
  NL: { name: "Netherlands", iso3: "NLD", continent: "EU" },
  PL: { name: "Poland", iso3: "POL", continent: "EU" },
  PT: { name: "Portugal", iso3: "PRT", continent: "EU" },
  RO: { name: "Romania", iso3: "ROU", continent: "EU" },
  SK: { name: "Slovakia", iso3: "SVK", continent: "EU" },
  SI: { name: "Slovenia", iso3: "SVN", continent: "EU" },
  ES: { name: "Spain", iso3: "ESP", continent: "EU" },
  SE: { name: "Sweden", iso3: "SWE", continent: "EU" },
  NO: { name: "Norway", iso3: "NOR", continent: "EEA" },
  IS: { name: "Iceland", iso3: "ISL", continent: "EEA" },
  LI: { name: "Liechtenstein", iso3: "LIE", continent: "EEA" },
  GB: { name: "United Kingdom", iso3: "GBR", continent: "EU" },
  SG: { name: "Singapore", iso3: "SGP", continent: "AS" },
  US: { name: "United States", iso3: "USA", continent: "NA" },
  CN: { name: "China", iso3: "CHN", continent: "AS" },
  BR: { name: "Brazil", iso3: "BRA", continent: "SA" },
  AE: { name: "UAE", iso3: "ARE", continent: "AS" },
  CA: { name: "Canada", iso3: "CAN", continent: "NA" },
  AU: { name: "Australia", iso3: "AUS", continent: "OC" },
  IN: { name: "India", iso3: "IND", continent: "AS" },
  JP: { name: "Japan", iso3: "JPN", continent: "AS" },
  KR: { name: "South Korea", iso3: "KOR", continent: "AS" },
}

// Compute applicable regulations for a given setup
export function computeApplicableLaws({ registeredCountry, servedCountries, role }) {
  const regIds = new Set()

  // Company registration country
  if (registeredCountry && COUNTRY_REGULATIONS[registeredCountry]) {
    COUNTRY_REGULATIONS[registeredCountry].forEach(r => regIds.add(r))
  }

  // Served countries
  if (servedCountries) {
    servedCountries.forEach(c => {
      if (COUNTRY_REGULATIONS[c]) {
        COUNTRY_REGULATIONS[c].forEach(r => regIds.add(r))
      }
    })
  }

  // Filter by role
  return Array.from(regIds)
    .map(id => REGULATIONS[id])
    .filter(reg => reg && (!role || reg.applies_to.includes(role)))
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 }
      return riskOrder[a.risk] - riskOrder[b.risk]
    })
}
