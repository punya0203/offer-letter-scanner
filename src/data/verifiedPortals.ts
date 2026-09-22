import { VerifiedBrandDirectory } from '../types';

export const VERIFIED_DIRECTORIES: VerifiedBrandDirectory[] = [
  {
    brandName: 'Google / Alphabet',
    officialCareersUrl: 'https://careers.google.com',
    verifiedDomains: ['google.com', 'alphabet.com', 'withgoogle.com'],
    knownScamPhrases: ['workforce-google', 'google-onboarding-desk', 'careers-google-hr'],
    notes: 'Google conducts video interviews via Google Meet and provisions/ships all hardware at 0 cost. Never uses Telegram or cashier checks.'
  },
  {
    brandName: 'Meta (Facebook / Instagram)',
    officialCareersUrl: 'https://metacareers.com',
    verifiedDomains: ['metacareers.com', 'meta.com'],
    knownScamPhrases: ['workforce-meta', 'meta-employment-portal', 'meta-hr-review'],
    notes: 'Meta never issues checks for candidates to purchase home office hardware from third-party certified suppliers.'
  },
  {
    brandName: 'Microsoft',
    officialCareersUrl: 'https://careers.microsoft.com',
    verifiedDomains: ['careers.microsoft.com', 'microsoft.com'],
    knownScamPhrases: ['careers-microsoft-portal', 'microsoft-recruiting-desk'],
    notes: 'Official outreach originates strictly from @microsoft.com domains. All onboarding agreements are signed via official enterprise tools.'
  },
  {
    brandName: 'Apple',
    officialCareersUrl: 'https://jobs.apple.com',
    verifiedDomains: ['jobs.apple.com', 'apple.com'],
    knownScamPhrases: ['apple-workstation-vendor', 'apple-remote-care'],
    notes: 'Apple ships pre-configured hardware via secure enterprise logistics. Under no policy does Apple require candidates to buy gear from designated vendors.'
  },
  {
    brandName: 'Amazon',
    officialCareersUrl: 'https://amazon.jobs',
    verifiedDomains: ['amazon.jobs', 'amazon.com'],
    knownScamPhrases: ['amazon-remote-jobs-direct', 'amazon-staffing-agency'],
    notes: 'Job offers and background checks are processed exclusively through amazon.jobs candidate dashboard.'
  },
  {
    brandName: 'Zillow Group (Rentals)',
    officialCareersUrl: 'https://zillow.com/rent',
    verifiedDomains: ['zillow.com', 'hotpads.com', 'trulia.com'],
    knownScamPhrases: ['zillow-secure-escrow', 'zillow-rental-transit', 'global-escrow-keys'],
    notes: 'Zillow never holds security deposits in third-party escrow via Zelle, CashApp, or wire transfer. Legitimate landlords tour units in person.'
  }
];
