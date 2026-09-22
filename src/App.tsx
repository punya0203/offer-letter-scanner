/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ThreatGauge } from './components/ThreatGauge';
import { SubScoreBars } from './components/SubScoreBars';
import { DomainInspectorCard } from './components/DomainInspectorCard';
import { HighlightedText } from './components/HighlightedText';
import { RedFlagItem } from './components/RedFlagItem';
import { SamplePicker } from './components/SamplePicker';
import { CountermeasuresModal } from './components/CountermeasuresModal';
import { FinancialBlastRadiusCard } from './components/FinancialBlastRadiusCard';
import { ScamLifecycleTimeline } from './components/ScamLifecycleTimeline';
import { EmailHeaderInspector } from './components/EmailHeaderInspector';
import { VerifiedDirectoryCard } from './components/VerifiedDirectoryCard';
import { AuditCertificateModal } from './components/AuditCertificateModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AuthenticationPipelineView } from './components/AuthenticationPipelineView';
import { QRCodeScannerModal } from './components/QRCodeScannerModal';
import { SAMPLE_CASES } from './data/sampleCases';
import { PresetSample, ScanResult, EmailHeaderAnalysis } from './types';
import { runHeuristicScan } from './utils/scannerEngine';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Search,
  Upload,
  Clipboard,
  Trash2,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Info,
  Clock,
  Mail,
  Building2,
  FileCheck,
  Award,
  QrCode,
  Camera
} from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('equipment-check-scam');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showCountermeasures, setShowCountermeasures] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'payment' | 'domain'>('all');
  const [scannerView, setScannerView] = useState<'text' | 'authPipeline' | 'headers' | 'directory'>('text');

  // Load initial preset on mount so the user immediately sees a working security scanner
  useEffect(() => {
    const initialSample = SAMPLE_CASES[0];
    setInputText(initialSample.text);
    setInputUrl(initialSample.url || '');
    executeScan(initialSample.text, initialSample.url || '');
  }, []);

  const handleSelectSample = (sample: PresetSample) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.text);
    setInputUrl(sample.url || '');
    executeScan(sample.text, sample.url || '');
  };

  const handleQrScanSuccess = (payload: string, isUrl: boolean) => {
    setSelectedSampleId('');
    if (isUrl) {
      setInputUrl(payload);
      executeScan(inputText, payload);
    } else {
      setInputText(payload);
      executeScan(payload, inputUrl);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setSelectedSampleId('');
      }
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setInputText('');
    setInputUrl('');
    setSelectedSampleId('');
    setScanResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setSelectedSampleId('');
      }
    };
    reader.readAsText(file);
  };

  const executeScan = async (textToScan: string, urlToScan: string) => {
    if (!textToScan.trim() && !urlToScan.trim()) return;

    setIsScanning(true);

    try {
      // 1. First trigger server scan (Gemini + heuristics)
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToScan, url: urlToScan })
      });

      if (res.ok) {
        const data: ScanResult = await res.json();
        setScanResult(data);
      } else {
        // Fallback to instant client-side heuristic engine
        const fallback = runHeuristicScan(textToScan, urlToScan);
        setScanResult(fallback);
      }
    } catch (err) {
      console.warn('Backend unavailable, running client heuristic engine:', err);
      const fallback = runHeuristicScan(textToScan, urlToScan);
      setScanResult(fallback);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTriggerManualScan = () => {
    executeScan(inputText, inputUrl);
  };

  const handleAnalyzeHeaders = (parsed: EmailHeaderAnalysis) => {
    if (scanResult) {
      setScanResult({
        ...scanResult,
        emailHeaderAnalysis: parsed
      });
    }
  };

  const handlePrintReport = () => {
    setShowCertificateModal(true);
  };

  // Filter red flags for active tab
  const filteredFlags = (scanResult?.redFlags || []).filter(flag => {
    if (activeTab === 'critical') return flag.severity === 'critical';
    if (activeTab === 'payment') return flag.category === 'PAYMENT_DEMAND' || flag.category === 'EQUIPMENT_SCAM';
    if (activeTab === 'domain') return flag.category === 'DOMAIN_ANOMALY';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col antialiased">
      <Header
        result={scanResult}
        onOpenCountermeasures={() => setShowCountermeasures(true)}
        onPrintReport={handlePrintReport}
        onOpenInstall={() => setShowInstallModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Hackathon Preset Bar */}
        <section className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/90 shadow-lg">
          <SamplePicker
            onSelectSample={handleSelectSample}
            selectedId={selectedSampleId}
          />
        </section>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setScannerView('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              scannerView === 'text'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Document &amp; URL Scanner</span>
          </button>

          <button
            onClick={() => setScannerView('authPipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              scannerView === 'authPipeline'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>7-Step Authentication Pipeline</span>
            {scanResult && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                scanResult.threatLevel === 'CRITICAL' || scanResult.threatLevel === 'HIGH'
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {scanResult.threatLevel === 'CRITICAL' || scanResult.threatLevel === 'HIGH' ? 'SPAM DETECTED' : 'SAFE'}
              </span>
            )}
          </button>

          <button
            onClick={() => setScannerView('headers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              scannerView === 'headers'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Header Forensics (SPF/DKIM)</span>
          </button>

          <button
            onClick={() => setScannerView('directory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              scannerView === 'directory'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Official Portal Directory</span>
          </button>
        </div>

        {/* Dynamic Section based on tab */}
        {scannerView === 'authPipeline' && scanResult && (
          <AuthenticationPipelineView
            pipeline={scanResult.authPipeline}
            threatLevel={scanResult.threatLevel}
            threatIndex={scanResult.threatIndex}
          />
        )}

        {scannerView === 'headers' && (
          <EmailHeaderInspector
            onAnalyzeHeaders={handleAnalyzeHeaders}
            existingAnalysis={scanResult?.emailHeaderAnalysis}
          />
        )}

        {scannerView === 'directory' && (
          <VerifiedDirectoryCard />
        )}

        {scannerView === 'text' && (
          /* Input & Scanner Form */
          <section className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  Inspect Offer Letter, Lease Agreement or Recruiter URL
                </h2>
                <p className="text-xs text-slate-400">
                  Paste the raw text of the offer letter, email, lease agreement, or the sender's domain URL to scan for phishing triggers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 text-cyan-300 hover:text-white text-xs font-mono font-bold border border-cyan-700/60 transition-all shadow-md shadow-cyan-950/40"
                  title="Scan QR code on physical offer letter, badge or screen"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scan QR / Camera</span>
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer border border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".txt,.eml,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handlePasteClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>

                {(inputText || inputUrl) && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-mono border border-slate-700 transition-colors"
                    title="Clear inputs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* URL / Domain Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Sender Website / Portal URL (Checks Domain Age &amp; Typosquatting)
                </label>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Scan from QR / Screen</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    setSelectedSampleId('');
                  }}
                  placeholder="e.g. https://careers-meta-workforce.top/onboard or hr@company-domain.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Offer Letter / Email Body / Lease Text
                </label>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                >
                  <Camera className="w-3 h-3 text-cyan-400" />
                  <span>Scan document QR overlay</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setSelectedSampleId('');
                }}
                placeholder="Paste the full text of the job offer letter, onboarding email, landlord message, or freelance agreement here..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed resize-y transition-all"
              />
            </div>

            {/* Scan Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multi-layer scan: checks domain age, cashier checks, wire traps &amp; PII extraction.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleTriggerManualScan}
                  disabled={isScanning || (!inputText.trim() && !inputUrl.trim())}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isScanning || (!inputText.trim() && !inputUrl.trim())
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-950/50 hover:shadow-cyan-900/60'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning Threat Vectors...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run Deep Forensic Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Threat Scan Results Dashboard */}
        {scanResult && (
          <section className="space-y-6 animate-fadeIn">
            {/* Critical Financial Demand Banner (if money/equipment demand detected) */}
            {scanResult.financialDemandDetected && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-600/80 text-white shadow-xl shadow-rose-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40 shrink-0">
                    <AlertOctagon className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-rose-300 px-2 py-0.5 rounded-full bg-rose-900/60 border border-rose-700/60 inline-block mb-1">
                      FINANCIAL TRAP DETECTED
                    </span>
                    <h3 className="text-base font-bold font-mono text-rose-100">
                      Payment or Equipment Reimbursement Demand Identified
                    </h3>
                    <p className="text-xs text-rose-200/90 leading-relaxed max-w-2xl mt-0.5">
                      {scanResult.demandedAmount ? (
                        <>Demand of <strong>{scanResult.demandedAmount}</strong> via <strong>{scanResult.demandedMethod || 'untraceable channels'}</strong>. </>
                      ) : null}
                      Legitimate employers NEVER ask you to purchase equipment through certified vendors, nor do real landlords demand holding deposits via Zelle before physical walk-throughs.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold transition-all border border-slate-700 flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dossier</span>
                  </button>

                  <button
                    onClick={() => setShowCountermeasures(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>Defense Protocol</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Main Scoreboard: Threat Gauge + SubScores */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Dynamic Threat Gauge */}
              <div className="lg:col-span-4 flex flex-col justify-between">
                <ThreatGauge
                  score={scanResult.threatIndex}
                  level={scanResult.threatLevel}
                />
              </div>

              {/* Right Column: Forensic Summary & Sub-Index Breakdown */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">
                        Forensic Intelligence Briefing
                      </span>
                      {scanResult.modelUsed === 'gemini-ai' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-700/60 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                          <span>Gemini API Key Live Reasoning</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Heuristic Rules
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      Analyzed at {new Date(scanResult.analyzedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                    {scanResult.summary}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">Target Classification:</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-bold">
                      {scanResult.targetType}
                    </span>
                    <span className="text-slate-400 ml-auto flex items-center gap-1.5">
                      Engine: 
                      <span className={scanResult.modelUsed === 'gemini-ai' ? 'text-cyan-300 font-bold' : 'text-slate-200'}>
                        {scanResult.modelUsed === 'gemini-ai' ? 'Google Gemini AI (Active API Key)' : scanResult.modelUsed}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Sub-Score Bars */}
                <SubScoreBars subScores={scanResult.subScores} />
              </div>
            </div>

            {/* Financial Blast Radius Calculator Card */}
            {scanResult.blastRadius && (
              <FinancialBlastRadiusCard
                blastRadius={scanResult.blastRadius}
                threatLevel={scanResult.threatLevel}
              />
            )}

            {/* 7-Step Authentication Verification Pipeline */}
            {scanResult.authPipeline && scanResult.authPipeline.length > 0 && (
              <AuthenticationPipelineView
                pipeline={scanResult.authPipeline}
                threatLevel={scanResult.threatLevel}
                threatIndex={scanResult.threatIndex}
              />
            )}

            {/* Scam Execution Lifecycle Timeline */}
            {scanResult.timelineSteps && scanResult.timelineSteps.length > 0 && (
              <ScamLifecycleTimeline
                steps={scanResult.timelineSteps}
                threatLevel={scanResult.threatLevel}
              />
            )}

            {/* Domain & Infrastructure Inspection Card */}
            {scanResult.domainAnalysis && (
              <DomainInspectorCard
                analysis={scanResult.domainAnalysis}
                providedUrl={inputUrl}
              />
            )}

            {/* Interactive Document Heatmap with Clickable Flags */}
            <HighlightedText
              text={inputText}
              redFlags={scanResult.redFlags}
            />

            {/* Forensic Red Flags Detailed Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    Identified Red Flags &amp; Anomalies ({scanResult.redFlags.length})
                  </h3>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-colors ${
                      activeTab === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({scanResult.redFlags.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('critical')}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-colors ${
                      activeTab === 'critical' ? 'bg-rose-950 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Critical ({scanResult.redFlags.filter(f => f.severity === 'critical').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-colors ${
                      activeTab === 'payment' ? 'bg-amber-950 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Payment / Equipment
                  </button>
                  <button
                    onClick={() => setActiveTab('domain')}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-colors ${
                      activeTab === 'domain' ? 'bg-indigo-950 text-indigo-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Domain
                  </button>
                </div>
              </div>

              {filteredFlags.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredFlags.map(flag => (
                    <RedFlagItem key={flag.id} flag={flag} />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs font-mono">
                  No red flags matching this filter.
                </div>
              )}
            </div>

            {/* Positive Indicators (Green Flags) if present */}
            {scanResult.greenFlags && scanResult.greenFlags.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    Legitimate Compliance Markers Identified
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-emerald-200/90 font-mono list-disc list-inside">
                  {scanResult.greenFlags.map((flag, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Countermeasures Modal */}
      {scanResult && (
        <CountermeasuresModal
          isOpen={showCountermeasures}
          onClose={() => setShowCountermeasures(false)}
          result={scanResult}
        />
      )}

      {/* Cryptographic Audit Certificate Modal */}
      {scanResult && (
        <AuditCertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          result={scanResult}
        />
      )}

      {/* PWA Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* QR Code / Physical Document Camera Scanner Modal */}
      <QRCodeScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={handleQrScanSuccess}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Sentinel PhishGuard • Hackathon Cyber Intelligence Inspector
          </span>
          <span>
            Never deposit third-party checks to purchase vendor equipment.
          </span>
        </div>
      </footer>
    </div>
  );
}
