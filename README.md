# 🛡️ Sentinel.AI — Forensic Offer Letter & Anti-Quishing Defense Engine

> Enterprise-grade cyber forensic intelligence platform combining **Google Gemini AI** with an automated **7-Gate Authentication Pipeline** and an **Optical QR (Quishing) Scanner** to protect job seekers and renters from advance-fee scams, equipment check fraud, and malicious recruitment vectors.

🔗 **Live Demo Application:** [Launch Sentinel.AI](https://ais-pre-li6hbf2ahifp3vp5rvkl6x-657675541098.asia-southeast1.run.app)

---

## 📌 Problem Statement

Every year, millions of job seekers, students, and apartment renters fall victim to sophisticated social engineering schemes:
- **Fake Remote Job Offers:** Fraudsters issue forged employment contracts, mailing counterfeit cashier's checks ($3,000–$5,000) while ordering candidates to wire personal funds to "certified equipment vendors."
- **Rental Listing Traps:** Malicious actors list stolen property photos, demanding upfront holding deposits or wire transfers before disappearing.
- **Quishing (QR Code Phishing):** Attackers embed malicious links inside QR codes on PDF offer letters to bypass conventional text-based enterprise email security filters.

**Sentinel.AI** bridges this defense gap by providing real-time, multi-layered forensic inspection of text, recruiter URLs, and optical QR codes.

---

## ⚡ Key Features

### 1. 🧠 Hybrid Google Gemini AI Reasoning
- Connected via a secure server-side **Google Gemini API** (`gemini-3.1-flash-lite` / `gemini-3.8-flash`).
- Delivers real-time semantic analysis to identify subtle psychological manipulation, artificial urgency, and advance-fee structures.
- Generates a customized **Forensic Intelligence Briefing** with immediate victim countermeasures.

### 2. 🚦 7-Step Forensic Authentication Pipeline
Evaluates every submitted document across a deterministic cybersecurity and compliance battery:
- **Gate 1: Header & Envelope Authentication** — Validates RFC 7489 alignment and SPF/DKIM envelope integrity.
- **Gate 2: Domain Identity & WHOIS Authority** — Detects freshly registered domains (<30 days), typosquatting, and high-abuse TLDs (`.top`, `.xyz`).
- **Gate 3: Candidate Screening Protocol** — Assesses whether legitimate interview stages occurred or if an unsolicited instant offer was delivered.
- **Gate 4: Financial & Transaction Authorization** — Identifies violations of **Federal Reserve Regulation CC (12 CFR Part 229)** and cashier check laundering schemes.
- **Gate 5: Legal Covenants & PII Collection** — Flags premature requests for sensitive identity credentials (SSN, passport, banking logins).
- **Gate 6: Enterprise Directory Whitelist** — Cross-references sender authenticity against verified corporate talent registries.
- **Gate 7: Consolidated Verdict** — Synthesizes forensic data into clear verdicts: `AUTHENTIC`, `SUSPICIOUS`, or `SPAM CONFIRMED (MALICIOUS)`.

### 3. 📷 Optical QR ("Quishing") Scanner
- **Live Webcam Reticle:** Real-time in-browser video camera scanning with target reticle and audio lock feedback.
- **Drag-and-Drop Image Ingestion:** Decodes QR codes directly from uploaded screenshots and documents.
- **Safe Sandboxed Inspection:** Safely resolves redirects and scans embedded URLs without exposing the user's personal device to malicious payloads.
- **Interactive Simulator:** Built-in test vectors for instant live demonstration.

### 4. 💰 Financial Exposure & Threat Timeline
- Dynamically estimates the victim's potential financial exposure (e.g., fraudulent check amount, non-refundable deposit, bounced check fees).
- Illustrates a 5-stage timeline of how the attack unfolds to educate the user.

### 5. 📜 Evidentiary Forensic Audit Certificate
- Generates a court-ready, printable forensic certificate containing cryptographic `SHA-256` document fingerprints.
- Formatted specifically for submission to bank fraud departments, law enforcement, or the IC3 (Internet Crime Complaint Center).

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, jsQR
- **Backend:** Node.js, Express.js (REST API)
- **AI & Intelligence Engine:** Google Gemini API (`@google/genai`)
- **Security Protocols:** RFC 7489 (DMARC/DKIM/SPF), Federal Reserve Regulation CC (12 CFR Part 229), WHOIS domain telemetry

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/sentinel-ai.git
   cd sentinel-ai
