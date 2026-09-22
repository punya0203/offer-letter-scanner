import React from 'react';
import { SubScores } from '../types';
import { CreditCard, Globe, Zap, FileCheck } from 'lucide-react';

interface SubScoreBarsProps {
  subScores: SubScores;
}

export const SubScoreBars: React.FC<SubScoreBarsProps> = ({ subScores }) => {
  const bars = [
    {
      id: 'payment',
      name: 'Payment & Deposit Demands',
      score: subScores.paymentRisk,
      icon: CreditCard,
      description: 'Checks for check-reimbursement, vendor purchase, Zelle/wire or deposit requests.',
      warningThreshold: 20
    },
    {
      id: 'domain',
      name: 'Domain & Infrastructure Anomaly',
      score: subScores.domainRisk,
      icon: Globe,
      description: 'Audits newly registered domains, typosquatting, free webmail, and disposable TLDs.',
      warningThreshold: 25
    },
    {
      id: 'urgency',
      name: 'Psychological Urgency & Pressure',
      score: subScores.urgencyRisk,
      icon: Zap,
      description: 'Detects artificial deadlines, cancellation threats, and pressure tactics.',
      warningThreshold: 20
    },
    {
      id: 'authenticity',
      name: 'Identity & Evasion Signals',
      score: subScores.authenticityRisk,
      icon: FileCheck,
      description: 'Identifies waived interviews, anonymous Telegram chats, and absentee claims.',
      warningThreshold: 20
    }
  ];

  const getBarColor = (score: number) => {
    if (score >= 60) return 'bg-rose-500';
    if (score >= 30) return 'bg-amber-500';
    if (score > 10) return 'bg-yellow-400';
    return 'bg-emerald-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 60) return 'text-rose-400';
    if (score >= 30) return 'text-amber-400';
    if (score > 10) return 'text-yellow-300';
    return 'text-emerald-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {bars.map(item => {
        const Icon = item.icon;
        const barColor = getBarColor(item.score);
        const textColor = getTextColor(item.score);

        return (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 font-mono">
                    {item.name}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${textColor}`}>
                  {item.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mb-2.5">
                {item.description}
              </p>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${Math.max(5, item.score)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
