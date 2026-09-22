import React, { useState } from 'react';
import { EmailHeaderAnalysis } from '../types';
import { MailCheck, MailWarning, AlertTriangle, CheckCircle2, Copy, Sparkles } from 'lucide-react';
import { parseEmailHeaders } from '../utils/scannerEngine';

interface EmailHeaderInspectorProps {
  onAnalyzeHeaders: (parsed: EmailHeaderAnalysis) => void;
  existingAnalysis?: EmailHeaderAnalysis;
}

const SAMPLE_SPOOFED_HEADER = `Authentication-Results: mx.google.com;
       spf=fail (google.com: domain of support@phishing-relay-node.ru does not designate 185.220.101.5 as permitted sender) smtp.mailfrom=support@phishing-relay-node.ru;
       dkim=none (no key for signature);
       dmarc=fail (p=REJECT sp=REJECT dis=REJECT) header.from=meta.com
Received: from mail.phishing-relay-node.ru (185.220.101.5) by mx.google.com with ESMTP;
Return-Path: <support@phishing-relay-node.ru>
From: "Meta Recruitment Team" <careers-hr@meta.com>
To: <candidate@gmail.com>
Subject: Urgent: Meta Remote Senior Data Analyst Offer Letter Verification
Date: Mon, 21 Sep 2026 14:22:01 +0000`;

export const EmailHeaderInspector: React.FC<EmailHeaderInspectorProps> = ({
  onAnalyzeHeaders,
  existingAnalysis
}) => {
  const [headerInput, setHeaderInput] = useState<string>('');
  const [analysis, setAnalysis] = useState<EmailHeaderAnalysis | undefined>(existingAnalysis);

  const handleParse = (text: string) => {
    setHeaderInput(text);
    const parsed = parseEmailHeaders(text);
    setAnalysis(parsed);
    onAnalyzeHeaders(parsed);
  };

  const handleLoadSample = () => {
    handleParse(SAMPLE_SPOOFED_HEADER);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <MailWarning className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              Email Header &amp; Authentication Protocol Inspector
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold border border-slate-700">
                SPF • DKIM • DMARC
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Detects display name spoofing, failed cryptographic signatures, and unauthorized relay servers.
            </p>
          </div>
        </div>

        <button
          onClick={handleLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-mono font-semibold border border-indigo-800 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample Spoofed Header</span>
        </button>
      </div>

      <div>
        <textarea
          rows={4}
          value={headerInput}
          onChange={(e) => handleParse(e.target.value)}
          placeholder="Paste raw email headers (Received, Authentication-Results, Return-Path, From)..."
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
        />
      </div>

      {analysis && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
          {/* Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* SPF */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block mb-1">
                SPF (Sender Policy)
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  analysis.spfStatus === 'PASS'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : analysis.spfStatus === 'FAIL' || analysis.spfStatus === 'SOFTFAIL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {analysis.spfStatus}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {analysis.spfStatus === 'PASS' ? 'Authorized IP' : 'Unauthorized Sending IP'}
                </span>
              </div>
            </div>

            {/* DKIM */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block mb-1">
                DKIM (Crypto Signature)
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  analysis.dkimStatus === 'PASS'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : analysis.dkimStatus === 'FAIL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {analysis.dkimStatus}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {analysis.dkimStatus === 'PASS' ? 'Tamper-Proof' : 'Missing or Invalid Key'}
                </span>
              </div>
            </div>

            {/* DMARC */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block mb-1">
                DMARC (Domain Alignment)
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  analysis.dmarcStatus === 'PASS'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : analysis.dmarcStatus === 'FAIL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {analysis.dmarcStatus}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {analysis.dmarcStatus === 'PASS' ? 'Aligned' : 'Policy Rejection'}
                </span>
              </div>
            </div>
          </div>

          {/* Envelope vs From comparison */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Visual 'From:' Header:</span>
              <strong className="text-white">{analysis.headerFrom}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Technical 'Return-Path:' Envelope:</span>
              <strong className={analysis.isSpoofed ? 'text-rose-400' : 'text-emerald-400'}>
                {analysis.envelopeFrom}
              </strong>
            </div>
          </div>

          {/* Anomalies */}
          {analysis.anomalies.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Protocol Anomalies Detected</span>
              </div>
              <ul className="text-[11px] text-rose-200/90 font-mono space-y-1 list-disc list-inside">
                {analysis.anomalies.map((ano, i) => (
                  <li key={i}>{ano}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
