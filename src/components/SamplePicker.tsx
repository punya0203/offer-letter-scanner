import React from 'react';
import { SAMPLE_CASES } from '../data/sampleCases';
import { PresetSample } from '../types';
import { AlertTriangle, Sparkles, Building2, Home, Globe, CheckCircle } from 'lucide-react';

interface SamplePickerProps {
  onSelectSample: (sample: PresetSample) => void;
  selectedId?: string;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({ onSelectSample, selectedId }) => {
  const getIcon = (type: PresetSample['type']) => {
    switch (type) {
      case 'rental':
        return Home;
      case 'domain':
        return Globe;
      default:
        return Building2;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hackathon Demo Presets (1-Click Load)</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          5 real-world attack vectors
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {SAMPLE_CASES.map(sample => {
          const Icon = getIcon(sample.type);
          const isSelected = selectedId === sample.id;
          const isSafe = sample.expectedRisk === 'LOW';

          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className={`p-1 rounded-md ${
                    isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-full ${
                    isSafe
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {sample.categoryBadge}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-200 group-hover:text-white font-mono line-clamp-1">
                  {sample.title}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {sample.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
