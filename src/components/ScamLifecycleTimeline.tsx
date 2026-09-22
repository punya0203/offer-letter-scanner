import React from 'react';
import { ScamTimelineStep } from '../types';
import { Clock, ShieldAlert, ArrowRight, AlertTriangle, Landmark, CheckCircle2 } from 'lucide-react';

interface ScamLifecycleTimelineProps {
  steps: ScamTimelineStep[];
  threatLevel: string;
}

export const ScamLifecycleTimeline: React.FC<ScamLifecycleTimelineProps> = ({ steps, threatLevel }) => {
  const isSafe = threatLevel === 'LOW';

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${
            isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              Scam Execution Lifecycle Simulator
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                isSafe
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border-rose-800'
              }`}>
                {isSafe ? 'Standard Hiring Sequence' : 'The 7-Day Trap Timeline'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Visualizing how cybercriminals exploit the check-clearing time lag and psychological pressure.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
          let borderHighlight = 'border-slate-800';

          if (step.riskLevel === 'critical') {
            badgeColor = 'bg-rose-950 text-rose-300 border-rose-800';
            borderHighlight = 'border-rose-900/60 bg-rose-950/20';
          } else if (step.riskLevel === 'danger') {
            badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
            borderHighlight = 'border-amber-900/50 bg-amber-950/15';
          } else if (step.riskLevel === 'warning') {
            badgeColor = 'bg-yellow-950 text-yellow-300 border-yellow-800';
            borderHighlight = 'border-yellow-900/40 bg-yellow-950/10';
          } else {
            badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
            borderHighlight = 'border-emerald-900/40 bg-emerald-950/10';
          }

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${borderHighlight}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    Step 0{step.stepNumber}
                  </span>
                  <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-full border ${badgeColor}`}>
                    {step.dayLabel}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white font-mono mb-2">
                  {step.stageName}
                </h4>

                {/* What Victim Sees */}
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 mb-2">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 block mb-0.5">
                    What You Perceive:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {step.victimPerception}
                  </p>
                </div>

                {/* Reality Underground */}
                <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800/80">
                  <span className={`text-[9px] uppercase tracking-wider font-mono font-bold block mb-0.5 ${
                    step.riskLevel === 'safe' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {step.riskLevel === 'safe' ? 'System Verification:' : 'Underground Reality:'}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {step.undergroundReality}
                  </p>
                </div>
              </div>

              {step.bankingLawNote && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-[10px] text-amber-300/90 font-mono">
                  <Landmark className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>{step.bankingLawNote}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSafe && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Federal Reserve Rule:</strong> <em>Expedited Funds Availability Act (Regulation CC)</em> requires banks to credit deposited checks within 48 hours, but verifying counterfeit validity takes up to 10 days. <strong>Depositors are 100% legally liable for counterfeit check debt.</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
