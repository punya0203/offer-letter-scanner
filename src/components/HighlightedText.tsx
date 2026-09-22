import React, { useState } from 'react';
import { RedFlag } from '../types';
import { AlertCircle, Check, Copy, Eye, FileText, HelpCircle } from 'lucide-react';

interface HighlightedTextProps {
  text: string;
  redFlags: RedFlag[];
}

interface HighlightSpan {
  start: number;
  end: number;
  flag: RedFlag;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, redFlags }) => {
  const [activeFlag, setActiveFlag] = useState<RedFlag | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'annotated' | 'raw'>('annotated');

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find occurrences of flaggedText within text
  const spans: HighlightSpan[] = [];
  redFlags.forEach(flag => {
    if (!flag.flaggedText || flag.flaggedText.length < 3) return;

    const query = flag.flaggedText.toLowerCase();
    const sourceLower = text.toLowerCase();
    let pos = 0;

    while (pos < text.length) {
      const idx = sourceLower.indexOf(query, pos);
      if (idx === -1) break;

      // Check if overlapping existing span
      const overlap = spans.some(s => (idx >= s.start && idx < s.end) || (idx + query.length > s.start && idx + query.length <= s.end));
      if (!overlap) {
        spans.push({
          start: idx,
          end: idx + query.length,
          flag
        });
      }
      pos = idx + query.length;
    }
  });

  // Sort spans by start index
  spans.sort((a, b) => a.start - b.start);

  // Render fragments
  const renderAnnotatedText = () => {
    if (spans.length === 0) {
      return <div className="whitespace-pre-wrap leading-relaxed text-slate-300 font-mono text-xs">{text}</div>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    spans.forEach((span, i) => {
      // Plain text before highlight
      if (span.start > lastIndex) {
        elements.push(
          <span key={`plain-${lastIndex}`} className="text-slate-300">
            {text.slice(lastIndex, span.start)}
          </span>
        );
      }

      // Flagged highlight
      const flaggedSnippet = text.slice(span.start, span.end);
      let highlightClass = 'bg-yellow-500/25 text-yellow-200 border-b-2 border-yellow-500';
      if (span.flag.severity === 'critical') {
        highlightClass = 'bg-rose-500/30 text-rose-200 border-b-2 border-rose-500 font-semibold';
      } else if (span.flag.severity === 'high') {
        highlightClass = 'bg-amber-500/30 text-amber-200 border-b-2 border-amber-500 font-semibold';
      }

      elements.push(
        <mark
          key={`flag-${i}`}
          onClick={() => setActiveFlag(span.flag)}
          className={`cursor-pointer rounded-xs px-1 py-0.5 transition-all hover:ring-2 hover:ring-white/40 ${highlightClass}`}
          title={`Click to inspect flag: ${span.flag.title}`}
        >
          {flaggedSnippet}
        </mark>
      );

      lastIndex = span.end;
    });

    if (lastIndex < text.length) {
      elements.push(
        <span key={`plain-end`} className="text-slate-300">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-slate-300 font-mono text-xs select-text">
        {elements}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-md flex flex-col overflow-hidden">
      {/* Header Controls */}
      <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            Letter Forensics &amp; Highlight Heatmap
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            {spans.length} triggers detected
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'annotated' ? 'raw' : 'annotated')}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-mono transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            {viewMode === 'annotated' ? 'Raw View' : 'Highlight View'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Selected Flag Inspection Banner */}
      {activeFlag && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${
              activeFlag.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
            }`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">
                  {activeFlag.title}
                </span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeFlag.severity === 'critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {activeFlag.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                {activeFlag.description}
              </p>
              <p className="text-[11px] text-cyan-300 mt-1 font-mono font-semibold">
                Countermeasure: {activeFlag.recommendation}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveFlag(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content Body */}
      <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs bg-slate-950/40">
        {viewMode === 'annotated' ? (
          renderAnnotatedText()
        ) : (
          <pre className="whitespace-pre-wrap leading-relaxed text-slate-300 font-mono text-xs">
            {text}
          </pre>
        )}
      </div>

      <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          Click highlighted spans in the document to review forensic details
        </span>
        <span>{text.split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  );
};
