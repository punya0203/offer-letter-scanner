import { PresetSample } from '../types';

export const SAMPLE_CASES: PresetSample[] = [
  {
    id: 'equipment-check-scam',
    title: 'Fake Remote Equipment Check',
    subtitle: 'Classic $4,500 Cashier Check & Zelle Reimbursement Trap',
    type: 'job',
    categoryBadge: 'Job Offer Phishing',
    expectedRisk: 'CRITICAL',
    url: 'http://workforce-meta-careers.top/onboard-packet',
    text: `From: human-resources@workforce-meta-careers.top
Subject: Official Employment Offer Letter - Senior Data Analyst Remote

Dear Candidate,

Congratulations! Following your expedited application review on Telegram, the hiring committee at Meta Workforce Solutions is delighted to extend you an offer for the full-time Remote Senior Data Analyst position.

COMPENSATION & WORKING CONDITIONS:
- Hourly Base Pay: $75.00/hr ($156,000 annualized), paid weekly via direct deposit.
- Working Hours: Flexible, 40 hours per week.
- Start Date: Immediate upon workstation delivery.

MANDATORY WORKSTATION SETUP & EQUIPMENT PROCEDURE:
To maintain company cybersecurity standards, you are strictly required to purchase your home-office equipment from our Certified Enterprise Vendor (Order ID #US-99214):
1. Apple MacBook Pro 16" M3 Max 64GB
2. Dual 4K Dell UltraSharp Monitors
3. Encrypted biometric VPN router & specialized company tracking software.

FINANCIAL REIMBURSEMENT POLICY:
Our accounts department will courier a certified cashier's check in the amount of $4,850.00 directly to your home address. You must deposit this check into your personal bank account. Once deposited, you are required to immediately wire or Zelle the sum of $4,300.00 to our designated vendor logistics agent to expedite freight shipment. You may retain the remaining $550 as your upfront sign-on stipend.

URGENCY REQUIREMENT:
You must sign, scan, and return this letter along with front/back copies of your driver's license and Social Security Number within 24 hours to secure your placement, or this offer will be permanently revoked.

Sincerely,
Dr. Robert Vance, Senior VP of Talent Acquisition
Meta Workforce Global Solutions LLC
Direct: +1 (702) 555-0193 | Telegram: @HR_RobertVance_Official`
  },
  {
    id: 'rental-deposit-trap',
    title: 'Rental Deposit & Wire Trap',
    subtitle: 'Absentee Landlord & Phantom Lease Agreement',
    type: 'rental',
    categoryBadge: 'Rental Property Scam',
    expectedRisk: 'CRITICAL',
    url: 'https://zillow-rental-secure-escrow.cf/listing/apt-4b-austin',
    text: `Subject: Re: Interested in 2-Bedroom Luxury Condo on 4th Street ($1,250/mo)

Hello there,

Thank you for your interest in my 2-bedroom, 2-bath condo at 410 E 4th St, Austin. The rent is $1,250 per month including all utilities (water, electricity, high-speed fiber internet, and reserved parking space). 

I am currently out of the country in Madrid, Spain on an emergency medical research mission with the World Health Organization. Due to the high number of inquiries and people who booked appointments and never showed up, I cannot fly down or send my local attorney to unlock the property for mere walk-throughs without serious commitment.

RENTAL TERMS & KEY DELIVERY GUARANTEE:
To reserve the apartment and schedule the courier to deliver the electronic keycard, gate fob, and original lease documents via FedEx overnight, you must submit:
- Refundable Security Holding Deposit: $1,200.00
- First Month's Rent: $1,250.00 (Total: $2,450.00)

PAYMENT INSTRUCTIONS:
Kindly send the payment via Zelle, Apple Cash, or CashApp to my overseas escrow coordinator's representative (Tag: $GlobalEscrowTransit). As soon as the wire transfer confirmation slip is texted to me, the keys will be dispatched and you will have 48 hours after inspection to decide. If you do not love the condo, 100% of your deposit will be refunded on the spot in cash.

Please fill out the attached lease agreement with your passport number and proof of income right away, as three other renters are currently in line.

Warm regards,
Rev. Harrison Sterling
Property Owner & WHO Field Coordinator`
  },
  {
    id: 'crypto-recruiter-fast-hire',
    title: 'Telegram Crypto Fast-Hire',
    subtitle: 'No Interview, High Pay & Security Deposit in USDT',
    type: 'job',
    categoryBadge: 'Crypto Task Scam',
    expectedRisk: 'HIGH',
    url: 'https://bit-career-onboarding.xyz/login',
    text: `From: recruiter_agent_77@gmail.com
Subject: Quick Remote Freelance Task Specialist Position - $90/hr

Hello!

Your resume was shortlisted from our online database for an immediate Remote Quality Optimization Specialist opening with Apex Blockchain Intelligence.

POSITION DETAILS:
- Daily Payout: $350 - $700 depending on daily tasks completed.
- Requirements: No prior technical experience required. Can be done via smartphone in 1-2 hours daily.
- Interview: Waived due to high candidate ratings. You are automatically approved.

TRAINING & SECURITY PROTOCOL:
Before you can be assigned customer transaction optimization queues, you must initialize your smart-contract work terminal on our encrypted cloud portal. 

A refundable liquidity security deposit of 200 USDT (TRC-20 network) must be deposited into the dedicated employee verification smart address:
TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

This deposit will be returned back to your personal wallet along with your first daily compensation payout of $450 at 6:00 PM EST today.

Failure to activate your account within 6 hours will result in your application being reassigned to the next waitlisted applicant.

Apex Human Resource Department`
  },
  {
    id: 'typosquatted-domain',
    title: 'Typosquatted Brand Phishing',
    subtitle: 'Lookalike Domain With Form Demanding SSN & Banking',
    type: 'domain',
    categoryBadge: 'Domain Spoofing',
    expectedRisk: 'HIGH',
    url: 'https://careers-microsoft-verification-portal.net/login/verify-ssn',
    text: `Domain URL: https://careers-microsoft-verification-portal.net/login/verify-ssn

Sender Email: talent-review@careers-microsoft-verification-portal.net

Text excerpt:
"Dear Applicant,
Your recent application for Senior Product Manager at Microsoft has passed Stage 1.
Please navigate to our verified internal candidate identity portal at https://careers-microsoft-verification-portal.net/login/verify-ssn to enter your full Social Security Number, date of birth, previous home address, and direct deposit voided check for mandatory Department of Homeland Security background verification.
Failure to submit within 12 hours will forfeit your candidacy."`
  },
  {
    id: 'legitimate-enterprise-offer',
    title: 'Legitimate Tech Offer (Benchmark)',
    subtitle: 'Standard Enterprise Package - 0 Upfront Costs & Official Domain',
    type: 'job',
    categoryBadge: 'Authentic Offer',
    expectedRisk: 'LOW',
    url: 'https://careers.google.com/jobs/results',
    text: `From: staffing-operations@google.com
Subject: Formal Offer of Employment - Software Engineer III

Dear Alex,

On behalf of Google LLC, I am thrilled to formally extend this offer of employment for the position of Software Engineer III within our Cloud Infrastructure team, reporting to Sarah Jenkins, Director of Engineering.

OFFER SUMMARY:
- Starting Annual Salary: $165,000.00 USD, paid semi-monthly in accordance with standard payroll practices.
- Equity Grant: Initial Restricted Stock Unit (RSU) grant valued at $120,000.00 USD, vesting over 4 years.
- Annual Performance Bonus Target: 15% of annual base salary.
- Comprehensive Benefits: Medical, Dental, Vision, 401(k) with 50% company match up to IRS limits, and 20 days paid vacation.

COMPANY EQUIPMENT:
All required hardware (corporate laptop, monitors, and peripherals) will be provisioned directly by Google IT Logistics and shipped to your primary residence at zero cost to you. You will receive tracking details 5 business days prior to your start date. Under no circumstances will Google request you to purchase company equipment or wire funds to any vendor.

BACKGROUND CHECK:
This offer is contingent upon the successful completion of a standard background investigation conducted securely through our authorized partner Sterling Backcheck. Google will directly cover all verification fees.

Please review the attached formal agreement and sign via our official DocuSign portal by Friday, October 24, 2026.

Sincerely,
Google People Operations Team
Google LLC | 1600 Amphitheatre Parkway, Mountain View, CA`
  }
];
