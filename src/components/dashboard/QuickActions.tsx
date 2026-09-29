import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  selectedDay: number;
}

export function QuickActions({ selectedDay }: QuickActionsProps) {
  const dayStr = String(selectedDay).padStart(2, '0');

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-2 mb-2 font-mono">
          <Layers className="w-4 h-4 text-amber-600" /> Gestión Operativa del Día {selectedDay}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Accede al panel de control de la jornada {selectedDay} para ingresar el link de TikTok, descargar comentarios en tiempo real y ejecutar la selección por Target IDs.
        </p>
      </div>

      <div className="space-y-2">
        <Link
          href={`/project/day/${selectedDay}`}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <span>Ir a Jornada Diaria (Día {dayStr})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/editorial"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors border border-slate-200"
        >
          <span>Abrir Workbench Editorial</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </Link>
      </div>
    </div>
  );
}
