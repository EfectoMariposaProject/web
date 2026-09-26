'use client';

import { useState } from 'react';
import { Activity, ShieldCheck, AlertTriangle, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function NarrativeHealthPage() {
  const [metrics] = useState({
    activeSubplots: 0,
    activeCharacters: 0,
    charactersDormantOver30Days: 0,
    openMysteries: 0,
    mysteriesOver60Days: 0,
    unresolvedObjects: 0,
    openSeeds: 0,
    pendingContradictions: 0,
    arcsNearResolution: 0,
  });

  const [continuityIssues] = useState<any[]>([]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-800 text-xs font-mono font-bold mb-1">
            <span>INDICADORES DE SALUD Y CONTINUIDAD</span>
            <span>•</span>
            <span>EFECTO MARIPOSA PROJECT</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            Salud Narrativa (Narrative Health)
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" /> CONTINUIDAD SALUDABLE
        </div>
      </div>

      {/* Main Grid Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-600 font-bold">
            <span className="text-xs uppercase">Subtramas Activas</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">{metrics.activeSubplots}</div>
          <p className="text-[11px] text-slate-600 font-medium">Arcos narrativos secundarios en desarrollo</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-600 font-bold">
            <span className="text-xs uppercase">Personajes Inactivos (&gt;30 Días)</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-bold text-rose-700 font-mono">{metrics.charactersDormantOver30Days}</div>
          <p className="text-[11px] text-slate-600 font-medium">Revisar reincorporación de personajes en desuso</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-600 font-bold">
            <span className="text-xs uppercase">Misterios Crónicos (&gt;60 Días)</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-700 font-mono">{metrics.mysteriesOver60Days}</div>
          <p className="text-[11px] text-emerald-800 font-bold">Sin misterios estancados en exceso</p>
        </div>
      </div>

      {/* Continuity Issues Log */}
      <div className="glass-panel rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 p-6">
        <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" /> Detección de Contradicciones e Incidencias de Continuidad
        </h2>

        <div className="divide-y divide-slate-100 font-mono text-xs">
          {continuityIssues.length === 0 ? (
            <div className="p-12 text-center font-sans space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Continuidad 100% Limpia — Día 1</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No hay observaciones ni contradicciones detectadas. El sistema auditará la coherencia del relato conforme avance la ingesta del Día 1.
              </p>
            </div>
          ) : (
            continuityIssues.map((issue) => (
              <div key={issue.id} className="p-5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    TIPO: {issue.type} (SEVERIDAD: {issue.severity})
                  </span>
                  <span className="text-emerald-800 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {issue.status}
                  </span>
                </div>
                <p className="font-sans text-sm text-slate-800 font-medium">{issue.description}</p>
                <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-semibold">
                  Sugerencia IA: {issue.suggestion}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
