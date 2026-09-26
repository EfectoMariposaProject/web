'use client';

import { useState } from 'react';
import { Settings, Save, Cpu, Database, Check } from 'lucide-react';

export default function SettingsPage() {
  const [dailyWordMin, setDailyWordMin] = useState(69);
  const [dailyWordMax, setDailyWordMax] = useState(96);
  const [maxSelectedPerUser, setMaxSelectedPerUser] = useState(3);
  const [aiProvider, setAiProvider] = useState('Gemini');
  const [dbProvider] = useState('SQLite Local (Prisma)');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-800 text-xs font-mono font-bold mb-1">
            <span>CONFIGURACIÓN GLOBAL Y MOTOR</span>
            <span>•</span>
            <span>EFECTO MARIPOSA PROJECT</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            Ajustes del Sistema
          </h1>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-bold shadow-2xs">
            <Check className="w-4 h-4 text-emerald-700" /> Configuración Guardada
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Project Rules Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-600" /> Reglas del Proyecto (Margen de Palabras)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Palabras Mínimas por Comentario:
              </label>
              <input
                type="number"
                value={dailyWordMin}
                onChange={(e) => setDailyWordMin(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-bold outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Palabras Máximas por Comentario:
              </label>
              <input
                type="number"
                value={dailyWordMax}
                onChange={(e) => setDailyWordMax(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-bold outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Selecciones Máximas Incorporadas por Autor:
              </label>
              <input
                type="number"
                value={maxSelectedPerUser}
                onChange={(e) => setMaxSelectedPerUser(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-bold outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-600" /> Proveedor de Inteligencia Artificial (AIProvider)
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Proveedor Activo:</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value="Gemini">Google Gemini 1.5 Flash (Desacoplado)</option>
                <option value="OpenAI">OpenAI GPT-4o (Desacoplado)</option>
                <option value="Anthropic">Anthropic Claude 3.5 Sonnet (Desacoplado)</option>
                <option value="Mock">EMP Mock Narrative Engine (Offline Local)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database Persistence Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600" /> Persistencia de Datos
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Motor de Persistencia:</label>
              <input
                type="text"
                disabled
                value={dbProvider}
                className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-mono font-bold"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Fase 1 local activa mediante Prisma ORM SQLite (`prisma/dev.db`). Preparado para migración futura a Supabase PostgreSQL.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4" /> Guardar Ajustes del Sistema
          </button>
        </div>
      </form>
    </div>
  );
}
