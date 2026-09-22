import React from 'react';
import { RedFlag } from '../types';
import { AlertOctagon, AlertTriangle, Info, ArrowRight, DollarSign, Laptop, Home, Globe, Clock, UserX } from 'lucide-react';

interface RedFlagItemProps {
  flag: RedFlag;
}

export const RedFlagItem: React.FC<RedFlagItemProps> = ({ flag }) => {
  const getCategoryIcon = (category: RedFlag['category']) => {
    switch (category) {
      case 'EQUIPMENT_SCAM':
        return Laptop;
      case 'PAYMENT_DEMAND':
        return DollarSign;
      case 'RENTAL_TRAP':
        return Home;
      case 'DOMAIN_ANOMALY':
        return Globe;
      case 'URGENCY_COERCION':
        return Clock;
      case 'IDENTITY_EVASION':
        return UserX;
      default:
        return AlertTriangle;
    }
  };

  const getCategoryLabel = (category: RedFlag['category']) => {
    switch (category) {
      case 'EQUIPMENT_SCAM':
        return 'Equipment Purchase Scheme';
      case 'PAYMENT_DEMAND':
        return 'Irreversible Payment Demand';
      case 'RENTAL_TRAP':
        return 'Phantom Rental Escrow Trap';
      case 'DOMAIN_ANOMALY':
        return 'Domain & Infrastructure Anomaly';
      case 'URGENCY_COERCION':
        return 'Psychological Pressure / Deadline';
      case 'IDENTITY_EVASION':
        return 'Identity Evasion & Waived Vetting';
      default:
        return 'Red Flag Indicator';
    }
  };

  const Icon = getCategoryIcon(flag.category);

  let severityBadge = 'bg-yellow-950/60 text-yellow-300 border-yellow-700/50';
  let cardBorder = 'border-slate-800 hover:border-slate-700';

  if (flag.severity === 'critical') {
    severityBadge = 'bg-rose-950/80 text-rose-300 border-rose-700/70 animate-pulse';
    cardBorder = 'border-rose-900/40 bg-slate-900/90 hover:border-rose-700/60';
  } else if (flag.severity === 'high') {
    severityBadge = 'bg-amber-950/70 text-amber-300 border-amber-700/60';
    cardBorder = 'border-amber-900/30 bg-slate-900/80 hover:border-amber-700/50';
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${cardBorder}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            flag.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 block">
              {getCategoryLabel(flag.category)}
            </span>
            <h4 className="text-sm font-bold text-white font-mono">
              {flag.title}
            </h4>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold border ${severityBadge}`}>
          {flag.severity}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mt-1">
        {flag.description}
      </p>

      {/* Flagged snippet quote */}
      {flag.flaggedText && (
        <div className="mt-2.5 p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 italic">
          <span className="text-slate-500 not-italic font-sans text-[10px] uppercase tracking-wider block mb-0.5">
            Triggered by text match:
          </span>
          &ldquo;{flag.flaggedText}&rdquo;
        </div>
      )}

      {/* Actionable Recommendation */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-start gap-2">
        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-xs text-cyan-200/90 font-mono">
          <span className="font-semibold text-cyan-400">Defense Action:</span> {flag.recommendation}
        </p>
      </div>
    </div>
  );
};
