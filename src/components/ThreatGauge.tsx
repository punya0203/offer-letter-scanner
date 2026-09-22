import React from 'react';
import { ThreatLevel } from '../types';

interface ThreatGaugeProps {
  score: number; // 0 - 100
  level: ThreatLevel;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({ score, level }) => {
  // Clamped angle calculation for half-circle arc or full-circle gauge
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // We'll show a 240-degree circular meter
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-emerald-500 stroke-emerald-500';
  let bgGlow = 'from-emerald-500/10 to-transparent';
  let badgeBorder = 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40';
  let label = 'VERIFIED / LOW RISK';
  let description = 'Standard corporate verbiage, zero upfront financial demand, verified parameters.';

  if (level === 'CRITICAL') {
    colorClass = 'text-rose-500 stroke-rose-500';
    bgGlow = 'from-rose-500/20 to-transparent';
    badgeBorder = 'border-rose-500/40 text-rose-300 bg-rose-950/50 animate-pulse';
    label = 'CRITICAL SCAM THREAT';
    description = 'Active criminal modus operandi detected. Immediate threat of financial loss or identity theft.';
  } else if (level === 'HIGH') {
    colorClass = 'text-amber-500 stroke-amber-500';
    bgGlow = 'from-amber-500/15 to-transparent';
    badgeBorder = 'border-amber-500/40 text-amber-300 bg-amber-950/50';
    label = 'HIGH SUSPICION / DANGEROUS';
    description = 'Multiple high-risk indicators detected including irregular channels or payment anomalies.';
  } else if (level === 'MODERATE') {
    colorClass = 'text-yellow-400 stroke-yellow-400';
    bgGlow = 'from-yellow-400/10 to-transparent';
    badgeBorder = 'border-yellow-400/30 text-yellow-300 bg-yellow-950/40';
    label = 'ELEVATED CAUTION';
    description = 'Unverified elements or non-standard contact practices observed. Verification required.';
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden bg-radial ${bgGlow}`}>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative flex items-center justify-center w-52 h-52">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Meter Fill */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-widest font-mono text-slate-400 font-semibold mb-0.5">
            Threat Index
          </span>
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-extrabold tracking-tight font-mono text-white">
              {score}
            </span>
            <span className="text-xl font-bold font-mono text-slate-400 ml-0.5">%</span>
          </div>
          <span className={`mt-2 px-2.5 py-0.5 text-[10px] uppercase font-mono tracking-wider font-bold rounded-full border ${badgeBorder}`}>
            {level}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center max-w-xs">
        <h4 className="text-sm font-bold tracking-tight text-slate-100 font-mono">
          {label}
        </h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
