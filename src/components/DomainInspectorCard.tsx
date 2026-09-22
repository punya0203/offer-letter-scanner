import React, { useState, useEffect } from 'react';
import { DomainAnalysis } from '../types';
import { ShieldAlert, ShieldCheck, Clock, Server, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface DomainInspectorCardProps {
  analysis?: DomainAnalysis;
  providedUrl?: string;
}

interface DnsState {
  hasMx?: boolean;
  hasA?: boolean;
  mxCount?: number;
  primaryIp?: string | null;
  loading: boolean;
}

export const DomainInspectorCard: React.FC<DomainInspectorCardProps> = ({
  analysis,
  providedUrl
}) => {
  const [dnsState, setDnsState] = useState<DnsState>({ loading: false });

  useEffect(() => {
    if (!analysis?.domain || analysis.isFreeEmailProvider) return;

    let isMounted = true;
    setDnsState(prev => ({ ...prev, loading: true }));

    fetch(`/api/domain-lookup?domain=${encodeURIComponent(analysis.domain)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setDnsState({
            hasMx: data.hasMx,
            hasA: data.hasA,
            mxCount: data.mxCount,
            primaryIp: data.primaryIp,
            loading: false
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setDnsState({ loading: false });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [analysis?.domain, analysis?.isFreeEmailProvider]);

  if (!analysis) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        No domain or email address detected in scanned content.
      </div>
    );
  }

  const isDangerous = analysis.riskScore >= 50 || analysis.isNewlyRegistered || analysis.targetBrandLookalike;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isDangerous
        ? 'bg-slate-900/90 border-rose-500/40 shadow-rose-950/20 shadow-lg'
        : 'bg-slate-900/80 border-slate-800'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${
            isDangerous ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isDangerous ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono tracking-tight">
                {analysis.domain}
              </span>
              {analysis.isNewlyRegistered && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-900/50 text-rose-300 border border-rose-700/50">
                  NEW DOMAIN
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Infrastructure &amp; Identity Audit
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">
            Domain Risk
          </span>
          <span className={`text-sm font-bold font-mono ${
            analysis.riskScore >= 50 ? 'text-rose-400' : analysis.riskScore > 20 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {analysis.riskScore}%
          </span>
        </div>
      </div>

      {/* Grid of Key Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
        {/* Domain Age */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
              Domain Age
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-200">
            {analysis.ageLabel || (analysis.ageDays ? `${analysis.ageDays} days old` : 'Unknown / Private')}
          </div>
          {analysis.isNewlyRegistered && (
            <span className="text-[10px] text-rose-400 font-medium block mt-0.5">
              High risk: Under 30 days old
            </span>
          )}
        </div>

        {/* Identity Category */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Server className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
              Provider Type
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-200">
            {analysis.isFreeEmailProvider ? 'Public Webmail' : 'Custom Host / DNS'}
          </div>
          {analysis.isFreeEmailProvider ? (
            <span className="text-[10px] text-amber-400 block mt-0.5">
              Not dedicated corporate email
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Dedicated Mail Server
            </span>
          )}
        </div>

        {/* DNS & TLD Status */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            {dnsState.loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
            ) : dnsState.hasMx ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
              DNS Records
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-200">
            {dnsState.loading
              ? 'Querying DNS...'
              : dnsState.hasMx
              ? `Active Mail (MX: ${dnsState.mxCount})`
              : analysis.suspiciousTld
              ? 'Suspicious High-Abuse TLD'
              : 'Resolved'}
          </div>
          {analysis.suspiciousTld && (
            <span className="text-[10px] text-rose-400 block mt-0.5 font-medium">
              Cheap disposable TLD
            </span>
          )}
        </div>
      </div>

      {/* Brand Impersonation Alert Banner */}
      {analysis.targetBrandLookalike && (
        <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-center gap-2 text-rose-200 text-xs mb-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Typosquatting Alert:</strong> This domain attempts to imitate <strong>{analysis.targetBrandLookalike}</strong> by appending keywords to mislead victims.
          </span>
        </div>
      )}

      {/* Notes list */}
      {analysis.notes.length > 0 && (
        <ul className="space-y-1 mt-2 text-[11px] text-slate-400 list-disc list-inside">
          {analysis.notes.map((note, idx) => (
            <li key={idx} className="leading-snug">
              {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
