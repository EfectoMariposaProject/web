'use client';

import { useState } from 'react';
import { Award, Download } from 'lucide-react';

export default function RecordAttemptPage() {
  const [attemptData] = useState({
    totalIncorporated: 0,
    totalUniqueAuthors: 0,
    totalActiveDays: 1,
    firstContributionDate: '-',
    lastContributionDate: '-',
    evidenceItems: 0,
    hashesVerified: 0,
    substitutionsLogCount: 0,
  });

  const handleExportEvidencePackage = () => {
    const report = `# GUINNESS WORLD RECORDS ATTEMPT AUDIT REPORT
Project: Efecto Mariposa Project
Total Incorporated Contributions: ${attemptData.totalIncorporated}
Total Distinct Authors: ${attemptData.totalUniqueAuthors}
Total Active Days: ${attemptData.totalActiveDays}
First Contribution Date: ${attemptData.firstContributionDate}
Last Contribution Date: ${attemptData.lastContributionDate}
SHA-256 Hashes Verified: ${attemptData.hashesVerified}/${attemptData.totalIncorporated}
    `;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Guinness_World_Record_Evidence_Report.md';
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-800 text-xs font-mono font-bold mb-1">
            <span>DASHBOARD DE EVIDENCIA PARA INTENTO DE RÉCORD</span>
            <span>•</span>
            <span>RECORD ATTEMPT AUDIT</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            Guinness World Record Audit
          </h1>
        </div>

        <button
          onClick={handleExportEvidencePackage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <Download className="w-4 h-4" /> Exportar Reporte Completo de Evidencias (.md)
        </button>
      </div>

      {/* Hero Record Card */}
      <div className="glass-panel p-8 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-1.5 w-fit">
              <Award className="w-4 h-4 text-amber-700" /> AUDITORÍA OFICIAL
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Récord Mundial de Novela Colaborativa en 365 Días
            </h2>
            <p className="text-xs text-slate-600 font-medium max-w-xl">
              Trazabilidad e inmutabilidad garantizada mediante hashes SHA-256 y registro de sustituciones auditable.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-amber-300 font-mono text-center shrink-0 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Contribuciones Aprobadas</span>
            <span className="text-4xl font-bold text-amber-800">{attemptData.totalIncorporated}</span>
            <span className="text-xs text-emerald-800 font-bold block mt-1">✓ {attemptData.hashesVerified} Hashes Verificados</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-xs text-slate-600 font-bold uppercase">Autores Distintos</span>
          <div className="text-3xl font-bold text-slate-900 font-mono">{attemptData.totalUniqueAuthors}</div>
          <p className="text-[11px] text-slate-600 font-medium">Autores únicos con contribución oficial</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-xs text-slate-600 font-bold uppercase">Días Activos Cumplidos</span>
          <div className="text-3xl font-bold text-amber-800 font-mono">{attemptData.totalActiveDays}</div>
          <p className="text-[11px] text-slate-600 font-medium">Jornadas oficiales procesadas</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-xs text-slate-600 font-bold uppercase">Hashes SHA-256 Verificados</span>
          <div className="text-3xl font-bold text-emerald-800 font-mono">{attemptData.hashesVerified}</div>
          <p className="text-[11px] text-emerald-800 font-bold">Inmutabilidad criptográfica 100%</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-xs text-slate-600 font-bold uppercase">Sustituciones Auditable (+3)</span>
          <div className="text-3xl font-bold text-sky-800 font-mono">{attemptData.substitutionsLogCount}</div>
          <p className="text-[11px] text-slate-600 font-medium">Saltos +3 registrados con justificación</p>
        </div>
      </div>
    </div>
  );
}
