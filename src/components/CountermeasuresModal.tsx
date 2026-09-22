import React, { useState } from 'react';
import { ScanResult } from '../types';
import { ShieldCheck, Copy, Check, ExternalLink, Mail, AlertTriangle, X, CheckSquare, Square } from 'lucide-react';

interface CountermeasuresModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScanResult;
}

export const CountermeasuresModal: React.FC<CountermeasuresModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const isJob = result.targetType !== 'RENTAL_LISTING';

  const verificationScript = isJob
    ? `Dear Sender,

Thank you for the correspondence regarding the position. 

To comply with my personal security and banking guidelines, please note the following required verification steps:
1. Equipment Fulfillment: Consistent with standard enterprise IT logistics, I do not process third-party cashier's checks, vendor reimbursements, or personal fund transfers. Please arrange for your corporate IT department to ship all required hardware directly to my address.
2. Independent Verification: Please provide the direct corporate telephone extension and work email address of the hiring manager registered on your verified company domain so we may conduct a standard introductory video call.
3. Formal Agreement: Please dispatch the employment contract and tax documentation through your accredited corporate HRIS portal (such as Workday, Greenhouse, or DocuSign) originating from your official corporate domain.

I look forward to continuing the onboarding process once these standard verification procedures are completed.

Sincerely,
[Your Name]`
    : `Dear Landlord / Property Agent,

Thank you for the information regarding the property listing.

In adherence to standard leasing and tenant protection guidelines:
1. In-Person Inspection: I require an in-person or authorized local agent walk-through of the physical property interior before sending any security deposit, holding fee, or signing lease documents.
2. Certified Escrow: I do not transfer funds via peer-to-peer applications (Zelle, CashApp, Venmo, Wire, or Crypto). Any security deposit must be held in a state-regulated escrow trust account with a formal escrow receipt.
3. Ownership Verification: Please provide proof of municipal property tax registration or current utility statement matching the deed holder's legal identification.

Please let me know when your local representative is available to unlock the unit for inspection.

Sincerely,
[Your Name]`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(verificationScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const reportingAgencies = [
    {
      name: 'FBI Internet Crime Complaint Center (IC3)',
      url: 'https://www.ic3.gov/',
      desc: 'Official US agency for reporting online employment scams, wire fraud, and cyber phishing.'
    },
    {
      name: 'Federal Trade Commission (FTC)',
      url: 'https://reportfraud.ftc.gov/',
      desc: 'Government repository for deceptive business practices and job offer scams.'
    },
    {
      name: 'US Postal Inspection Service (USPIS)',
      url: 'https://www.uspis.gov/report',
      desc: 'Handles counterfeit cashier checks and fake appointment letters sent via postal courier.'
    },
    {
      name: 'IdentityTheft.gov',
      url: 'https://www.identitytheft.gov/',
      desc: 'Immediate recovery plan if you already provided SSN, driver license, or bank details.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Incident Response &amp; Countermeasures
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Actionable Defense Protocol for Threat Index {result.threatIndex}%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Section 1: Immediate Containment Checklist */}
          <div>
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Immediate Containment Checklist
            </h4>

            <div className="space-y-2">
              {result.safeNextSteps.map((step, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <button className="mt-0.5 text-cyan-400 shrink-0">
                      {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                    </button>
                    <span className={`text-xs font-mono leading-relaxed ${
                      isChecked ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Safe Verification Response Script */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                Defensive Counter-Response Template
              </h4>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold transition-colors"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedScript ? 'Copied to Clipboard' : 'Copy Template'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              If you wish to test their authenticity without risking confrontation, send this standardized verification notice. Legitimate employers will gladly comply; scammers will immediately cease contact.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {verificationScript}
            </div>
          </div>

          {/* Section 3: Official Reporting Portals */}
          <div>
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              Official Fraud &amp; Phishing Reporting Portals
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportingAgencies.map((agency, i) => (
                <a
                  key={i}
                  href={agency.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-950 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200 group-hover:text-cyan-300 font-mono mb-1">
                      <span>{agency.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {agency.desc}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-semibold transition-colors"
          >
            Close Incident Center
          </button>
        </div>
      </div>
    </div>
  );
};
