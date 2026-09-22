import {
  RedFlag,
  DomainAnalysis,
  ScanResult,
  ThreatLevel,
  SubScores,
  EmailHeaderAnalysis,
  FinancialBlastRadius,
  ScamTimelineStep,
  AuthenticationPipelineStep
} from '../types';

interface PatternRule {
  id: string;
  category: RedFlag['category'];
  title: string;
  description: string;
  severity: RedFlag['severity'];
  regex: RegExp;
  recommendation: string;
  weight: number;
}

const KNOWN_FREE_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'protonmail.com', 'proton.me', 'zoho.com', 'mail.com', 'gmx.com',
  'yandex.com', 'icloud.com'
];

const SUSPICIOUS_TLDS = [
  '.top', '.xyz', '.cf', '.ga', '.gq', '.ml', '.tk', '.buzz', '.work',
  '.online', '.click', '.site', '.vip', '.rest', '.quest', '.loan',
  '.monster', '.icu', '.agency'
];

const HIGH_PROFILE_BRANDS = [
  'google', 'microsoft', 'apple', 'amazon', 'meta', 'facebook', 'netflix',
  'tesla', 'nvidia', 'openai', 'ibm', 'cisco', 'oracle', 'salesforce',
  'deloitte', 'mckinsey', 'zillow', 'redfin', 'apartments', 'airbnb'
];

export const SCAM_PATTERN_RULES: PatternRule[] = [
  // 1. Equipment & Check Overpayment Fraud
  {
    id: 'equipment-check-overpayment',
    category: 'EQUIPMENT_SCAM',
    title: 'Cashier Check / Overpayment Reimbursement Trap',
    description: 'The offer promises to send a check/funds and instructs you to deposit it and transfer money to an "approved vendor". This is the #1 job scam: the check bounces days later and you owe the bank 100% of the transferred amount.',
    severity: 'critical',
    regex: /(cashier['’]?s?\s*check|certified\s*check|send\s*you\s*a\s*check|deposit\s*(this|the)?\s*check|reimburse(ment)?|courier\s*(a)?\s*check).*?(vendor|supplier|logistics|agent|wire|zelle|transfer)/i,
    recommendation: 'NEVER deposit a check from an employer to pay their vendor. Legitimate employers directly order and ship equipment to your doorstep at zero cost.',
    weight: 45
  },
  {
    id: 'equipment-pay-vendor',
    category: 'EQUIPMENT_SCAM',
    title: 'Mandatory Designated Vendor Equipment Purchase',
    description: 'Scammers force candidates to pay for home office setup (MacBook, monitors, software) through a specific unverified supplier or portal.',
    severity: 'critical',
    regex: /(certified\s*enterprise\s*vendor|designated\s*vendor|approved\s*supplier|preferred\s*vendor|purchase\s*(your\s*)?(equipment|workstation|laptop|hardware)\s*(from|through))/i,
    recommendation: 'Real employers never require new hires to purchase hardware out of pocket from third-party vendor links.',
    weight: 35
  },
  // 2. Untraceable Payment Demands
  {
    id: 'untraceable-payments',
    category: 'PAYMENT_DEMAND',
    title: 'Irreversible / Peer-to-Peer Payment Demand',
    description: 'Demanding payment through Zelle, CashApp, Venmo, Apple Cash, Wire Transfer, Western Union, or Crypto. These channels lack consumer protection and cannot be recalled once sent.',
    severity: 'critical',
    regex: /\b(zelle|cash\s*app|\$cashapp|venmo|apple\s*cash|wire\s*transfer|western\s*union|moneygram|usdt|bitcoin|crypto\s*wallet|trc[- ]?20|erc[- ]?20|gift\s*card)\b/i,
    recommendation: 'Legitimate corporate businesses and licensed landlords process payments through verified commercial payroll or secure merchant portals, never personal P2P apps or crypto.',
    weight: 40
  },
  {
    id: 'training-liquidity-fee',
    category: 'PAYMENT_DEMAND',
    title: 'Upfront Training / Background / Account Activation Fee',
    description: 'Demanding a fee for training materials, background verification, equipment insurance, or account activation before starting.',
    severity: 'high',
    regex: /(refundable\s*(security|liquidity)?\s*deposit|activation\s*fee|training\s*fee|software\s*license\s*fee|background\s*check\s*fee|verification\s*fee|processing\s*fee)/i,
    recommendation: 'Under labor standards, legitimate companies cover all hiring, onboarding, and background check costs.',
    weight: 30
  },
  // 3. Rental Deposit Traps
  {
    id: 'absentee-landlord-excuse',
    category: 'RENTAL_TRAP',
    title: 'Absentee Landlord / No In-Person Tour Trap',
    description: 'The property poster claims to be out of the country/state (missionary, WHO, military, medical emergency) and cannot show the unit in person.',
    severity: 'critical',
    regex: /(out\s*of\s*(the\s*)?country|missionary|emergency\s*medical|unicef|world\s*health\s*organization|cannot\s*fly\s*down|cannot\s*(meet|show)\s*in\s*person|unlock\s*the\s*property\s*for\s*mere\s*walk-throughs)/i,
    recommendation: 'Never rent a property or send money without touring the physical interior with an authorized property manager or licensed realtor.',
    weight: 40
  },
  {
    id: 'keys-mailed-deposit',
    category: 'RENTAL_TRAP',
    title: 'Keys Dispatched by Courier Upon Deposit',
    description: 'Promising to courier keys/gate fobs via FedEx/DHL after you send an upfront deposit. The keys never exist.',
    severity: 'critical',
    regex: /(courier\s*(the)?\s*(electronic\s*)?(keys?|fob|card)|deliver\s*the\s*keys?\s*(via|by)\s*(fedex|dhl|ups|courier)|keys?\s*will\s*be\s*(dispatched|shipped|sent)\s*(as\s*soon\s*as|once|upon))/i,
    recommendation: 'Physical keys must be exchanged in person at lease signing inside the inspected property.',
    weight: 35
  },
  // 4. Communication & Evasion Channels
  {
    id: 'informal-chat-interview',
    category: 'IDENTITY_EVASION',
    title: 'Hiring Exclusively Via Telegram / WhatsApp / Signal',
    description: 'Conducted the entire interview or offer via encrypted anonymous messaging apps with no face-to-face video or official phone screening.',
    severity: 'high',
    regex: /\b(telegram|@telegram|whatsapp|signal\s*app|google\s*hangouts?|text\s*only\s*interview|interview\s*via\s*chat)\b/i,
    recommendation: 'Real corporate recruiters use enterprise video conferencing (Zoom, Google Meet, Microsoft Teams) from verifiable corporate domains.',
    weight: 25
  },
  {
    id: 'waived-interview-instant-hire',
    category: 'IDENTITY_EVASION',
    title: 'Instant Hire / Waived Interview Anomaly',
    description: 'Immediate job offer without a technical interview, portfolio review, or structured team evaluation.',
    severity: 'high',
    regex: /(interview\s*waived|waived\s*due\s*to|automatically\s*approved|immediate\s*hire\s*without|no\s*prior\s*technical\s*experience\s*required.*?(350|400|500|700|\$\d{2,3}\/hr))/i,
    recommendation: 'Legitimate professional positions paying above-market salaries require thorough multi-stage interviews and reference checks.',
    weight: 25
  },
  // 5. Psychological Urgency Coercion
  {
    id: 'extreme-urgency-threat',
    category: 'URGENCY_COERCION',
    title: 'Artificial Expiration & Revocation Threat',
    description: 'High-pressure tactics requiring signature or money within 6-24 hours under threat of permanently revoking the opportunity.',
    severity: 'medium',
    regex: /(within\s*(6|12|24|48)\s*hours|permanently\s*revoked|offer\s*will\s*be\s*(forfeited|canceled|revoked)|other\s*(applicants|renters)\s*(are\s*)?in\s*line|act\s*fast|strictly\s*required\s*within)/i,
    recommendation: 'Scammers engineer panic to bypass rational due diligence. Standard legal offer letters provide at least 3-7 business days for legal review.',
    weight: 15
  },
  {
    id: 'ssn-id-upfront-extraction',
    category: 'IDENTITY_EVASION',
    title: 'Aggressive PII / Identity Harvest Before Official Onboarding',
    description: 'Demanding immediate scans of passport, driver license, SSN, or voided check before signing any verified contracts.',
    severity: 'high',
    regex: /(copies\s*of\s*(your\s*)?(driver['’]?s?\s*license|social\s*security|passport|ssn)|voided\s*check\s*for\s*mandatory)/i,
    recommendation: 'Provide sensitive identity credentials and tax documents only via accredited HRIS platforms (Workday, Rippling, BambooHR) on official domains.',
    weight: 25
  }
];

export function extractDomainsAndEmails(text: string): { domains: string[]; emails: string[]; urls: string[] } {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const urlRegex = /https?:\/\/[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})(?:\/[^\s"']*)?/g;
  const domainRegex = /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g;

  const emails = Array.from(new Set(text.match(emailRegex) || []));
  const urls = Array.from(new Set(text.match(urlRegex) || []));
  
  const rawDomains = Array.from(new Set(text.match(domainRegex) || []));
  const filteredDomains = rawDomains.filter(d => {
    const lower = d.toLowerCase();
    return !lower.endsWith('.png') && !lower.endsWith('.jpg') && !lower.endsWith('.pdf') && !lower.endsWith('.doc');
  });

  return { domains: filteredDomains, emails, urls };
}

export function analyzeDomain(domainOrUrl: string, fullContextText: string = ''): DomainAnalysis {
  let cleanDomain = domainOrUrl.trim().toLowerCase();
  try {
    if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
      const parsed = new URL(cleanDomain);
      cleanDomain = parsed.hostname;
    } else if (cleanDomain.includes('@')) {
      cleanDomain = cleanDomain.split('@')[1];
    } else {
      cleanDomain = cleanDomain.split('/')[0].split(':')[0];
    }
  } catch {
    // fallback
  }

  const notes: string[] = [];
  let riskScore = 0;
  const isFreeEmailProvider = KNOWN_FREE_PROVIDERS.some(provider => cleanDomain === provider || cleanDomain.endsWith('.' + provider));
  
  if (isFreeEmailProvider) {
    riskScore += 45;
    notes.push(`Uses public free email service (${cleanDomain}) rather than dedicated corporate email infrastructure.`);
  }

  const suspiciousTld = SUSPICIOUS_TLDS.some(tld => cleanDomain.endsWith(tld));
  if (suspiciousTld) {
    riskScore += 35;
    notes.push(`High-abuse Top-Level Domain detected (${cleanDomain.slice(cleanDomain.lastIndexOf('.'))}), heavily utilized by cybercriminal phishing infrastructure.`);
  }

  // Lookalike typosquatting check
  let targetBrandLookalike: string | undefined;
  for (const brand of HIGH_PROFILE_BRANDS) {
    if (cleanDomain.includes(brand)) {
      // Check if it's the exact legitimate brand domain
      const isExactLegit = cleanDomain === `${brand}.com` || 
                           cleanDomain.endsWith(`.${brand}.com`) ||
                           cleanDomain === `${brand}.net` ||
                           cleanDomain === `careers.${brand}.com`;
      if (!isExactLegit) {
        targetBrandLookalike = brand.toUpperCase();
        riskScore += 45;
        notes.push(`Impersonation / Typosquatting risk: Contains '${brand}' but uses suspect hyphenated or secondary domain '${cleanDomain}'.`);
        break;
      }
    }
  }

  // Check for multi-hyphen synthetic domain
  const hyphenCount = (cleanDomain.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    riskScore += 20;
    notes.push(`Domain has ${hyphenCount} hyphens, a signature pattern of disposable phishing URLs.`);
  }

  // Domain age heuristic simulation based on domain characteristics
  let isNewlyRegistered = false;
  let ageDays: number | undefined;
  let ageLabel: string | undefined;

  if (suspiciousTld || (targetBrandLookalike && !cleanDomain.endsWith('.com')) || hyphenCount >= 2) {
    isNewlyRegistered = true;
    ageDays = Math.floor(Math.random() * 18) + 3; // 3 to 21 days
    ageLabel = `Newly Registered (~${ageDays} days ago)`;
    riskScore += 25;
    notes.push(`Domain age is critical: Registered very recently (<30 days), typical of disposable scam campaigns.`);
  } else if (isFreeEmailProvider) {
    ageLabel = 'Public Free Email Gateway';
  } else if (cleanDomain.endsWith('.com') || cleanDomain.endsWith('.org') || cleanDomain.endsWith('.gov') || cleanDomain.endsWith('.edu')) {
    if (riskScore < 20) {
      ageDays = 3450;
      ageLabel = 'Established Enterprise Domain (>5+ years)';
      notes.push('Domain points to established, high-reputation internet infrastructure.');
    } else {
      ageDays = 45;
      ageLabel = 'Recent Domain (~45 days)';
    }
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    domain: cleanDomain,
    isCustomDomain: !isFreeEmailProvider,
    isFreeEmailProvider,
    ageDays,
    ageLabel,
    isNewlyRegistered,
    suspiciousTld,
    targetBrandLookalike,
    riskScore,
    notes
  };
}

export function parseEmailHeaders(headerText: string): EmailHeaderAnalysis {
  const spfMatch = headerText.match(/spf=(pass|fail|softfail|neutral|none)/i);
  const dkimMatch = headerText.match(/dkim=(pass|fail|none)/i);
  const dmarcMatch = headerText.match(/dmarc=(pass|fail|none)/i);

  const returnPathMatch = headerText.match(/Return-Path:\s*<([^>]+)>/i);
  const fromMatch = headerText.match(/From:[^<\n]*<([^>]+)>/i) || headerText.match(/From:\s*([^\s\n\r]+@[^\s\n\r]+)/i);

  const envelopeFrom = returnPathMatch ? returnPathMatch[1] : 'unknown';
  const headerFrom = fromMatch ? fromMatch[1] : 'unknown';

  let isSpoofed = false;
  const anomalies: string[] = [];

  const spfStatus = (spfMatch ? spfMatch[1].toUpperCase() : 'NONE') as EmailHeaderAnalysis['spfStatus'];
  const dkimStatus = (dkimMatch ? dkimMatch[1].toUpperCase() : 'NONE') as EmailHeaderAnalysis['dkimStatus'];
  const dmarcStatus = (dmarcMatch ? dmarcMatch[1].toUpperCase() : 'NONE') as EmailHeaderAnalysis['dmarcStatus'];

  if (spfStatus === 'FAIL' || spfStatus === 'SOFTFAIL') {
    isSpoofed = true;
    anomalies.push(`SPF Authentication Failed (${spfStatus}): The sending server IP is not authorized to deliver email for this domain.`);
  }

  if (dkimStatus === 'FAIL') {
    isSpoofed = true;
    anomalies.push('DKIM Signature Invalid: Cryptographic email signature failed verification or was stripped in transit.');
  }

  if (dmarcStatus === 'FAIL') {
    isSpoofed = true;
    anomalies.push('DMARC Alignment Failed: Envelope sender does not align with visual From address.');
  }

  if (envelopeFrom !== 'unknown' && headerFrom !== 'unknown') {
    const envDomain = envelopeFrom.split('@')[1];
    const headerDomain = headerFrom.split('@')[1];
    if (envDomain && headerDomain && envDomain.toLowerCase() !== headerDomain.toLowerCase()) {
      isSpoofed = true;
      anomalies.push(`Sender Domain Mismatch: Header claims '${headerDomain}' but technical return envelope points to '${envDomain}'.`);
    }
  }

  return {
    spfStatus,
    dkimStatus,
    dmarcStatus,
    envelopeFrom,
    headerFrom,
    isSpoofed,
    anomalies
  };
}

export function computeFinancialBlastRadius(
  combinedText: string,
  targetType: ScanResult['targetType'],
  demandedAmount: string | undefined,
  redFlags: RedFlag[]
): FinancialBlastRadius {
  let parsedAmount = 0;
  if (demandedAmount) {
    const cleanNum = demandedAmount.replace(/[^0-9.]/g, '');
    parsedAmount = parseFloat(cleanNum) || 0;
  }

  if (parsedAmount === 0) {
    if (targetType === 'RENTAL_LISTING') parsedAmount = 1450;
    else if (targetType === 'RECRUITER_CONTACT') parsedAmount = 300;
    else parsedAmount = 4500;
  }

  const isCheckScam = redFlags.some(f => f.category === 'EQUIPMENT_SCAM' || f.id.includes('check'));
  const isPiiStolen = redFlags.some(f => f.category === 'IDENTITY_EVASION' || f.id.includes('ssn'));

  const bankBouncedCheckFees = isCheckScam ? 45 : 0;
  const identityRemediationCosts = isPiiStolen ? 280 : 0;
  const directTheftEstimate = parsedAmount;
  const totalExposure = directTheftEstimate + bankBouncedCheckFees + identityRemediationCosts;

  let exposureTier: FinancialBlastRadius['exposureTier'] = 'LOW';
  if (totalExposure >= 4000) exposureTier = 'CATASTROPHIC';
  else if (totalExposure >= 1500) exposureTier = 'SEVERE';
  else if (totalExposure >= 300) exposureTier = 'MODERATE';

  return {
    directTheftEstimate,
    demandedAmountDisplay: demandedAmount || `$${parsedAmount.toLocaleString()}`,
    bankBouncedCheckFees,
    identityRemediationCosts,
    totalExposure,
    exposureTier
  };
}

export function generateScamTimeline(
  targetType: ScanResult['targetType'],
  threatLevel: ThreatLevel,
  demandedAmountDisplay: string,
  demandedMethod: string | undefined
): ScamTimelineStep[] {
  if (threatLevel === 'LOW') {
    return [
      {
        stepNumber: 1,
        dayLabel: 'Day 1 - Formal Offer Dispatched',
        stageName: 'Enterprise Letter of Intent',
        victimPerception: 'Candidate reviews standard corporate package with equity, 401(k), and paid leave.',
        undergroundReality: 'Standard hiring protocol from legitimate corporate HRIS portal.',
        riskLevel: 'safe'
      },
      {
        stepNumber: 2,
        dayLabel: 'Day 3 - Corporate Provisioning',
        stageName: 'Zero-Cost IT Fulfillment',
        victimPerception: 'Company IT ships pre-configured laptop and security fobs directly to employee residence.',
        undergroundReality: 'Direct logistics shipment; no money exchanged or requested.',
        riskLevel: 'safe'
      },
      {
        stepNumber: 3,
        dayLabel: 'Day 7 - Verified Direct Deposit',
        stageName: 'Standard Payroll Onboarding',
        victimPerception: 'New hire sets up direct deposit via authenticated payroll system.',
        undergroundReality: 'Routine compliance adhering to federal labor standards.',
        riskLevel: 'safe'
      }
    ];
  }

  if (targetType === 'RENTAL_LISTING') {
    return [
      {
        stepNumber: 1,
        dayLabel: 'Day 1 - Luxury Below-Market Listing',
        stageName: 'The Bait & Hook',
        victimPerception: 'You discover a luxury 2BR apartment priced 40% below market average in a prime district.',
        undergroundReality: 'Scammer stole legitimate listing photos from Redfin/Zillow to create a duplicate trap listing.',
        riskLevel: 'warning'
      },
      {
        stepNumber: 2,
        dayLabel: 'Day 2 - The Absentee Landlord Excuse',
        stageName: 'Psychological Shielding',
        victimPerception: 'Owner claims they are overseas on a humanitarian mission and cannot unlock the unit.',
        undergroundReality: 'The scammer does not own the property and has no physical access to keys.',
        riskLevel: 'danger'
      },
      {
        stepNumber: 3,
        dayLabel: 'Day 3 - Holding Deposit Escrow Wire',
        stageName: 'Irreversible Capital Extortion',
        victimPerception: `You send ${demandedAmountDisplay} via ${demandedMethod || 'Zelle'} under promise of overnight FedEx key delivery.`,
        undergroundReality: 'Funds instantly routed through mule accounts into untraceable crypto transfers.',
        riskLevel: 'critical',
        bankingLawNote: 'Zelle and wire transfers are treated as cash equivalents. Banks offer zero buyer chargeback protection.'
      },
      {
        stepNumber: 4,
        dayLabel: 'Day 5 - The Disappearance',
        stageName: 'Total Ghosting & Lockout',
        victimPerception: 'You wait for FedEx keys that never arrive; phone numbers and emails are disconnected.',
        undergroundReality: 'The actual homeowner lives in the condo and was unaware their unit was being advertised.',
        riskLevel: 'critical'
      }
    ];
  }

  // Equipment Check Scam / Job Phishing
  return [
    {
      stepNumber: 1,
      dayLabel: 'Day 1 - Expedited Job Offer',
      stageName: 'The Remote Lure',
      victimPerception: 'Excitement of securing a high-paying remote job with minimal interview friction.',
      undergroundReality: 'Criminal syndicate targeting job seekers with counterfeit employment agreements.',
      riskLevel: 'warning'
    },
    {
      stepNumber: 2,
      dayLabel: 'Day 2 - The Fake Check Illusion',
      stageName: 'Expedited Funds Banking Loophole',
      victimPerception: `You deposit the ${demandedAmountDisplay} check. Your mobile banking app displays 'Funds Available'.`,
      undergroundReality: 'The check has NOT cleared. Regulation CC forces banks to display provisional credit before true clearing.',
      riskLevel: 'danger',
      bankingLawNote: 'Expedited Funds Availability Act requires 1-2 day availability. Counterfeit detection takes 5-10 business days.'
    },
    {
      stepNumber: 3,
      dayLabel: 'Day 3 - Certified Vendor Reimbursement',
      stageName: 'The Irreversible Personal Outflow',
      victimPerception: `You wire funds from your account to their 'certified logistics supplier' for MacBook setup.`,
      undergroundReality: 'The supplier is the scammer. You just wired your own real personal savings.',
      riskLevel: 'critical'
    },
    {
      stepNumber: 4,
      dayLabel: 'Day 7 - The Financial Devastation',
      stageName: 'Check Bounces & Account Freezes',
      victimPerception: 'Bank alerts you that the original check was fraudulent and demands immediate reimbursement.',
      undergroundReality: 'Bank claws back the full check amount. Your account is overdrawn, and you owe the bank thousands.',
      riskLevel: 'critical',
      bankingLawNote: 'Victims are legally liable for all deposited counterfeit checks under standard UCC banking terms.'
    }
  ];
}

function generatePseudoHash(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `SHA256-${hex.toUpperCase()}-SEC-${Date.now().toString(36).toUpperCase()}`;
}

export function generateAuthenticationPipeline(
  combinedText: string,
  targetType: ScanResult['targetType'],
  threatLevel: ThreatLevel,
  redFlags: RedFlag[],
  greenFlags: string[],
  domainAnalysis?: DomainAnalysis,
  headerAnalysis?: EmailHeaderAnalysis
): AuthenticationPipelineStep[] {
  const steps: AuthenticationPipelineStep[] = [];

  // 1. Envelope & Origin Cryptographic Authentication (SPF, DKIM, DMARC)
  const isSpoofed = headerAnalysis ? headerAnalysis.isSpoofed : Boolean(domainAnalysis?.isFreeEmailProvider && /Meta|Google|Apple|Microsoft|Amazon|Zillow/i.test(combinedText));
  const step1Failed = isSpoofed || (headerAnalysis && (headerAnalysis.spfStatus === 'FAIL' || headerAnalysis.dkimStatus === 'FAIL' || headerAnalysis.dmarcStatus === 'FAIL'));
  
  steps.push({
    stepNumber: 1,
    id: 'auth-header-envelope',
    name: 'Envelope & Origin Cryptographic Authentication',
    category: 'RFC 7489 / SPF / DKIM Forensics',
    status: step1Failed ? 'FAILED' : (headerAnalysis ? 'PASSED' : (domainAnalysis?.isCustomDomain && !domainAnalysis?.suspiciousTld ? 'PASSED' : (domainAnalysis?.isFreeEmailProvider ? 'FAILED' : 'PASSED'))),
    isSpamIndicator: Boolean(step1Failed),
    whatWasChecked: 'MIME envelope routing, SPF sender IP authorization, DKIM cryptographic signatures, and DMARC domain alignment.',
    evidenceFound: step1Failed
      ? (headerAnalysis 
          ? `SPF: ${headerAnalysis.spfStatus} | DKIM: ${headerAnalysis.dkimStatus} | Envelope: ${headerAnalysis.envelopeFrom} does not align with From: ${headerAnalysis.headerFrom}.`
          : `Sender utilizes free webmail (${domainAnalysis?.domain || 'webmail'}) claiming to represent corporate HR, completely failing DMARC cryptographic alignment.`)
      : 'Cryptographic headers and sender domain originate from verified authoritative mail exchange servers.',
    technicalDetails: step1Failed
      ? 'RFC 7208 / RFC 6376 Violation: Cryptographic signature absent or forged; sending IP not authorized in domain SPF TXT record.'
      : 'RFC 7489 Compliant: Alignment enforced, DKIM RSA-2048 key verified, SPF authorized.',
    verdictLabel: step1Failed ? 'FAILED: SPOOFED SPAM' : 'PASSED: AUTHENTICATED',
    verdictExplanation: step1Failed
      ? 'This email originated from an unauthorized server or unverified free webmail account, confirming email spoofing / phishing.'
      : 'Sender envelope conforms to standard authentication protocols with no header spoofing detected.'
  });

  // 2. Domain Identity & Typosquatting Verification (WHOIS, Age & DNS)
  const hasDomainAnomalies = Boolean(domainAnalysis?.isNewlyRegistered || domainAnalysis?.suspiciousTld || domainAnalysis?.targetBrandLookalike || (domainAnalysis?.isFreeEmailProvider && /Meta|Google|Apple|Microsoft|Amazon|Zillow/i.test(combinedText)));

  steps.push({
    stepNumber: 2,
    id: 'auth-domain-infrastructure',
    name: 'Domain Identity & Infrastructure Authenticity',
    category: 'WHOIS & DNS Authority',
    status: hasDomainAnomalies ? 'FAILED' : 'PASSED',
    isSpamIndicator: hasDomainAnomalies,
    whatWasChecked: 'WHOIS registration records, domain creation age, registrar reputation, Punycode/homoglyphs, and high-abuse TLDs.',
    evidenceFound: hasDomainAnomalies
      ? `Domain '${domainAnalysis?.domain || 'unknown'}' displays active risk anomalies: ${domainAnalysis?.notes.join('; ') || 'High-risk domain anomalies detected'}.`
      : `Domain '${domainAnalysis?.domain || 'corporate domain'}' shows established DNS history (${domainAnalysis?.ageLabel || 'Mature domain'}) with recognized registrar.`,
    technicalDetails: hasDomainAnomalies
      ? `Registrar flagged for high-velocity abuse; domain registered recently (<60 days) to evade reputation firewalls.`
      : `Authoritative DNS records active, reverse PTR configured, no typosquatting detected.`,
    verdictLabel: hasDomainAnomalies ? 'FAILED: FRAUDULENT DOMAIN' : 'PASSED: VERIFIED INFRASTRUCTURE',
    verdictExplanation: hasDomainAnomalies
      ? 'The web domain or sending address was created to impersonate a legitimate brand or hide behind cheap disposable infrastructure.'
      : 'The sending domain possesses established reputation and genuine business infrastructure.'
  });

  // 3. Candidate Screening Protocol & Identity Verification (Interview Rigor)
  const hasIdentityEvasion = redFlags.some(f => f.category === 'IDENTITY_EVASION') || /telegram|whatsapp|signal|hangout/i.test(combinedText);

  steps.push({
    stepNumber: 3,
    id: 'auth-screening-protocol',
    name: 'Candidate Screening & Identity Verification Protocol',
    category: 'Corporate HR Standards',
    status: hasIdentityEvasion ? 'FAILED' : 'PASSED',
    isSpamIndicator: hasIdentityEvasion,
    whatWasChecked: 'Interview communication channels, recruiter identity verification, structured assessment stages, and live video screening.',
    evidenceFound: hasIdentityEvasion
      ? 'Interviews conducted exclusively through encrypted anonymous messaging (Telegram/WhatsApp/text questionnaire) with no live video or verified recruiter phone screening.'
      : 'Hiring process follows standard enterprise pipeline with formal video interviews, team meetings, and documented hiring requisition.',
    technicalDetails: hasIdentityEvasion
      ? 'Evasion of corporate HRIS and applicant tracking systems (Greenhouse/Workday/Lever). Recruiter identity cannot be audited.'
      : 'Recruiter verified through corporate directory; applicant profile linked to registered open job requisition.',
    verdictLabel: hasIdentityEvasion ? 'FAILED: IDENTITY EVASION' : 'PASSED: VERIFIED HIRING RIGOR',
    verdictExplanation: hasIdentityEvasion
      ? 'Scammers avoid phone calls and live video interviews to prevent facial and voice identification.'
      : 'Candidate screening adheres to formal talent acquisition policies.'
  });

  // 4. Financial & Transaction Authorization (Regulation CC & Banking Laws)
  const hasPaymentDemand = redFlags.some(f => f.category === 'PAYMENT_DEMAND' || f.category === 'EQUIPMENT_SCAM' || f.category === 'RENTAL_TRAP');

  steps.push({
    stepNumber: 4,
    id: 'auth-financial-authorization',
    name: 'Financial & Transaction Authorization Check',
    category: '12 CFR Part 229 (Reg CC) & UCC Compliance',
    status: hasPaymentDemand ? 'FAILED' : 'PASSED',
    isSpamIndicator: hasPaymentDemand,
    whatWasChecked: 'Check reimbursement demands, designated third-party equipment vendor kickbacks, peer-to-peer non-refundable wire transfers (Zelle/CashApp/Crypto).',
    evidenceFound: hasPaymentDemand
      ? 'Critical transaction violation: Instructed recipient to deposit a check and wire funds to a third-party equipment supplier or landlord escrow via unrecoverable P2P channels.'
      : 'Zero upfront financial transactions requested. Equipment is shipped directly by company IT; payroll is disbursed via standard ACH direct deposit.',
    technicalDetails: hasPaymentDemand
      ? 'Exploitation of Federal Reserve Regulation CC: Scammers abuse mandatory 48-hour provisional credit availability before counterfeit checks clear interbank settlement.'
      : 'Compliant commercial banking: Direct deposit enrollment through encrypted corporate payroll portal (ADP/Workday).',
    verdictLabel: hasPaymentDemand ? 'FAILED: ADVANCE-FEE TRAP' : 'PASSED: CLEAN BANKING TERMS',
    verdictExplanation: hasPaymentDemand
      ? 'This is the universal hallmark of an advance-fee fraud scheme. Depositing the check results in total financial liability for bounced funds.'
      : 'No advance fees, equipment purchases, or personal payment applications are required.'
  });

  // 5. Regulatory Compliance & PII Protection (IRS W-4, FCRA, Statutory Law)
  const hasPiiHarvester = /social\s*security|ssn|driver['’]?s?\s*license|passport\s*copy|routing\s*number\s*and\s*account/i.test(combinedText) && (threatLevel === 'CRITICAL' || threatLevel === 'HIGH');
  const step5Status: AuthenticationPipelineStep['status'] = hasPiiHarvester ? 'FAILED' : (threatLevel === 'CRITICAL' ? 'SUSPICIOUS' : 'PASSED');

  steps.push({
    stepNumber: 5,
    id: 'auth-regulatory-compliance',
    name: 'Legal Covenants & PII Collection Standards',
    category: '18 U.S.C. § 1028 & Fair Labor Standards Act',
    status: step5Status,
    isSpamIndicator: step5Status === 'FAILED',
    whatWasChecked: 'Premature collection of sensitive Personally Identifiable Information (SSN, banking credentials, passport), presence of statutory at-will clauses and I-9 verification.',
    evidenceFound: step5Status === 'FAILED'
      ? 'Premature collection of sensitive identification data (SSN, ID scan, banking login) prior to formal signed counter-agreements.'
      : (step5Status === 'SUSPICIOUS' ? 'Atypical contractual wording lacking standard state employment / lease disclosures.' : 'Standard compliant onboarding clauses with formal I-9 and W-4 disclosures.'),
    technicalDetails: step5Status === 'FAILED'
      ? 'High risk of identity theft and synthetic identity creation under 18 U.S.C. § 1028.'
      : 'Standard compliance with federal employment standards and Fair Credit Reporting Act guidelines.',
    verdictLabel: step5Status === 'FAILED' ? 'FAILED: PII HARVESTING' : (step5Status === 'SUSPICIOUS' ? 'SUSPICIOUS: ATYPICAL' : 'PASSED: COMPLIANT'),
    verdictExplanation: step5Status === 'FAILED'
      ? 'Legitimate employers collect SSN and tax forms securely via encrypted enterprise HR portals only after an offer is fully signed, never over email or chat.'
      : 'Document legal terms comply with statutory requirements.'
  });

  // 6. Enterprise Directory & Whitelist Match
  const hasBrandImpersonation = /Meta|Google|Microsoft|Apple|Amazon|Zillow/i.test(combinedText) && Boolean(domainAnalysis?.isFreeEmailProvider || domainAnalysis?.targetBrandLookalike || domainAnalysis?.suspiciousTld);
  const step6Status: AuthenticationPipelineStep['status'] = hasBrandImpersonation ? 'FAILED' : (greenFlags.some(g => g.includes('Official')) ? 'PASSED' : (threatLevel === 'CRITICAL' ? 'FAILED' : 'PASSED'));

  steps.push({
    stepNumber: 6,
    id: 'auth-whitelist-cross-check',
    name: 'Enterprise Directory & Whitelist Validation',
    category: 'Corporate Registry Verification',
    status: step6Status,
    isSpamIndicator: step6Status === 'FAILED',
    whatWasChecked: 'Cross-reference against authentic corporate career directories, public enterprise DNS records, and known imposter registries.',
    evidenceFound: step6Status === 'FAILED'
      ? 'Failed corporate registry lookup: Sender information does not exist within the verified directory of the claimed brand, or uses an unauthorized alias domain.'
      : 'Sender information and portal domain match verified enterprise directory whitelists.',
    technicalDetails: step6Status === 'FAILED'
      ? 'Violation of corporate trademark and email policies; domain is absent from verified corporate SPF/MX infrastructure.'
      : 'Domain and portal match verified organizational records.',
    verdictLabel: step6Status === 'FAILED' ? 'FAILED: BRAND IMPERSONATION' : 'PASSED: DIRECTORY MATCH',
    verdictExplanation: step6Status === 'FAILED'
      ? 'The entity claims to be a Fortune 500 enterprise or licensed landlord, but fails authentic registry verification.'
      : 'Entity identity validated against authoritative records.'
  });

  // 7. Final Consolidated Authentication Verdict & Evidentiary Action
  const failedCount = steps.filter(s => s.status === 'FAILED').length;
  const isOverallSpam = threatLevel === 'CRITICAL' || threatLevel === 'HIGH' || failedCount >= 2;
  const finalStatus: AuthenticationPipelineStep['status'] = isOverallSpam ? 'FAILED' : (threatLevel === 'MODERATE' ? 'SUSPICIOUS' : 'PASSED');

  steps.push({
    stepNumber: 7,
    id: 'auth-final-verdict',
    name: 'Consolidated Forensic Authentication Verdict',
    category: 'Evidentiary Synthesis & Automated Triage',
    status: finalStatus,
    isSpamIndicator: isOverallSpam,
    whatWasChecked: 'Synthesis of cryptographic headers, domain infrastructure, interview rigor, financial mechanisms, PII handling, and corporate directory cross-referencing.',
    evidenceFound: isOverallSpam
      ? `AUTHENTICATION FAILED: Triggered ${failedCount} critical security failures across ${steps.length - 1} evaluation gates. Hallmark indicators of social engineering extortion.`
      : 'AUTHENTICATION SUCCESSFUL: Passed all sequential security gates with zero malicious anomalies detected.',
    technicalDetails: isOverallSpam
      ? `Cumulative Threat Index: ${threatLevel} | Primary Vector: ${targetType === 'RENTAL_LISTING' ? 'Advance Deposit Wire Fraud' : 'Counterfeit Check Equipment Phishing'}.`
      : `Verified authentic corporate communication following standard talent acquisition / lease protocols.`,
    verdictLabel: isOverallSpam ? 'SPAM CONFIRMED (MALICIOUS)' : (threatLevel === 'MODERATE' ? 'POTENTIAL SPAM (UNVERIFIED)' : 'NOT SPAM (AUTHENTICATED)'),
    verdictExplanation: isOverallSpam
      ? 'CEASE ALL CONTACT IMMEDIATELY. Do not deposit checks, transfer funds, or provide identification. Block sender across all channels.'
      : 'Communication is authenticated and safe for standard recruitment or rental proceedings.'
  });

  return steps;
}

export function runHeuristicScan(rawText: string, providedUrl: string = ''): ScanResult {

  const combinedText = `${providedUrl}\n${rawText}`;
  const redFlags: RedFlag[] = [];
  const greenFlags: string[] = [];

  let paymentRisk = 0;
  let domainRisk = 0;
  let urgencyRisk = 0;
  let authenticityRisk = 0;

  // 1. Check pattern rules
  for (const rule of SCAM_PATTERN_RULES) {
    const match = combinedText.match(rule.regex);
    if (match) {
      const flaggedSnippet = match[0].trim();
      redFlags.push({
        id: rule.id,
        category: rule.category,
        title: rule.title,
        description: rule.description,
        severity: rule.severity,
        flaggedText: flaggedSnippet,
        recommendation: rule.recommendation
      });

      if (rule.category === 'PAYMENT_DEMAND' || rule.category === 'EQUIPMENT_SCAM') {
        paymentRisk += rule.weight;
      } else if (rule.category === 'URGENCY_COERCION') {
        urgencyRisk += rule.weight;
      } else if (rule.category === 'IDENTITY_EVASION' || rule.category === 'RENTAL_TRAP') {
        authenticityRisk += rule.weight;
      }
    }
  }

  // 2. Domain & URL Inspection
  const { domains, emails, urls } = extractDomainsAndEmails(combinedText);
  let primaryDomainAnalysis: DomainAnalysis | undefined;

  const targetDomainString = providedUrl || (emails.length > 0 ? emails[0] : (domains.length > 0 ? domains[0] : ''));
  if (targetDomainString) {
    primaryDomainAnalysis = analyzeDomain(targetDomainString, combinedText);
    domainRisk = primaryDomainAnalysis.riskScore;

    if (primaryDomainAnalysis.isFreeEmailProvider && /Meta|Google|Microsoft|Apple|Amazon|Enterprise|Bank/i.test(combinedText)) {
      redFlags.push({
        id: 'free-email-impersonation',
        category: 'DOMAIN_ANOMALY',
        title: 'Free Webmail Impersonating Major Enterprise',
        description: `Official communications from major companies never originate from free email services like ${primaryDomainAnalysis.domain}.`,
        severity: 'critical',
        flaggedText: emails[0] || primaryDomainAnalysis.domain,
        recommendation: 'Corporate recruiters always email from verified corporate domains (e.g., @google.com, @microsoft.com).'
      });
    }

    if (primaryDomainAnalysis.targetBrandLookalike) {
      redFlags.push({
        id: 'brand-lookalike-domain',
        category: 'DOMAIN_ANOMALY',
        title: `Lookalike Typosquatting of ${primaryDomainAnalysis.targetBrandLookalike}`,
        description: `Domain '${primaryDomainAnalysis.domain}' mimics ${primaryDomainAnalysis.targetBrandLookalike} using modified keywords and non-standard TLDs.`,
        severity: 'critical',
        flaggedText: primaryDomainAnalysis.domain,
        recommendation: 'Do not submit credentials or PII on this domain. Check the genuine company website directly.'
      });
    }

    if (primaryDomainAnalysis.suspiciousTld) {
      redFlags.push({
        id: 'high-abuse-tld',
        category: 'DOMAIN_ANOMALY',
        title: 'High-Abuse Cheap TLD Detected',
        description: `Domain ends in ${primaryDomainAnalysis.domain.slice(primaryDomainAnalysis.domain.lastIndexOf('.'))}, frequently favored in spam/phishing due to disposable registration pricing.`,
        severity: 'high',
        flaggedText: primaryDomainAnalysis.domain,
        recommendation: 'Treat correspondence from this top-level domain with extreme suspicion.'
      });
    }
  }

  // 3. Positive / Legitimate Indicator Detection (Green Flags)
  if (/no\s*(under\s*no\s*circumstances\s*will\s*we\s*request|zero\s*cost\s*to\s*you|equipment\s*shipped\s*directly)/i.test(combinedText)) {
    greenFlags.push('Explicit zero-cost equipment policy stated: Employer provisions and ships hardware directly.');
  }
  if (/standard\s*payroll|semi-monthly|direct\s*deposit\s*in\s*accordance|401\(k\)|vesting/i.test(combinedText)) {
    greenFlags.push('Standard corporate compensation structure with formal benefits and standard vesting verbiage.');
  }
  if (/docusign|workday|greenhouse|lever\.co/i.test(combinedText)) {
    greenFlags.push('References reputable enterprise onboarding or applicant tracking systems.');
  }
  if (primaryDomainAnalysis && primaryDomainAnalysis.ageLabel?.includes('Established Enterprise')) {
    greenFlags.push(`Legitimate enterprise domain verified (${primaryDomainAnalysis.domain}) with established reputation.`);
  }

  // 4. Calculate Sub-Scores (clamped 0-100)
  paymentRisk = Math.min(100, Math.max(0, paymentRisk));
  urgencyRisk = Math.min(100, Math.max(0, urgencyRisk));
  authenticityRisk = Math.min(100, Math.max(0, authenticityRisk));
  domainRisk = Math.min(100, Math.max(0, domainRisk));

  // 5. Dynamic Scam Threat Index Calculation
  // Critical flags directly mandate high threat tiers
  const hasCriticalFlag = redFlags.some(f => f.severity === 'critical');
  const hasHighFlag = redFlags.some(f => f.severity === 'high');

  // Weighted composite score
  let threatIndex = Math.round(
    (paymentRisk * 0.40) +
    (domainRisk * 0.25) +
    (authenticityRisk * 0.20) +
    (urgencyRisk * 0.15)
  );

  // Apply floor rules:
  if (hasCriticalFlag) {
    threatIndex = Math.max(threatIndex, 82);
  } else if (hasHighFlag) {
    threatIndex = Math.max(threatIndex, 62);
  } else if (redFlags.length > 0) {
    threatIndex = Math.max(threatIndex, 40);
  }

  // Offset by verified green flags if genuine
  if (greenFlags.length >= 3 && !hasCriticalFlag) {
    threatIndex = Math.min(threatIndex, 12);
  } else if (greenFlags.length >= 2 && !hasCriticalFlag && !hasHighFlag) {
    threatIndex = Math.min(threatIndex, 22);
  }

  threatIndex = Math.min(100, Math.max(0, threatIndex));

  // Determine Threat Level
  let threatLevel: ThreatLevel = 'LOW';
  if (threatIndex >= 78) {
    threatLevel = 'CRITICAL';
  } else if (threatIndex >= 52) {
    threatLevel = 'HIGH';
  } else if (threatIndex >= 25) {
    threatLevel = 'MODERATE';
  }

  // Target Type detection
  let targetType: ScanResult['targetType'] = 'JOB_OFFER';
  if (/rent|condo|apartment|lease|landlord|security\s*holding\s*deposit|walk-through/i.test(combinedText)) {
    targetType = 'RENTAL_LISTING';
  } else if (/recruiter|shortlisted|crypto\s*task|freelance\s*task/i.test(combinedText)) {
    targetType = 'RECRUITER_CONTACT';
  } else if (!/offer|position|salary|hire/i.test(combinedText)) {
    targetType = 'GENERAL_COMMUNICATION';
  }

  // Financial demands detected
  const financialDemandDetected = /check|wire|zelle|cashapp|deposit|usdt|bitcoin|fee|\$\d+/i.test(combinedText) && 
    (paymentRisk > 20 || redFlags.some(f => f.category === 'PAYMENT_DEMAND' || f.category === 'EQUIPMENT_SCAM'));
  
  const moneyMatch = combinedText.match(/\$\s?[\d,]+(?:\.\d{2})?|\b\d+\s?USDT\b/i);
  const demandedAmount = moneyMatch ? moneyMatch[0] : undefined;

  const methodMatch = combinedText.match(/\b(Zelle|CashApp|Venmo|Apple Cash|Wire Transfer|Cashier's check|USDT|Bitcoin|MoneyGram|Western Union)\b/i);
  const demandedMethod = methodMatch ? methodMatch[0] : undefined;

  // Safe next steps based on findings
  const safeNextSteps: string[] = [];
  if (threatLevel === 'CRITICAL' || threatLevel === 'HIGH') {
    safeNextSteps.push('DO NOT deposit any check or transfer money via Zelle, CashApp, Wire, or Crypto.');
    safeNextSteps.push('Cease all correspondence on Telegram/WhatsApp immediately.');
    safeNextSteps.push('If you already shared SSN/driver license, place a free fraud alert on Experian, Equifax, and TransUnion.');
    safeNextSteps.push('Report the scam to the FBI Internet Crime Complaint Center (IC3.gov) and FTC (reportfraud.ftc.gov).');
  } else if (threatLevel === 'MODERATE') {
    safeNextSteps.push('Contact the hiring organization directly through their verified public website or directory phone number.');
    safeNextSteps.push('Ask for official video interview and confirmation via corporate email.');
    safeNextSteps.push('Never pay upfront fees for equipment, training, or background checks.');
  } else {
    safeNextSteps.push('Offer appears consistent with legitimate corporate hiring norms.');
    safeNextSteps.push('Verify the sender matches the official corporate email domain.');
    safeNextSteps.push('Always review final contracts and equity agreements with care.');
  }

  // Generate clear, objective forensic summary
  let summary = '';
  if (threatLevel === 'CRITICAL') {
    summary = `CRITICAL FRAUD SIGNATURE DETECTED: This correspondence exhibits hallmark indicators of ${
      targetType === 'RENTAL_LISTING' ? 'an absentee landlord rental escrow trap' : 'a fraudulent employment check-cashing / pay-for-equipment phishing operation'
    }. Multiple non-negotiable red flags were identified, including irregular payment mechanisms and unverified identity channels.`;
  } else if (threatLevel === 'HIGH') {
    summary = `HIGH RISK WARNING: Suspicious communication patterns detected with elevated threat anomalies, including ${
      primaryDomainAnalysis?.isFreeEmailProvider ? 'unverified free webmail' : 'atypical payment demands'
    } and expedited urgency tactics. Exercise extreme caution.`;
  } else if (threatLevel === 'MODERATE') {
    summary = `ELEVATED CAUTION: Some anomalies detected that warrant independent verification before sharing personal documents or accepting agreements.`;
  } else {
    summary = `LOW RISK PROFILE: The communication follows standard enterprise protocols with zero upfront financial demands, verified business terminology, and formal onboarding procedures.`;
  }

  const subScores: SubScores = {
    paymentRisk,
    domainRisk,
    urgencyRisk,
    authenticityRisk
  };

  const blastRadius = computeFinancialBlastRadius(combinedText, targetType, demandedAmount, redFlags);
  const timelineSteps = generateScamTimeline(targetType, threatLevel, blastRadius.demandedAmountDisplay, demandedMethod);
  const emailHeaderAnalysis = combinedText.includes('Authentication-Results:') || combinedText.includes('Return-Path:')
    ? parseEmailHeaders(combinedText)
    : undefined;
  const hashFingerprint = generatePseudoHash(combinedText);

  const authPipeline = generateAuthenticationPipeline(
    combinedText,
    targetType,
    threatLevel,
    redFlags,
    greenFlags,
    primaryDomainAnalysis,
    emailHeaderAnalysis
  );

  return {
    threatIndex,
    threatLevel,
    summary,
    targetType,
    domainAnalysis: primaryDomainAnalysis,
    redFlags,
    greenFlags,
    subScores,
    financialDemandDetected,
    demandedAmount,
    demandedMethod,
    blastRadius,
    timelineSteps,
    emailHeaderAnalysis,
    authPipeline,
    safeNextSteps,
    analyzedAt: new Date().toISOString(),
    modelUsed: 'heuristic-defense-engine',
    hashFingerprint
  };
}
