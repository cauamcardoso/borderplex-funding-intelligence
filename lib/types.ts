// ============================================
// Layer 0: Governance Topology
// ============================================
export interface Jurisdiction {
  id: string;
  name: string;
  state: "TX" | "NM" | "MX";
  governanceType: "city" | "county" | "colonia" | "cdp" | "special_district" | "binational" | "state_agency";
  population: number;
  coordinates: [number, number]; // [lng, lat]
  fundingEligibility: string[];
  planningDocuments: string[];
  problemCount: number;
  description: string;
}

// ============================================
// Layer 1: Problem Registry
// ============================================
export type Sector =
  | "Infrastructure"
  | "Water & Environment"
  | "Workforce Development"
  | "Public Health"
  | "Public Safety"
  | "Economic Development"
  | "Housing"
  | "Transportation"
  | "Technology & Innovation"
  | "Energy"
  | "Education"
  | "Governance";

export type Urgency = "Critical" | "High" | "Medium" | "Low";

export interface Problem {
  id: string;
  title: string;
  statement: string;
  jurisdictionIds: string[];
  sector: Sector;
  urgency: Urgency;
  federalAlignment: string[];
  evidence: string;
  populationAffected: number;
  estimatedScale: string;
  planSource: string;
}

// ============================================
// Layer 2: Capability Model
// ============================================
export type CapabilityTier = "A" | "B";
export type OrganizationType =
  | "utep_center"
  | "utep_institute"
  | "national_lab"
  | "university"
  | "military"
  | "defense_contractor"
  | "manufacturer"
  | "aerospace"
  | "economic_dev"
  | "federal_agency"
  | "logistics";

export type DeliverableType =
  | "Research"
  | "Workforce Training"
  | "Technical Assistance"
  | "Testing & Prototyping"
  | "Policy Analysis"
  | "Convening"
  | "Data & Analytics"
  | "Contract R&D"
  | "Commercialization";

export type Readiness = "0-30 days" | "30-90 days" | "90-180 days";

export interface Capability {
  id: string;
  name: string;
  shortName: string;
  tier: CapabilityTier;
  organizationType: OrganizationType;
  college?: string;
  location: string;
  coordinates: [number, number];
  sectors: Sector[];
  deliverables: DeliverableType[];
  readiness: Readiness;
  description: string;
  capabilities: string[];
  partnerIds: string[];
}

// ============================================
// Layer 3: Funding Landscape
// ============================================
export type FundingSourceLevel = "Federal" | "State-TX" | "State-NM" | "Local" | "Binational" | "Private";
export type FundingType = "Competitive Grant" | "Formula Funding" | "Cooperative Agreement" | "Contract" | "Earmark" | "Match Requirement" | "Tax Credit";
export type FundingCycle = "Annual" | "Rolling" | "Signal-Driven" | "One-Time" | "Biennial";

export interface FundingProgram {
  id: string;
  name: string;
  agency: string;
  sourceLevel: FundingSourceLevel;
  type: FundingType;
  sectors: Sector[];
  awardRangeMin: number;
  awardRangeMax: number;
  cycle: FundingCycle;
  eligibility: string[];
  description: string;
  deadline?: string;
  url?: string;
}

// ============================================
// Layer 4: Match Engine / Alignments
// ============================================
export type UtepRole = "Lead PI" | "Co-PI" | "Convener" | "Technical Assistance" | "Workforce Partner" | "Subcontractor" | "Coordinator";

export interface Alignment {
  id: string;
  score: number; // 0-100
  problemId: string;
  capabilityIds: string[];
  fundingIds: string[];
  utepRole: UtepRole;
  rationale: string;
  partnershipStructure: string;
  estimatedValue: string;
  timeToSubmission: string;
  gaps: string[];
}

// ============================================
// UI State Types
// ============================================
export interface FilterState {
  sectors: Sector[];
  jurisdictions: string[];
  urgency: Urgency[];
  sourceLevel: FundingSourceLevel[];
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}
