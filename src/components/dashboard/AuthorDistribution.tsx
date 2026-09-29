import React from 'react';
import { Users } from 'lucide-react';

interface AuthorDistributionProps {
  authorsWith1: number;
  authorsWith2: number;
  authorsWith3Max: number;
}

export function AuthorDistribution({
  authorsWith1,
  authorsWith2,
  authorsWith3Max,
}: AuthorDistributionProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-2 font-mono">
        <Users className="w-4 h-4 text-amber-600" /> Distribución de Autores Oficiales
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-700 font-medium">Autores con 1 selección oficial</span>
          <span className="font-mono text-sm font-bold text-amber-800">{authorsWith1}</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-700 font-medium">Autores con 2 selecciones oficiales</span>
          <span className="font-mono text-sm font-bold text-amber-800">{authorsWith2}</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50 border border-amber-300">
          <span className="text-xs text-amber-900 font-semibold">Autores Límite Alcanzado (3/3)</span>
          <span className="font-mono text-sm font-bold text-amber-800">{authorsWith3Max}</span>
        </div>
      </div>
    </div>
  );
}
