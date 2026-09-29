import React from 'react';
import { BookOpen } from 'lucide-react';

interface StoryHealthCardProps {
  openMysteries: number;
  activeSeeds: number;
  riskLevel?: 'BAJO' | 'MEDIO' | 'ALTO';
}

export function StoryHealthCard({
  openMysteries,
  activeSeeds,
  riskLevel = 'BAJO',
}: StoryHealthCardProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-2 font-mono">
        <BookOpen className="w-4 h-4 text-amber-600" /> Salud Narrativa (Story Health)
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-700 font-medium">Misterios Activos Abiertos</span>
          <span className="font-mono text-sm font-bold text-sky-700">{openMysteries}</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-700 font-medium">Semillas Narrativas en Desarrollo</span>
          <span className="font-mono text-sm font-bold text-amber-800">{activeSeeds}</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-700 font-medium">Riesgo Narrativo Actual</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded border ${
              riskLevel === 'BAJO'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : riskLevel === 'MEDIO'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            {riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}
