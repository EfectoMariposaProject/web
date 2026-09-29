'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  FileCode,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Printer,
  Search,
  Calendar,
  Users,
  FileText,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useEmpCache } from '@/lib/cache/CacheProvider';

export default function ManuscriptPage() {
  const { fetchWithCache } = useEmpCache();
  const [projectData, setProjectData] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalDays: 0,
    totalContributions: 0,
    totalWords: 0,
    estimatedPages: 0,
    uniqueAuthorsCount: 0,
    guinnessStatus: 'CERTIFICADO CON SELLO SHA-256 INMUTABLE',
  });
  const [isLoading, setIsLoading] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<'full' | 'single'>('full');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchManuscript = async () => {
    try {
      const data = await fetchWithCache('/api/manuscript');

      if (data.success) {
        setProjectData(data.project);
        setStats(data.stats);
        setChapters(data.chapters || []);
      }
    } catch (err) {
      console.warn('Error al cargar manuscrito oficial:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManuscript();
  }, [fetchWithCache]);


  // Filtering chapters based on search query or selected day
  const filteredChapters = chapters.filter((ch) => {
    if (viewMode === 'single' && ch.day !== selectedDayNumber) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchesTitle = ch.title.toLowerCase().includes(query);
    const matchesOpening = ch.openingText.toLowerCase().includes(query);
    const matchesContrib = ch.contributions.some(
      (c: any) =>
        c.text.toLowerCase().includes(query) ||
        c.author.toLowerCase().includes(query) ||
        c.globalCode.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
    );

    return matchesTitle || matchesOpening || matchesContrib;
  });

  const handleExportMarkdown = () => {
    let md = `# ${projectData?.name || 'LA HABITACIÓN QUE NO EXISTÍA'}\n`;
    md += `*Novela Colaborativa en 365 Días • Efecto Mariposa Project*\n`;
    md += `*Certificado con Sellos Criptográficos SHA-256 Inmutables*\n\n`;
    md += `---\n\n`;

    chapters.forEach((ch: any) => {
      md += `## Día ${ch.day} — ${ch.title}\n`;
      md += `*Fecha: ${ch.date}*\n\n`;
      if (ch.openingText) {
        md += `> ${ch.openingText}\n\n`;
      }
      ch.contributions.forEach((c: any) => {
        md += `> "${c.text}"\n`;
        md += `> — **Sello Auténtico ${c.globalCode}** | *${c.id} por ${c.author}*\n\n`;
      });
      md += `---\n\n`;
    });

    md += `\n*Manuscrito compilado el ${new Date().toLocaleDateString('es-ES')} via EMP Story Engine*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manuscrito_La_Habitacion_Que_No_Existia_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(
      {
        project: projectData,
        stats,
        exported_at: new Date().toISOString(),
        chapters,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manuscrito_Oficial_EMP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-16">
      {/* Header Superior y Botones de Exportación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-mono font-bold mb-1">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>LIBRO MAESTRO COMPILADO EN TIEMPO REAL</span>
            <span>•</span>
            <span className="text-emerald-700">{stats.guinnessStatus}</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            {projectData?.name || 'La Habitación que no Existía'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Edición oficial de la novela colaborativa. Recopila automáticamente los textos narrativos y los comentarios de 100 a 150 palabras seleccionados e inscritos con sellos de autenticidad SHA-256.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Print / PDF
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-blue-400" /> Markdown (.md)
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            <FileCode className="w-4 h-4" /> JSON (.json)
          </button>
        </div>
      </div>

      {/* Bar de Estadísticas Generales del Manuscrito */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Palabras</div>
            <div className="text-xl font-mono font-extrabold text-slate-900">{stats.totalWords.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Páginas Impresas</div>
            <div className="text-xl font-mono font-extrabold text-emerald-700">~{stats.estimatedPages} págs</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Sellos Criptográficos</div>
            <div className="text-xl font-mono font-extrabold text-purple-800">{stats.totalContributions} sellos</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Autores Colectivos</div>
            <div className="text-xl font-mono font-extrabold text-amber-900">{stats.uniqueAuthorsCount} autores</div>
          </div>
        </div>
      </div>

      {/* Bar de Controles: Selector de Vista, Navegación de Día y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        {/* Modos de Vista */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('full')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              viewMode === 'full'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Libro Completo ({chapters.length} Días)</span>
          </button>

          <button
            onClick={() => setViewMode('single')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              viewMode === 'single'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Por Capítulo (Día a Día)</span>
          </button>
        </div>

        {/* Selector de Día si se activa modo Single */}
        {viewMode === 'single' && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled={selectedDayNumber <= 1}
              onClick={() => setSelectedDayNumber((prev) => Math.max(1, prev - 1))}
              className="p-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-30 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedDayNumber}
              onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono text-slate-800 bg-white"
            >
              {chapters.map((ch) => (
                <option key={ch.day} value={ch.day}>
                  Día {ch.day}: {ch.title}
                </option>
              ))}
            </select>

            <button
              disabled={selectedDayNumber >= chapters.length}
              onClick={() => setSelectedDayNumber((prev) => Math.min(chapters.length, prev + 1))}
              className="p-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-30 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Buscador en el Manuscrito */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en el manuscrito..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Contenedor del Libro Manuscrito (Estilo Publicación Impresa) */}
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-12 print:shadow-none print:border-none print:p-0">
        {isLoading ? (
          <div className="text-center py-16 space-y-3 font-mono text-xs text-slate-600">
            <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p>Compilando novela y verificando hashes SHA-256 en la base de datos...</p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No se encontraron fragmentos en esta vista</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Intenta cambiar los términos de búsqueda o cambiar a la vista de Libro Completo.
            </p>
          </div>
        ) : (
          filteredChapters.map((ch: any) => (
            <article key={ch.day} className="space-y-8 max-w-3xl mx-auto border-b border-slate-200 pb-12 last:border-b-0">
              {/* Encabezado del Capítulo */}
              <div className="text-center space-y-2 border-b border-blue-100 pb-6">
                <span className="text-xs font-mono font-bold text-blue-900 tracking-widest uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
                  JORNADA OFICIAL • DÍA {ch.day} (SEMANA {ch.weekNumber})
                </span>
                <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight leading-snug">
                  {ch.title}
                </h2>
                <div className="text-xs text-slate-400 font-mono font-medium flex items-center justify-center gap-3">
                  <span>{ch.date}</span>
                  <span>•</span>
                  <span>{ch.chapterWordCount} Palabras en este Capítulo</span>
                </div>
              </div>

              {/* Texto de Apertura Narrativo (Opening Text del Día) */}
              {ch.openingText && (
                <div className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 font-serif text-slate-900 text-lg leading-relaxed text-justify italic font-medium shadow-inner">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-widest not-italic">
                    📖 NARRACIÓN BASE DEL DÍA:
                  </span>
                  <p className="indent-6">{ch.openingText}</p>
                </div>
              )}

              {/* Bloques de Contribuciones Colectivas Seleccionadas */}
              {ch.contributions && ch.contributions.length > 0 && (
                <div className="space-y-6 pt-2">
                  <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CONTRIBUCIONES INCORPORADAS DE LA AUDIENCIA (SELLOS SHA-256):</span>
                  </div>

                  {ch.contributions.map((contrib: any) => (
                    <div
                      key={contrib.id}
                      className="relative p-6 rounded-2xl bg-amber-50/50 border border-amber-200/90 hover:border-blue-400 transition-all shadow-2xs space-y-4 font-serif"
                    >
                      {/* Texto de la Contribución */}
                      <p className="text-slate-900 leading-relaxed text-base md:text-lg font-medium indent-6">
                        "{contrib.text}"
                      </p>

                      {/* Footer con Sello Criptográfico de Autenticidad */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono pt-3 border-t border-amber-200/70">
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Sello Auténtico {contrib.globalCode}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-[11px]">
                            {contrib.wordCount} palabras
                          </span>
                          <span className="text-blue-950 bg-blue-100 px-3 py-1 rounded-md border border-blue-300 font-bold">
                            {contrib.id} • {contrib.author}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

