import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronDown, 
  Lock, 
  Globe, 
  UserCheck, 
  DollarSign, 
  Scale, 
  Building2, 
  FileCheck2,
  Terminal,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { AuthenticationPipelineStep, ScanResult } from '../types';

interface AuthenticationPipelineViewProps {
  pipeline?: AuthenticationPipelineStep[];
  threatLevel: ScanResult['threatLevel'];
  threatIndex: number;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  'auth-header-envelope': <Lock className="w-5 h-5" />,
  'auth-domain-infrastructure': <Globe className="w-5 h-5" />,
  'auth-screening-protocol': <UserCheck className="w-5 h-5" />,
  'auth-financial-authorization': <DollarSign className="w-5 h-5" />,
  'auth-regulatory-compliance': <Scale className="w-5 h-5" />,
  'auth-whitelist-cross-check': <Building2 className="w-5 h-5" />,
  'auth-final-verdict': <FileCheck2 className="w-5 h-5" />
};

export const AuthenticationPipelineView: React.FC<AuthenticationPipelineViewProps> = ({
  pipeline = [],
  threatLevel,
  threatIndex
}) => {
  const [filter, setFilter] = useState<'all' | 'failed' | 'passed'>('all');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  if (!pipeline || pipeline.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center font-mono text-xs text-slate-400">
        Run a forensic scan to activate the 7-step authentication pipeline.
      </div>
    );
  }

  const failedCount = pipeline.filter(s => s.status === 'FAILED').length;
  const passedCount = pipeline.filter(s => s.status === 'PASSED').length;
  const suspiciousCount = pipeline.filter(s => s.status === 'SUSPICIOUS').length;

  const isSpam = threatLevel === 'CRITICAL' || threatLevel === 'HIGH' || failedCount >= 2;

  const filteredSteps = pipeline.filter(step => {
    if (filter === 'failed') return step.status === 'FAILED' || step.status === 'SUSPICIOUS';
    if (filter === 'passed') return step.status === 'PASSED';
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedStepId(prev => (prev === id ? null : id));
  };

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header with Pipeline Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isSpam ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {isSpam ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Multi-Step Authentication Verification Pipeline</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 font-sans">
                  7 Gates (First to Last)
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Sequential authentication checks proving whether this correspondence is SPAM or LEGITIMATE.
              </p>
            </div>
          </div>
        </div>

        {/* Global Verdict Banner */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border flex items-center gap-2 ${
            isSpam
              ? 'bg-red-950/80 text-red-300 border-red-700/80 shadow-lg shadow-red-950/40'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-lg shadow-emerald-950/40'
          }`}>
            {isSpam ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>
              {isSpam ? `AUTHENTICATION FAILED: ${failedCount} CRITICAL GATES BROKEN (SPAM DETECTED)` : 'ALL 7 GATES AUTHENTICATED (NOT SPAM)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-400">
            <span className="text-emerald-400 font-bold">{passedCount} Passed</span>
            <span>•</span>
            <span className="text-red-400 font-bold">{failedCount} Failed</span>
            {suspiciousCount > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-bold">{suspiciousCount} Suspicious</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Visual Progress Stepper (1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7) */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Sequential Authentication Gate Progression</span>
          <span className="text-cyan-400 font-bold">Steps 1 through 7</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {pipeline.map((step) => {
            const isFailed = step.status === 'FAILED';
            const isSuspicious = step.status === 'SUSPICIOUS';
            const isPassed = step.status === 'PASSED';
            const isSelected = expandedStepId === step.id;

            return (
              <button
                key={step.id}
                onClick={() => toggleExpand(step.id)}
                className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-cyan-500 bg-slate-900 border-cyan-500/50'
                    : isFailed
                    ? 'bg-red-950/30 border-red-900/60 hover:bg-red-950/50'
                    : isSuspicious
                    ? 'bg-amber-950/30 border-amber-900/60 hover:bg-amber-950/50'
                    : 'bg-emerald-950/30 border-emerald-900/60 hover:bg-emerald-950/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Step {step.stepNumber}
                  </span>
                  {isFailed ? (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  ) : isSuspicious ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-xs font-mono font-bold text-white truncate">
                  {step.name.split(' ')[0]} {step.name.split(' ')[1] || ''}
                </div>
                <div className={`text-[9px] font-mono uppercase font-bold mt-1 ${
                  isFailed ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {isFailed ? 'SPAM GATELOST' : isSuspicious ? 'FLAGGED' : 'PASSED'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Steps ({pipeline.length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'failed'
                ? 'bg-red-950 text-red-300 border border-red-800 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Spam / Failed Gates ({failedCount + suspiciousCount})</span>
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'passed'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Authenticated Gates ({passedCount})</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
          Click any step to inspect forensic proof
        </div>
      </div>

      {/* Detailed Step-by-Step List (From First to Last) */}
      <div className="space-y-4">
        {filteredSteps.map((step) => {
          const isFailed = step.status === 'FAILED';
          const isSuspicious = step.status === 'SUSPICIOUS';
          const isPassed = step.status === 'PASSED';
          const isExpanded = expandedStepId === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isFailed
                  ? 'bg-slate-950/90 border-red-900/60 shadow-lg shadow-red-950/20'
                  : isSuspicious
                  ? 'bg-slate-950/90 border-amber-900/60 shadow-lg shadow-amber-950/20'
                  : 'bg-slate-950/90 border-emerald-900/40'
              }`}
            >
              {/* Step Summary Bar (Clickable) */}
              <button
                onClick={() => toggleExpand(step.id)}
                className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${
                    isFailed
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : isSuspicious
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {STEP_ICONS[step.id] || <ShieldCheck className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Step {step.stepNumber} of 7
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {step.category}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                      {step.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 border ${
                    isFailed
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : isSuspicious
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}>
                    {isFailed ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>SPAM / FAILED</span>
                      </>
                    ) : isSuspicious ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>SUSPICIOUS</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AUTHENTICATED</span>
                      </>
                    )}
                  </div>

                  <div className="text-slate-500">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </button>

              {/* Step Expanded Content: Forensic Evidence & Verdict */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/50 space-y-4 font-mono animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* What Was Checked */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                        <Info className="w-3.5 h-3.5" />
                        <span>1. What Was Checked</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {step.whatWasChecked}
                      </p>
                    </div>

                    {/* Authentication Evidence Found */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>2. Authentication Evidence Found</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {step.evidenceFound}
                      </p>
                    </div>
                  </div>

                  {/* Technical / Statutory Protocol */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Protocol Standard:</span>
                    <span className="text-cyan-300">{step.technicalDetails}</span>
                  </div>

                  {/* Step Verdict: SPAM vs NOT SPAM Callout */}
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isFailed
                      ? 'bg-red-950/70 border-red-800 text-red-200'
                      : isSuspicious
                      ? 'bg-amber-950/70 border-amber-800 text-amber-200'
                      : 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span>Authentication Gate Verdict:</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] uppercase ${
                          isFailed ? 'bg-red-900 text-white' : isSuspicious ? 'bg-amber-900 text-white' : 'bg-emerald-900 text-white'
                        }`}>
                          {step.verdictLabel}
                        </span>
                      </div>
                      <p className="text-xs font-sans opacity-90">
                        {step.verdictExplanation}
                      </p>
                    </div>

                    <div className="shrink-0 text-right font-mono">
                      <span className="text-[10px] text-slate-400 block">Gate Outcome:</span>
                      <strong className={`text-sm ${isFailed ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isFailed ? 'CONFIRMED SPAM VECTOR' : isSuspicious ? 'UNVERIFIED RISK' : 'AUTHENTICATED'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Callout */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Every stage tests a distinct vector: RFC protocols, WHOIS data, hiring practices, Federal banking rules, and corporate whitelists.
          </span>
        </div>

        <div className="font-bold text-cyan-400 shrink-0">
          {isSpam ? '⚠️ Recommendation: Block Sender & Cease Contact' : '✅ Recommendation: Proceed with Standard Hiring'}
        </div>
      </div>
    </section>
  );
};
