'use client';

import { useState } from 'react';
import { Sparkles, GitBranch, Info, RefreshCw } from 'lucide-react';
import { MockAIProvider } from '@/lib/ai/mock-ai-provider';
import { ButterflyTree } from '@/components/shared/ButterflyTree';

export default function ButterflyEffectPage() {
  const [contributionText, setContributionText] = useState('');
  const [branches, setBranches] = useState<any[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeButterflyEffect = async () => {
    setIsAnalyzing(true);
    try {
      const provider = new MockAIProvider();
      const analysis = await provider.analyzeContinuity(contributionText);
      if (analysis.possible_consequences.length > 0) {
        setBranches([
          ...branches,
          {
            id: `b_${Date.now()}`,
            title: `Consecuencia ${branches.length + 1}: Ramificación detectada`,
            description: analysis.possible_consequences[0],
            impact: 'ALTO',
            status: 'POTENCIAL',
          },
        ]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-800 text-xs font-mono font-bold mb-1">
            <span>DETECTOR DE CAUSALIDAD NARRATIVA</span>
            <span>•</span>
            <span>BUTTERFLY EFFECT ANALYZER</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            Analizador de Efecto Mariposa
          </h1>
        </div>

        <button
          onClick={handleAnalyzeButterflyEffect}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
          <span>Generar Ramificaciones Causalidad</span>
        </button>
      </div>

      {/* Info Alert */}
      <div className="glass-panel p-4 rounded-xl border border-sky-300 bg-sky-50 flex items-center gap-3 text-xs text-sky-900 font-medium shadow-2xs">
        <Info className="w-5 h-5 text-sky-700 shrink-0" />
        <span>
          <strong>HERRAMIENTA EDITORIAL:</strong> Las consecuencias generadas por la IA NO forman parte automática de la novela. Son herramientas de exploración narrativa para guiar a los editores.
        </span>
      </div>

      {/* Interactive Visual Node Tree */}
      <ButterflyTree />

      {/* Main Grid: Input + Interactive Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Contribution Input */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-2 font-mono font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" /> Aportación Detonante
          </h2>
          <textarea
            rows={5}
            value={contributionText}
            onChange={(e) => setContributionText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-serif text-sm text-slate-900 leading-relaxed outline-none focus:border-amber-500 font-medium"
          />
          <div className="text-[11px] font-mono text-slate-600 flex justify-between font-bold">
            <span>ID: EMP-COM-000041</span>
            <span className="text-amber-800 font-bold">75 PALABRAS</span>
          </div>
        </div>

        {/* Visual Tree of Branches */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-2 font-mono font-bold">
            <GitBranch className="w-4 h-4 text-amber-600" /> Ramificaciones de Causalidad Posibles ({branches.length})
          </h2>

          {branches.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <GitBranch className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Árbol del Efecto Mariposa Vacío — Día 1</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No hay ramificaciones registradas todavía. Ingresa a "Jornada Diaria" para procesar comentarios o escribe un aporte a la izquierda para simular consecuencias.
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-amber-400 pointer-events-none"></div>

              {branches.map((b, idx) => (
                <div key={b.id} className="relative pl-12">
                  <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[9px] text-slate-950 font-bold shadow-xs">
                    {idx + 1}
                  </div>
                  <div className="glass-panel p-5 rounded-xl border border-slate-200 hover:border-amber-400 transition-all space-y-2 bg-slate-50/60 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-serif font-bold text-slate-900">{b.title}</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        IMPACTO: {b.impact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-serif font-medium">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
