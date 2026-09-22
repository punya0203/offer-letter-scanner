import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Download, Sparkles, Smartphone } from 'lucide-react';
import { ScanResult } from '../types';

interface HeaderProps {
  result?: ScanResult | null;
  onOpenCountermeasures?: () => void;
  onPrintReport?: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  result,
  onOpenCountermeasures,
  onPrintReport,
  onOpenInstall
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-700 shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
            <ShieldAlert className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white font-mono tracking-tight">
                SENTINEL<span className="text-cyan-400">.AI</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 border border-slate-700 font-bold hidden sm:inline-block">
                Cyber Defense Lab
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight truncate">
              Fake Offer Letter, Equipment Phishing &amp; Deposit Trap Scanner
            </p>
          </div>
        </div>

        {/* Status indicator & Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Engine:{' '}
              <strong className={result?.modelUsed === 'gemini-ai' ? 'text-cyan-300' : 'text-slate-300'}>
                {result?.modelUsed === 'gemini-ai' ? 'Google Gemini AI (API Key Active)' : 'Heuristic Security Matrix'}
              </strong>
            </span>
            {result?.modelUsed === 'gemini-ai' && (
              <span className="flex h-2 w-2 relative" title="Gemini API Key Connected">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </div>

          {onOpenInstall && (
            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 text-xs font-mono font-semibold border border-cyan-800 transition-colors shadow-sm"
              title="Install PhishGuard as Native Application"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {result && (
            <>
              <button
                onClick={onOpenCountermeasures}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-colors shadow-md shadow-indigo-950/40"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Defense Protocol</span>
              </button>

              <button
                onClick={onPrintReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold border border-slate-700 transition-colors"
                title="Print or Export Forensic Audit"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Export Audit</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
