'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Feather, Check, Sparkles, ShieldCheck, RefreshCw, BookOpen, Users, MapPin, 
  Sparkle, Eye, ChevronRight, FileText, Bookmark, ArrowRight, UserCheck, Shield,
  Layers, ChevronDown, ChevronUp, Copy, CheckCircle2
} from 'lucide-react';
import { MockAIProvider } from '@/lib/ai/mock-ai-provider';

interface CandidateSlot {
  id: string;
  slotNumber: number;
  globalCode: string;
  dailyCode: string;
  username: string;
  wordCount: number;
  originalText: string;
  aiSuggestion: string;
  is18Plus: boolean;
  status?: string;
  finalVersion?: string;
}

export default function EditorialWorkbenchPage() {
  const [candidateSlots, setCandidateSlots] = useState<CandidateSlot[]>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const currentSlot = candidateSlots[activeSlotIndex] || null;

  const [aiProposal, setAiProposal] = useState('');
  const [editorialVersion, setEditorialVersion] = useState('');
  const [essencePreserved, setEssencePreserved] = useState(true);
  const [editionType, setEditionType] = useState('Integración narrativa');
  const [openingText, setOpeningText] = useState('Hoy define qué miedo persigue al protagonista.');
  const [justification, setJustification] = useState('');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Toggle state for side panels and Bible drawer
  const [showBibleDrawer, setShowBibleDrawer] = useState(true);

  const fetchSelectedSlots = async () => {
    try {
      const res = await fetch('/api/selection?projectDayId=day-001');
      const data = await res.json();
      if (data.success && Array.isArray(data.results) && data.results.length > 0) {
        const slots: CandidateSlot[] = data.results.map((r: any) => {
          const contrib = r.selectedContribution;
          const author = contrib.author_handle || contrib.author_name || `usuario_${contrib.capture_sequence}`;
          return {
            id: contrib.id,
            slotNumber: r.slotRule.slot_number,
            globalCode: contrib.global_comment_code || `EMP-COM-${String(contrib.capture_sequence).padStart(6, '0')}`,
            dailyCode: contrib.daily_comment_code || `D01-C${String(contrib.capture_sequence).padStart(4, '0')}`,
            username: author.replace(/^@/, ''),
            wordCount: contrib.word_count,
            originalText: contrib.original_text,
            aiSuggestion: contrib.finalVersion || contrib.original_text,
            is18Plus: true,
            status: contrib.status,
            finalVersion: contrib.finalVersion,
          };
        });
        setCandidateSlots(slots);
        if (slots.length > 0) {
          const first = slots[activeSlotIndex] || slots[0];
          setAiProposal(first.aiSuggestion);
          setEditorialVersion(first.finalVersion || first.aiSuggestion);
          setIsApproved(first.status === 'PUBLISHED');
        }
      }
    } catch (err) {
      console.warn('Error al obtener slots en Editorial:', err);
    }
  };

  useEffect(() => {
    fetchSelectedSlots();
  }, []);

  const handleSelectSlot = (index: number) => {
    setActiveSlotIndex(index);
    const selected = candidateSlots[index];
    if (selected) {
      setAiProposal(selected.aiSuggestion);
      setEditorialVersion(selected.finalVersion || selected.aiSuggestion);
      setIsApproved(selected.status === 'PUBLISHED');
    }
  };

  const handleGenerateAI = async (styleInstruction?: string) => {
    if (!currentSlot) return;
    setIsGeneratingAI(true);
    try {
      const provider = new MockAIProvider();
      const prompt = styleInstruction
        ? `${currentSlot.originalText} (Instrucción de estilo: ${styleInstruction})`
        : currentSlot.originalText;
      const proposal = await provider.suggestEditorialIntegration(prompt);
      setAiProposal(proposal.proposedText);
      setEditorialVersion(proposal.proposedText);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApprove = async () => {
    if (!currentSlot) return;
    if (!essencePreserved) {
      alert('ATENCIÓN: Debe marcar "✓ Sí, Preservada" para cumplir la Regla Editorial de no alterar la esencia de la aportación.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/editorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contribution_id: currentSlot.id,
          ai_proposal_text: aiProposal,
          final_adapted_text: editorialVersion,
          essence_preserved: essencePreserved,
          edition_type: editionType,
          justification_note: justification,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar revisión editorial');

      setIsApproved(true);
      setSuccessToast(`¡Slot ${currentSlot.slotNumber} (@${currentSlot.username}) Aprobado e Incorporado Exitosamente al Manuscrito!`);
      await fetchSelectedSlots();
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (err: any) {
      alert(`Error al incorporar revisión: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-16 font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white p-4 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          <span className="text-xs font-bold font-mono">{successToast}</span>
        </div>
      )}

      {/* Header & Main Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-mono font-bold mb-1">
            <span className="bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded border border-blue-300">
              SALA DE ESCRITORES CLÁSICA
            </span>
            <span>•</span>
            <span>MESA EDITORIAL ERGONÓMICA DE 2 PANELES (60% / 40%)</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            Curaduría y Adaptación de Manuscrito
          </h1>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBibleDrawer(!showBibleDrawer)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              showBibleDrawer
                ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{showBibleDrawer ? 'Ocultar Biblia de Novela' : 'Ver Biblia de Novela'}</span>
          </button>

          <button
            onClick={() => handleGenerateAI()}
            disabled={isGeneratingAI || !currentSlot}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-900 font-bold text-xs border border-blue-300 transition-all shadow-2xs disabled:opacity-50"
          >
            {isGeneratingAI ? <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> : <Sparkles className="w-4 h-4 text-blue-600" />}
            <span>Regenerar IA</span>
          </button>

          <button
            onClick={handleApprove}
            disabled={!currentSlot || isSaving}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
              isApproved
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isApproved ? '✓ ¡Incorporado al Manuscrito!' : 'Aprobar e Incorporar'}</span>
          </button>
        </div>
      </div>

      {/* 4 Hard Rules Top Banner */}
      <div className="bg-blue-50/90 p-4 rounded-2xl border border-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
          <div className="text-xs text-blue-950 font-medium">
            <span className="font-bold text-blue-900">Regla Fundamental:</span> Preservación de Esencia 100% • Rango obligatorio: <strong>69 a 96 palabras</strong>.
          </div>
        </div>
        <div className="text-xs font-mono font-bold text-blue-900 bg-white px-3 py-1 rounded-lg border border-blue-200">
          ESTADO: JORNADA 001 ACTIVA
        </div>
      </div>

      {/* FIXED ERGONOMIC SLOT SELECTOR TABS BAR (NO OVERFLOW/CLIPPING) */}
      {candidateSlots.length > 0 && (
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-300 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" /> SELECCIONA EL SLOT A CURAR Y ADAPTAR:
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-bold">{candidateSlots.length} Slots Asignados por el Motor +3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {candidateSlots.map((s, idx) => {
              const isActive = activeSlotIndex === idx;
              const isSlotPublished = s.status === 'PUBLISHED';

              return (
                <button
                  key={s.globalCode}
                  onClick={() => handleSelectSlot(idx)}
                  className={`flex flex-col p-3.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-400/20'
                      : isSlotPublished
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-mono font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                      SLOT {s.slotNumber} ({s.dailyCode})
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : isSlotPublished
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isSlotPublished ? '✓ INCORPORADO' : 'PENDIENTE'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className={isActive ? 'text-blue-100 font-semibold' : 'text-slate-600 font-semibold'}>
                      @{s.username}
                    </span>
                    <span className={isActive ? 'text-blue-100 font-bold' : 'text-emerald-700 font-bold'}>
                      {s.wordCount} palabras
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State Banner if no slots loaded */}
      {candidateSlots.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl border-2 border-dashed border-blue-300 bg-white text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
            <Feather className="w-8 h-8 text-blue-600" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Workbench Editorial Limpio — Día 1</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hay slots seleccionados para curaduría aún. Ingresa a <strong>"Jornada Diaria"</strong> para extraer comentarios de TikTok y ejecutar el motor de slots.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/project/day/1"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ir a Jornada Diaria (Día 1)</span>
            </Link>
          </div>
        </div>
      ) : (
        /* DUAL PANEL FUNCTIONAL WORKSPACE LAYOUT (60% Left / 40% Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL (60% Width - 7 Cols): MANUSCRITO EN VIVO Y FLUKO NARRATIVO */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-300 bg-white shadow-md space-y-5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900">
                    Capítulo 1 • Ensamble Narrativo en Vivo (Día 001)
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                  FORMATO MANUSCRITO LITERARIO
                </span>
              </div>

              {/* Book Page Canvas Layout */}
              <div className="bg-[#fcfbf9] border border-amber-200/60 p-8 rounded-2xl shadow-inner font-serif space-y-6 min-h-[480px]">
                <div className="border-b border-amber-200/40 pb-3 text-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-900/60">
                    --- CAPÍTULO PRIMERO: EL INICIO DEL RETO ---
                  </span>
                </div>

                {/* Apertura del Día */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold tracking-wider">
                    PARÁGRAFO DE APERTURA OFICIAL (DÍA 001):
                  </span>
                  <p className="text-slate-800 text-sm leading-relaxed italic bg-amber-50/50 p-4 rounded-xl border border-amber-200/70">
                    "{openingText}"
                  </p>
                </div>

                {/* Slots Integrados en Vivo en la Historia */}
                <div className="space-y-4 pt-2 font-sans">
                  {candidateSlots.map((slot, idx) => {
                    const isSelectedSlot = activeSlotIndex === idx;
                    const slotText = isSelectedSlot ? (editorialVersion || slot.aiSuggestion) : slot.aiSuggestion;

                    return (
                      <div
                        key={slot.globalCode}
                        onClick={() => handleSelectSlot(idx)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          isSelectedSlot
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/20'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/80 shadow-2xs'
                        }`}
                      >
                        {/* Slot Badge Header */}
                        <div className="flex justify-between items-center mb-2 font-mono text-xs">
                          <span className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${
                            isSelectedSlot ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                          }`}>
                            SLOT {slot.slotNumber} ({slot.dailyCode})
                          </span>
                          <span className="text-slate-500 font-semibold text-[11px]">
                            Autor: <strong>@{slot.username}</strong> ({slot.wordCount} palabras)
                          </span>
                        </div>

                        {/* Text in Manuscript */}
                        <p className="font-serif text-sm leading-relaxed text-slate-900">
                          {slotText}
                        </p>

                        {isSelectedSlot && (
                          <div className="mt-2 text-[10px] font-mono font-bold text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Editando en vivo en la Estación Editorial →</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLLAPSIBLE BIBLIA DE LA NOVELA DRAWER */}
            {showBibleDrawer && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold uppercase text-blue-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" /> Biblia de la Novela & Contexto Narrativo
                  </span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                    ENTIDADES ACTIVAS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personajes */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block font-mono uppercase">
                      👤 Personajes en Escena:
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-900">Laura Méndez</strong>
                          <span className="text-[9px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-mono font-bold">PROTAGONISTA</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">28 años. Regresa a la casona a resolver el misterio de su abuelo.</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-900">Don Héctor Méndez</strong>
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">AUSENTE</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">Abuelo extinto. Guardaba el cuaderno de tapas de cuero.</p>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación & Objetos */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block font-mono uppercase flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Ubicación & Objeto Clave:
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <strong className="text-slate-900 block">• Casona de Coyoacán (Recibidor)</strong>
                        <p className="text-[11px] text-slate-600">• Ambientes góticos, penumbra del atardecer.</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <strong className="text-slate-900 block">• Objetos Clave:</strong>
                        <p className="text-[11px] text-slate-600">Llave negra de latón / Cuaderno con iniciales H.M.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL (40% Width - 5 Cols): ESTACIÓN DE CURADURÍA Y ADAPTACIÓN IA */}
          <div className="lg:col-span-5 space-y-6 sticky top-6">
            {currentSlot ? (
              <>
                {/* CARD 1: COMENTARIO ORIGINAL DE TIKTOK (READ ONLY) */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-300 bg-white shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-mono font-bold uppercase text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" /> 1. COMENTARIO ORIGINAL TIKTOK
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold border border-slate-200">
                      INMUTABLE
                    </span>
                  </div>

                  {/* Author Header Badges */}
                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                          @{currentSlot.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block font-mono">@{currentSlot.username}</span>
                          <span className="text-[10px] text-slate-600 font-mono font-medium">{currentSlot.dailyCode}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-lg shadow-2xs">
                        ✓ {currentSlot.wordCount} PALABRAS
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 pt-2 border-t border-blue-200/60">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-blue-900">{currentSlot.globalCode}</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-600" /> SHA-256 Verificado
                      </span>
                    </div>
                  </div>

                  {/* Original Text Quote */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed shadow-2xs">
                    "{currentSlot.originalText}"
                  </div>
                </div>

                {/* CARD 2: ADAPTADOR NARRATIVO ASISTIDO POR IA */}
                <div className="glass-panel p-5 rounded-2xl border border-blue-300 bg-blue-50/40 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-blue-200/80 pb-3">
                    <span className="text-xs font-mono font-bold uppercase text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" /> 2. ADAPTADOR NARRATIVO IA
                    </span>
                    <button
                      onClick={() => setEditorialVersion(aiProposal)}
                      className="text-xs text-blue-700 hover:text-blue-900 underline font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copiar propuesta →
                    </button>
                  </div>

                  {/* Propuesta IA Box */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-600 uppercase block">Propuesta Sugerida por IA:</span>
                    <div className="bg-white p-3.5 rounded-xl border border-blue-200 font-serif text-xs text-slate-800 leading-relaxed shadow-2xs">
                      "{aiProposal}"
                    </div>
                  </div>

                  {/* Versión Editorial Final (Editable) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase block">
                        Versión Editorial Final (Editable):
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold border border-emerald-300">
                        ACTUALIZA MANUSCRITO
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={editorialVersion}
                      onChange={(e) => setEditorialVersion(e.target.value)}
                      placeholder="Escribe o ajusta la adaptación final del párrafo..."
                      className="w-full bg-white border border-emerald-400 rounded-xl p-3 font-serif text-xs text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none leading-relaxed shadow-2xs font-medium"
                    />
                  </div>

                  {/* Style Tuning Pills */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold text-blue-900 uppercase block">Ajustes Rápidos de Estilo:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleGenerateAI('Enriquecer atmósfera gótica e iluminación')}
                        className="text-[11px] bg-white hover:bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 font-medium transition-all shadow-2xs"
                      >
                        ✨ Atmósfera
                      </button>
                      <button
                        onClick={() => handleGenerateAI('Ajustar a tercera persona omnisciente')}
                        className="text-[11px] bg-white hover:bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 font-medium transition-all shadow-2xs"
                      >
                        📝 Sintaxis
                      </button>
                      <button
                        onClick={() => handleGenerateAI('Aumentar tensión dramática')}
                        className="text-[11px] bg-white hover:bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 font-medium transition-all shadow-2xs"
                      >
                        🔥 Tensión
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 3: BARRA DE VALIDACIÓN Y APROBACIÓN */}
                <div className="glass-panel p-5 rounded-2xl border border-emerald-300 bg-emerald-50/40 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-emerald-200/80 pb-3">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> 3. VALIDACIÓN Y APROBACIÓN
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-mono font-bold">
                      PUBLICACIÓN
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Essence Toggle */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">¿ESENCIA PRESERVADA AL 100%?:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEssencePreserved(true)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                            essencePreserved
                              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                              : 'bg-white text-slate-700 border border-slate-300'
                          }`}
                        >
                          ✓ Sí, Preservada
                        </button>
                        <button
                          type="button"
                          onClick={() => setEssencePreserved(false)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                            !essencePreserved
                              ? 'bg-rose-600 text-white shadow-rose-600/20'
                              : 'bg-white text-slate-700 border border-slate-300'
                          }`}
                        >
                          ✗ No
                        </button>
                      </div>
                    </div>

                    {/* Edition Type */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">Tipo de Edición Aplicada:</label>
                      <select
                        value={editionType}
                        onChange={(e) => setEditionType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-emerald-500 shadow-2xs font-medium"
                      >
                        <option>Integración narrativa</option>
                        <option>Ortografía y Puntuación</option>
                        <option>Sintaxis y Tiempo verbal</option>
                        <option>Claridad de lectura</option>
                      </select>
                    </div>

                    {/* Justification Note */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">Nota o Justificación Editorial:</label>
                      <textarea
                        rows={2}
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="Escribe una breve nota justificando la adaptación..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-emerald-500 shadow-2xs font-medium"
                      />
                    </div>

                    {/* Big Action Button */}
                    <button
                      onClick={handleApprove}
                      disabled={isSaving}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                        isApproved
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isApproved ? '✓ ¡Slot Incorporado al Manuscrito!' : 'Aprobar e Incorporar al Manuscrito'}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-slate-200 bg-white text-center space-y-3">
                <Feather className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Selecciona un slot arriba para comenzar la curaduría.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
