export type ThreatLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RedFlag {
  id: string;
  category: 'PAYMENT_DEMAND' | 'EQUIPMENT_SCAM' | 'RENTAL_TRAP' | 'DOMAIN_ANOMALY' | 'URGENCY_COERCION' | 'IDENTITY_EVASION';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  flaggedText?: string;
  recommendation: string;
}

export interface DomainAnalysis {
  domain: string;
  isCustomDomain: boolean;
  isFreeEmailProvider: boolean;
  ageDays?: number;
  ageLabel?: string;
  isNewlyRegistered: boolean;
  suspiciousTld: boolean;
  targetBrandLookalike?: string;
  riskScore: number; // 0 - 100
  notes: string[];
}

export interface SubScores {
  paymentRisk: number; // 0 - 100
  domainRisk: number; // 0 - 100
  urgencyRisk: number; // 0 - 100
  authenticityRisk: number; // 0 - 100
}

export interface ScamTimelineStep {
  stepNumber: number;
  dayLabel: string;
  stageName: string;
  victimPerception: string;
  undergroundReality: string;
  riskLevel: 'safe' | 'warning' | 'danger' | 'critical';
  bankingLawNote?: string;
}

export interface FinancialBlastRadius {
  directTheftEstimate: number; // in USD
  demandedAmountDisplay: string;
  bankBouncedCheckFees: number;
  identityRemediationCosts: number;
  totalExposure: number;
  exposureTier: 'LOW' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
}

export interface EmailHeaderAnalysis {
  spfStatus: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE';
  dkimStatus: 'PASS' | 'FAIL' | 'NONE';
  dmarcStatus: 'PASS' | 'FAIL' | 'NONE';
  envelopeFrom: string;
  headerFrom: string;
  isSpoofed: boolean;
  anomalies: string[];
}

export interface AuthenticationPipelineStep {
  stepNumber: number;
  id: string;
  name: string;
  category: string;
  status: 'PASSED' | 'FAILED' | 'SUSPICIOUS';
  isSpamIndicator: boolean;
  whatWasChecked: string;
  evidenceFound: string;
  technicalDetails: string;
  verdictLabel: string; // e.g. "SPAM / SCAM CONFIRMED", "POTENTIAL PHISHING", "AUTHENTICATED"
  verdictExplanation: string;
}

export interface ScanResult {
  threatIndex: number; // 0 - 100
  threatLevel: ThreatLevel;
  summary: string;
  targetType: 'JOB_OFFER' | 'RENTAL_LISTING' | 'RECRUITER_CONTACT' | 'GENERAL_COMMUNICATION';
  domainAnalysis?: DomainAnalysis;
  redFlags: RedFlag[];
  greenFlags: string[];
  subScores: SubScores;
  financialDemandDetected: boolean;
  demandedAmount?: string;
  demandedMethod?: string;
  blastRadius: FinancialBlastRadius;
  timelineSteps: ScamTimelineStep[];
  emailHeaderAnalysis?: EmailHeaderAnalysis;
  authPipeline?: AuthenticationPipelineStep[];
  safeNextSteps: string[];
  analyzedAt: string;
  modelUsed: 'gemini-ai' | 'heuristic-defense-engine';
  hashFingerprint: string;
}

export interface PresetSample {
  id: string;
  title: string;
  subtitle: string;
  type: 'job' | 'rental' | 'domain' | 'headers';
  categoryBadge: string;
  expectedRisk: 'HIGH' | 'CRITICAL' | 'LOW';
  text: string;
  url?: string;
  headers?: string;
}

export interface VerifiedBrandDirectory {
  brandName: string;
  officialCareersUrl: string;
  verifiedDomains: string[];
  knownScamPhrases: string[];
  notes: string;
}
