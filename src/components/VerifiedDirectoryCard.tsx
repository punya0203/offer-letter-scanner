import React, { useState } from 'react';
import { VERIFIED_DIRECTORIES } from '../data/verifiedPortals';
import { VerifiedBrandDirectory } from '../types';
import { ShieldCheck, Search, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const VerifiedDirectoryCard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = VERIFIED_DIRECTORIES.filter(item =>
    item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.verifiedDomains.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              Official Whitelist &amp; Career Portal Directory
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Direct verification directory of genuine enterprise hiring infrastructure.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brand (Google, Meta, Apple...)"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-white">
                  {item.brandName}
                </span>
                <a
                  href={item.officialCareersUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1 mb-2">
                <span className="text-[10px] uppercase font-mono font-semibold text-slate-500 block">
                  Authentic Domains Only:
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.verifiedDomains.map((d, i) => (
                    <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      @{d}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                {item.notes}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center gap-1.5 text-[10px] text-amber-400/90 font-mono">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Known Spoofs: {item.knownScamPhrases.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
