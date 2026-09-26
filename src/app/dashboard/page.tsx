'use client';

import Link from 'next/link';
import { Sparkles, Users, FileText, CheckCircle, BookOpen, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const kpis = {
    dayNumber: 1,
    totalDays: 365,
    weekNumber: 1,
    totalContributions: 0,
    dailyContributions: 0,
    validContributions: 0,
    invalidContributions: 0,
    incorporatedContributions: 0,
    uniqueAuthors: 0,
    authorsWith1: 0,
    authorsWith2: 0,
    authorsWith3Max: 0,
    openMysteries: 0,
    activeSeeds: 0,
    pendingContradictions: 0,
  };

  return (
    <div className="space-y-8">
      {/* Banner / Header Hero */}
      <div className="glass-panel p-8 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 relative overflow-hidden butterfly-glow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> RETO EN CURSO (365 DÍAS)
              </span>
              <span className="text-slate-500 text-xs font-mono font-semibold">SEMANA {kpis.weekNumber}</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
              EFECTO MARIPOSA <span className="gold-gradient-text">PROJECT</span>
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Plataforma de gestión y control de la novela colaborativa construida en 365 días (Mín 69, Máx 96 palabras).
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-white px-6 py-4 rounded-xl border border-amber-300 shadow-sm">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider block font-semibold">Jornada Activa:</span>
            <span className="text-3xl font-serif font-bold text-amber-700">DÍA {kpis.dayNumber}</span>
            <span className="text-slate-400 font-mono text-sm">/ {kpis.totalDays}</span>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs uppercase font-semibold">Participaciones Hoy</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{kpis.dailyContributions.toLocaleString()}</div>
          <div className="flex items-center gap-2 text-xs mt-2 text-slate-600">
            <span className="text-emerald-700 font-semibold">✓ {kpis.validContributions} válidas</span>
            <span>•</span>
            <span className="text-rose-600">✗ {kpis.invalidContributions} inválidas</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs uppercase font-semibold">Incorporadas a Novela</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{kpis.incorporatedContributions}</div>
          <div className="text-xs text-slate-500 mt-2">
            Total acumulado en {kpis.dayNumber} días transcurridos
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs uppercase font-semibold">Autores Únicos</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{kpis.uniqueAuthors.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-2">
            {kpis.authorsWith3Max} autores han alcanzado el límite (3/3)
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs uppercase font-semibold">Contradicciones</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{kpis.pendingContradictions}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-2">
            Continuidad limpia en la novela
          </div>
        </div>
      </div>

      {/* Author Distribution & Story Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" /> Distribución de Autores Oficiales
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-700 font-medium">Autores con 1 selección oficial</span>
              <span className="font-mono text-sm font-bold text-amber-800">{kpis.authorsWith1}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-700 font-medium">Autores con 2 selecciones oficiales</span>
              <span className="font-mono text-sm font-bold text-amber-800">{kpis.authorsWith2}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50 border border-amber-300">
              <span className="text-xs text-amber-900 font-semibold">Autores Límite Alcanzado (3/3)</span>
              <span className="font-mono text-sm font-bold text-amber-800">{kpis.authorsWith3Max}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" /> Salud Narrativa (Story Health)
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-700 font-medium">Misterios Activos Abiertos</span>
              <span className="font-mono text-sm font-bold text-sky-700">{kpis.openMysteries}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-700 font-medium">Semillas Narrativas en Desarrollo</span>
              <span className="font-mono text-sm font-bold text-amber-800">{kpis.activeSeeds}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-700 font-medium">Riesgo Narrativo Actual</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                BAJO
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-amber-600" /> Gestión Operativa del Día
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accede al panel de control para importar comentarios del día, ejecutar la regla determinista +3 y curar las selecciones oficiales.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/project/day/1"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <span>Ir a Jornada Diaria (Motor de Selección)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/editorial"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors border border-slate-200"
            >
              <span>Abrir Workbench Editorial (3 Columnas)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
