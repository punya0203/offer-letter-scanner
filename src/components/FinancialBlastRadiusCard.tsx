import React from 'react';
import { FinancialBlastRadius } from '../types';
import { DollarSign, AlertOctagon, TrendingDown, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface FinancialBlastRadiusCardProps {
  blastRadius: FinancialBlastRadius;
  threatLevel: string;
}

export const FinancialBlastRadiusCard: React.FC<FinancialBlastRadiusCardProps> = ({
  blastRadius,
  threatLevel
}) => {
  const isSafe = threatLevel === 'LOW';

  let tierColor = 'bg-rose-950 text-rose-300 border-rose-800';
  if (blastRadius.exposureTier === 'SEVERE') tierColor = 'bg-amber-950 text-amber-300 border-amber-800';
  if (blastRadius.exposureTier === 'MODERATE') tierColor = 'bg-yellow-950 text-yellow-300 border-yellow-800';
  if (isSafe) tierColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isSafe
        ? 'bg-slate-900/80 border-slate-800'
        : 'bg-slate-900/90 border-rose-900/50 shadow-xl shadow-rose-950/20'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${
            isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono">
                Financial Blast Radius &amp; Exposure Calculator
              </h3>
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${tierColor}`}>
                {isSafe ? 'ZERO EXPOSURE' : `${blastRadius.exposureTier} FINANCIAL IMPACT`}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Calculated real-world monetary damage if victim proceeds with requested transactions.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
            Total Exposure Risk
          </span>
          <span className={`text-2xl font-extrabold font-mono ${
            isSafe ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isSafe ? '$0.00 USD' : `$${blastRadius.totalExposure.toLocaleString()} USD`}
          </span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Direct Theft */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1">
            Direct Capital Extortion
          </span>
          <div className="text-lg font-bold font-mono text-white">
            {isSafe ? '$0.00' : blastRadius.demandedAmountDisplay}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isSafe ? 'No payment demanded' : 'Wire transfer, Zelle or cashier check vendor reimbursement.'}
          </span>
        </div>

        {/* Metric 2: Bank Fees */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1">
            Bounced Check Penalties
          </span>
          <div className="text-lg font-bold font-mono text-slate-200">
            {isSafe ? '$0.00' : `$${blastRadius.bankBouncedCheckFees}.00`}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isSafe ? 'Verified payroll' : 'Bank returned-deposit fee + negative balance overdraft.'}
          </span>
        </div>

        {/* Metric 3: Identity Remediation */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1">
            PII &amp; Credit Restoration
          </span>
          <div className="text-lg font-bold font-mono text-slate-200">
            {isSafe ? '$0.00' : `$${blastRadius.identityRemediationCosts}.00`}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isSafe ? 'Secure HRIS' : 'Estimated 1-year credit freeze & identity restoration services.'}
          </span>
        </div>
      </div>

      {!isSafe && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between text-xs font-mono text-rose-200">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Savings by stopping now:</strong> Halting communication saves you <strong>${blastRadius.totalExposure.toLocaleString()} USD</strong> and protects your personal bank account from being frozen by fraud investigators.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
