'use client';

import { useState, useEffect, useMemo } from 'react';
import { CSVImporter } from '@/core/import/csv-importer';
import { SelectionService, SelectionSlotResult } from '@/core/selection/selection-service';
import { Contribution, Participant, SocialPost } from '@/types/domain.types';
import { SocialPostStatus, ContributionStatus } from '@/types/enums';
import { 
  Sparkles, Upload, Play, CheckCircle2, AlertCircle, Hash, Feather, RefreshCw, 
  Lock, ShieldCheck, Clock, Search, Filter, Star, Award, Check, X, User,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, Target, Grid as GridIcon, Table as TableIcon,
  FileSpreadsheet, MousePointerClick, Download
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEmpCache } from '@/lib/cache/CacheProvider';
import { TikTokBackgroundJobWidget, ImportJobState } from '@/components/tiktok/TikTokBackgroundJobWidget';

export default function DailyProjectPage() {
  const params = useParams();
  const router = useRouter();
  const dayParam = params?.id ? Number(params.id) : 1;
  const challengeDay = isNaN(dayParam) || dayParam < 1 ? 1 : Math.min(dayParam, 80);
  const projectDayId = `day-${String(challengeDay).padStart(3, '0')}`;
  const weekNumber = Math.ceil(challengeDay / 5);
  const dayLabel = `DÍA ${String(challengeDay).padStart(2, '0')} — SEMANA ${weekNumber}`;

  const { fetchWithCache, invalidateDay, markDayClosed, isDayClosed } = useEmpCache();

  const [target1, setTarget1] = useState(15);
  const [target2, setTarget2] = useState(38);
  const [target3, setTarget3] = useState(72);

  const [postStatus, setPostStatus] = useState<SocialPostStatus>(() =>
    isDayClosed(projectDayId) ? SocialPostStatus.CERRADO : SocialPostStatus.ABIERTO
  );
  const [narrativeLine] = useState('Hoy define qué miedo persigue al protagonista.');

  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isFetchingTikTok, setIsFetchingTikTok] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);


  // Initialized empty for current day simulation
  const [csvInput, setCsvInput] = useState<string>('');

  const [slotResults, setSlotResults] = useState<SelectionSlotResult[] | null>(null);
  const [allContributions, setAllContributions] = useState<Contribution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Filter, Search, and View Mode states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TARGETS' | 'SELECTED' | 'VALID' | 'INVALID'>('ALL');
  const [viewMode, setViewMode] = useState<'EXCEL' | 'GRID'>('EXCEL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  const postId = `EMP-POST-${String(challengeDay).padStart(4, '0')}`;

  const activePost: SocialPost = {
    id: postId,
    project_day_id: projectDayId,
    challenge_day: challengeDay,
    platform: 'TIKTOK' as any,
    narrative_line: narrativeLine,
    status: postStatus,
    opens_at: new Date().toISOString(),
    closes_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  // Map of initial target sequence numbers -> Slot Number (e.g. 15 -> Slot 1, 38 -> Slot 2, 72 -> Slot 3)
  const initialTargetsMap = useMemo(() => {
    const map = new Map<number, number>();
    if (target1 > 0) map.set(target1, 1);
    if (target2 > 0) map.set(target2, 2);
    if (target3 > 0) map.set(target3, 3);
    return map;
  }, [target1, target2, target3]);

  // Custom Notification Modal State
  const [customNotification, setCustomNotification] = useState<{
    isOpen: boolean;
    type: 'SUCCESS' | 'ERROR' | 'INFO';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'SUCCESS',
    title: '',
    message: '',
  });

  // Double Confirmation Overwrite Modal State
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [overwriteConfirmationInput, setOverwriteConfirmationInput] = useState('');

  const showCustomNotification = (type: 'SUCCESS' | 'ERROR' | 'INFO', title: string, message: string) => {
    setCustomNotification({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const handleFetchTikTokComments = () => {
    if (!tiktokUrl) {
      showCustomNotification('ERROR', 'URL Requerida', 'Por favor ingresa una URL válida de video de TikTok.');
      return;
    }

    // Protection check: If data has already been fetched for this day, require double confirmation to avoid accidental overwrites
    if (allContributions.length > 0) {
      setOverwriteConfirmationInput('');
      setShowOverwriteModal(true);
      return;
    }

    executeTikTokFetch();
  };

  const executeTikTokFetch = async () => {
    setShowOverwriteModal(false);
    setIsFetchingTikTok(true);
    try {
      const res = await fetch('/api/tiktok/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: tiktokUrl, project_day_id: projectDayId, dayNumber: challengeDay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al programar la descarga de comentarios');

      if (data.job?.id) {
        setActiveJobId(data.job.id);
        showCustomNotification(
          'INFO',
          'Extracción en Segundo Plano Iniciada',
          'La descarga y archivado de comentarios se está procesando en el servidor. Puedes cambiar de página sin interrumpir el proceso.'
        );
      }
    } catch (err: any) {
      showCustomNotification('ERROR', 'Error al Iniciar Extracción', err.message);
    } finally {
      setIsFetchingTikTok(false);
    }
  };

  const handleJobCompleted = async (completedJob: ImportJobState) => {
    invalidateDay(projectDayId);
    try {
      const res = await fetch(`/api/contributions?projectDayId=${projectDayId}&_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.contributions) && data.contributions.length > 0) {
        const fetchedContribs: Contribution[] = data.contributions;
        const fetchedParticipants: Participant[] = data.participants || [];

        const contributionsMap = new Map<number, Contribution>();
        const participantsMap = new Map<string, Participant>();

        fetchedParticipants.forEach((p) => participantsMap.set(p.id, p));
        fetchedContribs.forEach((c) => {
          contributionsMap.set(c.capture_sequence, c);
        });

        const selectionService = new SelectionService();
        const total = fetchedContribs.length;

        const res1 = selectionService.resolveSlotSelection(1, target1, contributionsMap, participantsMap, projectDayId, total);
        const res2 = selectionService.resolveSlotSelection(2, target2, contributionsMap, participantsMap, projectDayId, total);
        const res3 = selectionService.resolveSlotSelection(3, target3, contributionsMap, participantsMap, projectDayId, total);

        setSlotResults([res1, res2, res3]);
        setAllContributions(fetchedContribs);
        setSearchQuery('');
        setCurrentPage(1);

        showCustomNotification(
          'SUCCESS',
          '¡Descarga en Segundo Plano Finalizada!',
          `Se procesaron y archivaron exitosamente ${completedJob.totalSaved} comentarios de TikTok para la jornada (${dayLabel}).`
        );
      }
    } catch (err: any) {
      console.warn('Error al recargar contribuciones tras completar job:', err);
    }
  };


  const handleDownloadExcelCSV = () => {
    if (allContributions.length === 0) {
      showCustomNotification('INFO', 'Sin Registro de Comentarios', 'No hay comentarios cargados para exportar a CSV.');
      return;
    }

    const headers = ['secuencia', 'author', 'username', 'text', 'likes', 'replies', 'created_at', 'language', 'Valido', 'id_diario', 'id_global'];

    const rows = allContributions.map((c) => {
      const isValid = c.validation_status === 'VALID' ? 'Si' : 'No';
      const authorName = c.author_name || c.author_handle || 'N/A';
      const username = c.author_handle || c.participant_id || 'N/A';
      const text = (c.original_text || '').replace(/"/g, '""');
      const likes = c.likes ?? 0;
      const replies = c.replies ?? 0;
      const createdAt = c.received_at ? c.received_at.slice(0, 19).replace('T', ' ') : 'N/A';
      const lang = c.language || 'es';
      const dailyCode = c.daily_comment_code || `D${String(challengeDay).padStart(2, "0")}-C${String(c.capture_sequence).padStart(4, "0")}`;
      const globalCode = c.global_comment_code || 'N/A';

      return [
        c.capture_sequence,
        `"${authorName.replace(/"/g, '""')}"`,
        `"${username.replace(/"/g, '""')}"`,
        `"${text}"`,
        likes,
        replies,
        `"${createdAt}"`,
        `"${lang}"`,
        `"${isValid}"`,
        `"${dailyCode}"`,
        `"${globalCode}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `comentarios_tiktok_${projectDayId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteEngine = async () => {
    setIsExecuting(true);
    try {
      const selectionService = new SelectionService();
      const dayNumber = challengeDay;

      const contributionsMap = new Map<number, Contribution>();
      const participantsMap = new Map<string, Participant>();

      if (csvInput.trim()) {
        const csvImporter = new CSVImporter();
        const rawComments = csvImporter.parseCSVString(csvInput);
        if (rawComments.length > 0) {
          const batch = await csvImporter.importComments(rawComments, projectDayId, dayNumber, weekNumber, challengeDay, activePost);
          
          await fetch('/api/contributions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_day_id: projectDayId,
              contributions: batch.contributions,
              participants: batch.participants,
            }),
          });

          batch.participants.forEach((p) => participantsMap.set(p.id, p));
          batch.contributions.forEach((c) => contributionsMap.set(c.capture_sequence, c));
          setAllContributions(Array.from(contributionsMap.values()));
          invalidateDay(projectDayId);
        }
      } else if (allContributions.length > 0) {
        allContributions.forEach((c) => {
          contributionsMap.set(c.capture_sequence, c);
        });
      } else {
        const data = await fetchWithCache(`/api/contributions?projectDayId=${projectDayId}`);
        if (data.success && Array.isArray(data.contributions) && data.contributions.length > 0) {
          const fetchedContribs: Contribution[] = data.contributions;
          setAllContributions(fetchedContribs);
          fetchedContribs.forEach((c) => contributionsMap.set(c.capture_sequence, c));
        } else {
          showCustomNotification(
            'INFO',
            'Sin Comentarios Registrados',
            'Por favor haz clic en "Extraer Comentarios de TikTok" o pega el contenido CSV para iniciar la ingesta del día.'
          );
          setIsExecuting(false);
          return;
        }
      }

      const totalItems = contributionsMap.size;
      const res1 = selectionService.resolveSlotSelection(1, target1, contributionsMap, participantsMap, projectDayId, totalItems);
      const res2 = selectionService.resolveSlotSelection(2, target2, contributionsMap, participantsMap, projectDayId, totalItems);
      const res3 = selectionService.resolveSlotSelection(3, target3, contributionsMap, participantsMap, projectDayId, totalItems);

      const results = [res1, res2, res3];
      setSlotResults(results);
      setSearchQuery('');
      setCurrentPage(1);
      invalidateDay(projectDayId);

      showCustomNotification(
        'SUCCESS',
        '¡Motor +3 Ejecutado con Éxito!',
        `Se han procesado los 3 Slots objetivo (#${target1}, #${target2}, #${target3}) sobre ${totalItems} participaciones capturadas.`
      );
    } catch (err: any) {
      showCustomNotification('ERROR', 'Error en Ejecución de Motor', err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleManualSlotSelection = (slotNumber: number, contribution: Contribution) => {
    const targetSeq = slotNumber === 1 ? target1 : slotNumber === 2 ? target2 : target3;
    const currentResults = slotResults ? [...slotResults] : [];

    const newResult: SelectionSlotResult = {
      slotRule: {
        id: `rule-slot-${slotNumber}`,
        project_day_id: projectDayId,
        slot_number: slotNumber,
        target_sequence: targetSeq,
        selected_contribution_id: contribution.id,
        replacement_applied: contribution.capture_sequence !== targetSeq,
        replacement_reason: `Selección manual del editor para Slot ${slotNumber}`,
        created_at: new Date().toISOString(),
      },
      selectedContribution: {
        ...contribution,
        status: ContributionStatus.SELECTED,
        selected_by_rule: true,
      },
      replacementApplied: contribution.capture_sequence !== targetSeq,
      replacementChain: [
        {
          id: `audit-manual-slot${slotNumber}`,
          project_day_id: projectDayId,
          selection_slot: slotNumber,
          initial_target: targetSeq,
          candidate_sequence: contribution.capture_sequence,
          contribution_id: contribution.id,
          valid: true,
          reason: `Asignación manual directa del editor desde la tabla Excel (Secuencia #${contribution.capture_sequence})`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    if (currentResults.length >= slotNumber) {
      currentResults[slotNumber - 1] = newResult;
    } else {
      currentResults.push(newResult);
    }

    setSlotResults(currentResults);
    invalidateDay(projectDayId);

    showCustomNotification(
      'SUCCESS',
      '¡Asignación Guardada!',
      `El comentario #${contribution.capture_sequence} (@${contribution.author_handle || 'usuario'}) ha sido seleccionado manualmente para el Slot ${slotNumber}.`
    );
  };

  useEffect(() => {
    let isCancelled = false;

    const loadSavedContributions = async () => {
      try {
        const data = await fetchWithCache(`/api/contributions?projectDayId=${projectDayId}`);
        if (isCancelled) return;

        if (data.success && Array.isArray(data.contributions) && data.contributions.length > 0) {
          const fetchedContribs: Contribution[] = data.contributions;
          setAllContributions(fetchedContribs);
          const contributionsMap = new Map<number, Contribution>();
          const participantsMap = new Map<string, Participant>();
          fetchedContribs.forEach((c) => contributionsMap.set(c.capture_sequence, c));
          const selectionService = new SelectionService();
          const totalItems = fetchedContribs.length;
          const res1 = selectionService.resolveSlotSelection(1, target1, contributionsMap, participantsMap, projectDayId, totalItems);
          const res2 = selectionService.resolveSlotSelection(2, target2, contributionsMap, participantsMap, projectDayId, totalItems);
          const res3 = selectionService.resolveSlotSelection(3, target3, contributionsMap, participantsMap, projectDayId, totalItems);
          setSlotResults([res1, res2, res3]);
        } else {
          setAllContributions([]);
          setSlotResults(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setAllContributions([]);
          setSlotResults(null);
        }
      }
    };

    loadSavedContributions();

    return () => {
      isCancelled = true;
    };
  }, [target1, target2, target3, projectDayId, fetchWithCache]);


  const selectedSlotsMap = useMemo(() => {
    const map = new Map<number, { slotNumber: number; replacementApplied: boolean; originalTarget: number }>();
    if (slotResults) {
      slotResults.forEach((res, idx) => {
        const seq = res.selectedContribution.capture_sequence;
        map.set(seq, {
          slotNumber: idx + 1,
          replacementApplied: res.replacementApplied,
          originalTarget: res.slotRule.target_sequence,
        });
      });
    }
    return map;
  }, [slotResults]);

  const filteredContributions = useMemo(() => {
    const list = allContributions.filter((c: Contribution) => {
      const query = searchQuery.toLowerCase().trim();
      const authorName = (c.author_name || '').toLowerCase();
      const authorHandle = (c.author_handle || '').toLowerCase();
      const participantId = (c.participant_id || '').toLowerCase();

      const matchSearch =
        !query ||
        authorName.includes(query) ||
        authorHandle.includes(query) ||
        participantId.includes(query) ||
        (c.daily_comment_code && c.daily_comment_code.toLowerCase().includes(query)) ||
        (c.global_comment_code && c.global_comment_code.toLowerCase().includes(query)) ||
        c.original_text.toLowerCase().includes(query) ||
        String(c.capture_sequence) === query;

      if (!matchSearch) return false;

      const isSelected = selectedSlotsMap.has(c.capture_sequence);
      const isTarget = initialTargetsMap.has(c.capture_sequence);
      const isValid = c.validation_status === 'VALID';

      if (activeFilter === 'TARGETS') return isTarget;
      if (activeFilter === 'SELECTED') return isSelected;
      if (activeFilter === 'VALID') return isValid;
      if (activeFilter === 'INVALID') return !isValid;
      return true;
    });

    // Ensure strict ASCENDING chronological ordering (del más antiguo al más reciente por fecha/secuencia)
    return list.sort((a: Contribution, b: Contribution) => {
      const timeA = a.received_at ? new Date(a.received_at).getTime() : a.capture_sequence;
      const timeB = b.received_at ? new Date(b.received_at).getTime() : b.capture_sequence;
      return timeA - timeB || a.capture_sequence - b.capture_sequence;
    });
  }, [allContributions, searchQuery, activeFilter, selectedSlotsMap, initialTargetsMap]);

  const totalPages = Math.ceil(filteredContributions.length / itemsPerPage) || 1;
  const paginatedContributions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContributions.slice(start, start + itemsPerPage);
  }, [filteredContributions, currentPage, itemsPerPage]);

  const validCount = allContributions.filter((c) => c.validation_status === 'VALID').length;
  const invalidCount = allContributions.length - validCount;

  return (
    <div className="space-y-8 font-sans">
      {/* 4 Hard Rules Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-blue-300 bg-blue-50/50 flex items-center gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-blue-900 block">REGLA 1: +18 AÑOS</span>
            <span className="text-[10px] text-slate-600 font-medium">Declaración de mayoría de edad</span>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-blue-300 bg-blue-50/50 flex items-center gap-3 shadow-xs">
          <Hash className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-blue-900 block">REGLA 2: RANGO 100 - 150 PALABRAS</span>
            <span className="text-[10px] text-slate-600 font-medium">Margen estricto (Mín 100, Máx 150)</span>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-blue-300 bg-blue-50/50 flex items-center gap-3 shadow-xs">
          <Clock className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-blue-900 block">REGLA 3: POST OFICIAL</span>
            <span className="text-[10px] text-slate-600 font-medium">{postId} Activo</span>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-blue-300 bg-blue-50/50 flex items-center gap-3 shadow-xs">
          <Lock className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-blue-900 block">REGLA 4: BLOQUEO AL CIERRE</span>
            <span className="text-[10px] text-slate-600 font-medium">Ignora comentarios fuera de ventana</span>
          </div>
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-blue-900 text-xs font-mono font-bold mb-1 flex-wrap">
            <span>PUBLICACIÓN DIARIA OFICIAL: {postId}</span>
            <span>•</span>
            <span>{dayLabel}</span>
            <span>•</span>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-800">Cambiar Día:</span>
              <select
                value={challengeDay}
                onChange={(e) => router.push(`/project/day/${e.target.value}`)}
                className="bg-white border border-blue-300 text-blue-950 font-bold text-xs px-2 py-0.5 rounded outline-none cursor-pointer hover:border-blue-500 transition-colors"
                title="Selecciona el Día que deseas analizar (1 a 80)"
              >
                {Array.from({ length: 80 }, (_, i) => i + 1).map((d) => {
                  const w = Math.ceil(d / 5);
                  return (
                    <option key={d} value={d}>
                      Día {String(d).padStart(2, '0')} (Semana {w})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            Publicación Diaria Activa
            <span
              className={`text-xs px-3 py-1 rounded font-mono font-bold uppercase border ${
                postStatus === SocialPostStatus.ABIERTO
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}
            >
              ● {postStatus}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={postStatus}
            onChange={(e) => {
              const newStatus = e.target.value as SocialPostStatus;
              setPostStatus(newStatus);
              const isClosed = newStatus === SocialPostStatus.CERRADO || newStatus === SocialPostStatus.PROCESADO || newStatus === SocialPostStatus.ARCHIVADO;
              markDayClosed(projectDayId, isClosed);
            }}
            className="bg-white border border-slate-300 text-xs text-slate-800 font-bold px-3 py-2 rounded-lg outline-none focus:border-blue-500 shadow-2xs"
          >
            <option value={SocialPostStatus.ABIERTO}>Publicación: ABIERTO</option>
            <option value={SocialPostStatus.CERRADO}>Publicación: CERRADO (Bloqueo Regla 4)</option>
            <option value={SocialPostStatus.PROCESADO}>Publicación: PROCESADO</option>
            <option value={SocialPostStatus.ARCHIVADO}>Publicación: ARCHIVADO</option>
          </select>

          <button
            onClick={handleExecuteEngine}
            disabled={isExecuting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white text-white" />}
            <span>Ejecutar Motor +3</span>
          </button>
        </div>
      </div>

      {/* Background TikTok Job Tracking Widget */}
      <TikTokBackgroundJobWidget
        projectDayId={projectDayId}
        currentJobId={activeJobId}
        onJobComplete={handleJobCompleted}
      />

      {/* Target IDs Config & CSV Importer Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-900 flex items-center gap-2 font-mono">
            <Hash className="w-4 h-4 text-blue-600" /> Configuración de 3 IDs Objetivo
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SLOT 1 (Objetivo Inicial):</label>
              <input
                type="number"
                value={target1}
                onChange={(e) => setTarget1(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SLOT 2 (Objetivo Inicial):</label>
              <input
                type="number"
                value={target2}
                onChange={(e) => setTarget2(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SLOT 3 (Objetivo Inicial):</label>
              <input
                type="number"
                value={target3}
                onChange={(e) => setTarget3(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* TikTok Live Extractor & CSV Importer */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
          {/* Direct TikTok Extractor Input */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" /> Extractor Directo de TikTok (Motor EMP)
              </span>
              <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-mono font-bold">
                API LIST/REPLY
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@usuario/video/... o /photo/... o vt.tiktok.com/..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
              />
              <button
                onClick={handleFetchTikTokComments}
                disabled={isFetchingTikTok}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {isFetchingTikTok ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Descargar Comentarios TikTok</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Soporta cualquier publicación de TikTok (videos, fotos/carruseles y enlaces móviles cortos).
            </p>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-900 flex items-center gap-2 font-mono">
              <Upload className="w-4 h-4 text-blue-600" /> O Pega CSV de Comentarios (Mín 100 - Máx 150 Palabras)
            </h2>
            <span className="text-xs text-slate-500 font-mono font-bold">{allContributions.length} participaciones capturadas</span>
          </div>

          <textarea
            rows={3}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:border-blue-500 outline-none shadow-2xs font-medium"
            placeholder="author,username,text,likes,replies,created_at,language"
          />

          <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
            <span>Rango de palabras: <strong>100 a 150 palabras</strong>. Dual IDs: Global (EMP-COM-XXXXXX) y Diario (D{String(challengeDay).padStart(2,'0')}-C0001).</span>
            <button
              onClick={handleExecuteEngine}
              className="text-blue-700 hover:text-blue-900 underline font-bold"
            >
              Procesar y Ejecutar Regla +3
            </button>
          </div>
        </div>
      </div>



      {/* EXCEL-STYLE DATAGRID SECTION MATCHING USER SCREENSHOT */}
      <div className="space-y-6 pt-4 border-t border-slate-200 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Grid Estilo Excel de Comentarios ({allContributions.length} Participaciones Capturadas)
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Tabla de datos completa estructurada en columnas (<code className="font-bold text-blue-900">author, username, text, likes, replies, created_at, language, Valido</code>). Destaca automáticamente los comentarios que coinciden con los objetivos del día (#{target1}, #{target2}, #{target3}) y permite seleccionar el texto directamente para los 3 Slots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <span className="px-2.5 py-1 bg-white text-slate-800 rounded-lg shadow-2xs border border-slate-200">
                Total: <strong>{allContributions.length}</strong>
              </span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300">
                Valido = Si: <strong>{validCount}</strong>
              </span>
              <span className="px-2.5 py-1 bg-rose-100 text-rose-900 rounded-lg border border-rose-300">
                Valido = No: <strong>{invalidCount}</strong>
              </span>
            </div>

            {/* Export CSV Download Button */}
            <button
              onClick={handleDownloadExcelCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
              title="Descargar todos los comentarios en formato Excel CSV"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Excel (.csv)
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-200 p-1 rounded-xl border border-slate-300 font-sans">
              <button
                onClick={() => setViewMode('EXCEL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'EXCEL' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Grid
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'GRID' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <GridIcon className="w-3.5 h-3.5" /> Cards Grid
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por usuario (@carlos_writer), autor, secuencia (#15) o palabra clave de texto..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none font-medium"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-mono">
            <button
              onClick={() => { setActiveFilter('ALL'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-3 h-3" /> Todos ({allContributions.length})
            </button>

            <button
              onClick={() => { setActiveFilter('TARGETS'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'TARGETS'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-600" /> Coincide Objetivo ({initialTargetsMap.size})
            </button>

            <button
              onClick={() => { setActiveFilter('SELECTED'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'SELECTED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Seleccionados ({selectedSlotsMap.size})
            </button>

            <button
              onClick={() => { setActiveFilter('VALID'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'VALID'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" /> Valido = Si ({validCount})
            </button>

            <button
              onClick={() => { setActiveFilter('INVALID'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'INVALID'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <X className="w-3.5 h-3.5" /> Valido = No ({invalidCount})
            </button>
          </div>
        </div>

        {/* Display Content: EXCEL DATAGRID TABLE vs CARDS GRID */}
        {allContributions.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border-2 border-dashed border-blue-300 bg-white text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">{dayLabel} — 0 Comentarios Registrados</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El sistema se encuentra en su estado inicial limpio sin datos hardcodeados. Haz clic en <strong>"Extraer Comentarios de TikTok"</strong> para iniciar la ingesta de la convocatoria en vivo o pega tu archivo CSV.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleFetchTikTokComments}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extraer Comentarios de TikTok</span>
              </button>
            </div>
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-200 bg-white text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No se encontraron comentarios con los filtros aplicados.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('ALL'); }}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Restablecer filtros
            </button>
          </div>
        ) : viewMode === 'EXCEL' ? (
          /* LIGHT THEME DATAGRID IN SPANISH */
          <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[700px]">
              <table className="w-full text-left border-collapse font-mono text-xs text-slate-800">
                <thead className="sticky top-0 z-10">
                  {/* Sky-Blue Header with Spanish Titles */}
                  <tr className="bg-[#70a5db] text-slate-950 font-bold text-[11px] uppercase tracking-wider border-b border-slate-400 select-none">
                    <th className="p-3 text-center w-16 border-r border-[#5b8ec0]">#</th>
                    <th className="p-3 w-40 border-r border-[#5b8ec0]">Autor</th>
                    <th className="p-3 w-40 border-r border-[#5b8ec0]">Usuario</th>
                    <th className="p-3 min-w-[340px] border-r border-[#5b8ec0]">Comentario</th>
                    <th className="p-3 text-center w-24 border-r border-[#5b8ec0]">Me Gusta</th>
                    <th className="p-3 text-center w-24 border-r border-[#5b8ec0]">Respuestas</th>
                    <th className="p-3 w-48 border-r border-[#5b8ec0]">Fecha</th>
                    <th className="p-3 text-center w-20 border-r border-[#5b8ec0]">Idioma</th>
                    <th className="p-3 text-center w-24">Válido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedContributions.map((contrib) => {
                    const targetSlotNumber = initialTargetsMap.get(contrib.capture_sequence);
                    const selectedInfo = selectedSlotsMap.get(contrib.capture_sequence);
                    const isValid = contrib.validation_status === 'VALID';
                    const isTarget = targetSlotNumber !== undefined;
                    const isSelected = !!selectedInfo;

                    return (
                      <tr
                        key={contrib.id || contrib.capture_sequence}
                        className={`transition-colors text-xs border-b border-slate-200 ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-950 font-bold border-l-4 border-l-emerald-600 hover:bg-emerald-200/80'
                            : isTarget
                            ? 'bg-amber-100 text-amber-950 font-bold border-l-4 border-l-amber-500 hover:bg-amber-200/80'
                            : 'bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        {/* Secuencia # & Slot Badge (only shown for assigned slots / target) */}
                        <td className="p-3 text-center font-bold border-r border-slate-200 text-slate-700">
                          {isSelected ? (
                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold text-[10px] shadow-2xs whitespace-nowrap" title={`Asignado a Slot ${selectedInfo.slotNumber}`}>
                              #{contrib.capture_sequence} ⭐ Slot {selectedInfo.slotNumber}
                            </span>
                          ) : isTarget ? (
                            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-extrabold text-[10px] shadow-2xs whitespace-nowrap" title={`Objetivo Slot ${targetSlotNumber}`}>
                              #{contrib.capture_sequence} 🎯 Slot {targetSlotNumber}
                            </span>
                          ) : (
                            String(contrib.capture_sequence)
                          )}
                        </td>

                        {/* Autor */}
                        <td className="p-3 border-r border-slate-200 truncate max-w-[160px] font-semibold text-slate-900">
                          {contrib.author_name || contrib.author_handle || 'N/A'}
                        </td>

                        {/* Usuario (Foto de perfil + Enlace a TikTok) */}
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-800">
                          {(() => {
                            const usernameStr = (contrib.author_handle || contrib.participant_id || 'N/A').replace(/^@/, '');
                            const profileUrl = contrib.author_profile_url || contrib.platform_comment_url || `https://www.tiktok.com/@${usernameStr}`;
                            const avatarUrl = contrib.author_avatar_url || `https://unavatar.io/tiktok/${usernameStr}`;

                            return (
                              <a
                                href={profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-slate-900 hover:text-blue-600 font-mono text-xs group transition-all"
                                title={`Ver perfil de TikTok de @${usernameStr}`}
                              >
                                <img
                                  src={avatarUrl}
                                  alt={`Foto de ${usernameStr}`}
                                  className="w-7 h-7 rounded-full border border-slate-300 object-cover shadow-2xs group-hover:scale-110 group-hover:border-blue-500 transition-all shrink-0 bg-slate-100"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameStr}`;
                                  }}
                                />
                                <span className="truncate max-w-[130px] group-hover:underline">@{usernameStr}</span>
                              </a>
                            );
                          })()}
                        </td>

                        {/* Comentario */}
                        <td className="p-3 border-r border-slate-200 leading-normal font-sans text-xs text-slate-900">
                          <div className="line-clamp-3 select-text italic">
                            "{contrib.original_text}"
                          </div>
                        </td>

                        {/* Me Gusta */}
                        <td className="p-3 text-center border-r border-slate-200 text-slate-700 font-mono font-medium">
                          {contrib.likes ?? 0}
                        </td>

                        {/* Respuestas */}
                        <td className="p-3 text-center border-r border-slate-200 text-slate-700 font-mono font-medium">
                          {contrib.replies ?? 0}
                        </td>

                        {/* Fecha */}
                        <td className="p-3 border-r border-slate-200 text-[11px] text-slate-600 font-mono">
                          {contrib.received_at ? contrib.received_at.slice(0, 19).replace('T', ' ') : 'N/A'}
                        </td>

                        {/* Idioma */}
                        <td className="p-3 text-center border-r border-slate-200 text-slate-700 font-mono uppercase">
                          {contrib.language || 'es'}
                        </td>

                        {/* Válido: Si / No */}
                        <td className="p-3 text-center">
                          {isValid ? (
                            <span className="text-emerald-700 font-extrabold text-sm tracking-wide">
                              Si
                            </span>
                          ) : (
                            <span className="text-rose-600 font-extrabold text-sm tracking-wide">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* CARDS GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
            {paginatedContributions.map((contrib) => {
              const selectedInfo = selectedSlotsMap.get(contrib.capture_sequence);
              const targetSlotNumber = initialTargetsMap.get(contrib.capture_sequence);
              const isValid = contrib.validation_status === 'VALID';
              const isSelected = !!selectedInfo;
              const isTarget = targetSlotNumber !== undefined;

              return (
                <div
                  key={contrib.id || contrib.capture_sequence}
                  className={`rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                    isTarget
                      ? 'border-2 border-amber-500 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/30 ring-4 ring-amber-400/20 shadow-lg scale-[1.01]'
                      : isSelected
                      ? 'border-2 border-blue-600 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/30 ring-4 ring-blue-500/15 shadow-md'
                      : isValid
                      ? 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md'
                      : 'border-slate-200 bg-slate-50/80 opacity-90 hover:opacity-100 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {isTarget && (
                      <div className="bg-amber-500 text-slate-900 font-mono text-[11px] font-extrabold px-3 py-1.5 rounded-xl mb-3 shadow-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-slate-900" /> COINCIDE OBJETIVO SLOT {targetSlotNumber}
                        </span>
                        <span>SECUENCIA #{contrib.capture_sequence}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        #{String(contrib.capture_sequence).padStart(3, '0')}
                      </span>

                      {isValid ? (
                        <span className="bg-emerald-600 text-white font-mono text-[10px] font-extrabold px-3 py-1 rounded-full shadow-2xs border border-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Valido = Si
                        </span>
                      ) : (
                        <span className="bg-rose-600 text-white font-mono text-[10px] font-extrabold px-3 py-1 rounded-full shadow-2xs border border-rose-700 flex items-center gap-1">
                          <X className="w-3 h-3" /> Valido = No
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">ID Diario:</span>
                        <span className="font-bold text-blue-900">{contrib.daily_comment_code || `D${String(challengeDay).padStart(2, "0")}-C${String(contrib.capture_sequence).padStart(4, "0")}`}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Username:</span>
                        {(() => {
                          const usernameStr = (contrib.author_handle || contrib.participant_id || 'autor').replace(/^@/, '');
                          const profileUrl = contrib.author_profile_url || contrib.platform_comment_url || `https://www.tiktok.com/@${usernameStr}`;
                          const avatarUrl = contrib.author_avatar_url || `https://unavatar.io/tiktok/${usernameStr}`;

                          return (
                            <a
                              href={profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-blue-900 font-bold hover:text-blue-600 hover:underline group"
                              title={`Ver perfil de TikTok de @${usernameStr}`}
                            >
                              <img
                                src={avatarUrl}
                                alt={usernameStr}
                                className="w-5 h-5 rounded-full border border-slate-300 object-cover bg-slate-100 shrink-0 group-hover:scale-110 transition-all"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameStr}`;
                                }}
                              />
                              <span>@{usernameStr}</span>
                            </a>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <p className="text-xs text-slate-800 font-serif italic leading-relaxed bg-white p-3 rounded-xl border border-slate-200 line-clamp-4">
                        "{contrib.original_text}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className={isValid ? 'text-emerald-700' : 'text-rose-700'}>
                        {contrib.word_count} palabras {isValid ? '(En Rango 100-150)' : (contrib.word_count < 100 ? `(Faltan ${100 - contrib.word_count})` : `(Excede por ${contrib.word_count - 150})`)}
                      </span>
                      <span className="text-slate-500 text-[10px]">✓ +18 Años</span>
                    </div>

                    <div className="flex items-center gap-1 pt-1 font-sans">
                      <button
                        onClick={() => handleManualSlotSelection(1, contrib)}
                        className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                      >
                        Slot 1
                      </button>
                      <button
                        onClick={() => handleManualSlotSelection(2, contrib)}
                        className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                      >
                        Slot 2
                      </button>
                      <button
                        onClick={() => handleManualSlotSelection(3, contrib)}
                        className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                      >
                        Slot 3
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PREMIUM PAGINATION & ITEMS PER PAGE CONTROLS */}
        {filteredContributions.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs mt-4">
            {/* Items Per Page Selector & Range Info */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 font-mono">Mostrar:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                  <option value={filteredContributions.length > 0 ? filteredContributions.length : 1000}>
                    Ver Todos ({filteredContributions.length})
                  </option>
                </select>
              </div>

              <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono font-semibold">
                Registros <strong>{filteredContributions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredContributions.length)}</strong> de <strong>{filteredContributions.length}</strong> comentarios
              </div>
            </div>

            {/* Numbered Page Buttons Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 font-mono font-bold">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 disabled:opacity-30 hover:bg-slate-100 transition-all"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Prev Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 disabled:opacity-30 hover:bg-slate-100 transition-all"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Numbered Buttons */}
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push('...');
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (currentPage < totalPages - 2) pages.push('...');
                    pages.push(totalPages);
                  }
                  return pages.map((p, idx) =>
                    typeof p === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg font-bold text-xs transition-all ${
                          currentPage === p
                            ? 'bg-blue-600 text-white shadow-md scale-105 border border-blue-700 font-extrabold'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-slate-400 font-bold">
                        ...
                      </span>
                    )
                  );
                })()}

                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 disabled:opacity-30 hover:bg-slate-100 transition-all"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 disabled:opacity-30 hover:bg-slate-100 transition-all"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CENTERED LOADING & ANALYSIS MODAL */}
      {isFetchingTikTok && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-200 text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 animate-pulse" />

            {/* Spinner & Pulsing Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                <Sparkles className="w-6 h-6 animate-pulse text-blue-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                Analizando Comentarios de TikTok
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Conectando con la API de TikTok para extraer participaciones, fotos de perfil de usuarios y realizar la auditoría de Reglas Duras.
              </p>
            </div>

            {/* Live Progress Checklist */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2.5 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                <span>Extrayendo comentarios y respuestas...</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Validando métrica (100-150 palabras) y +18 años...</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Hash className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Asignando Dual IDs (EMP-COM / D01-C) y SHA-256...</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 italic">
              Por favor espera unos momentos mientras se completa la descarga...
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM PREMIUM NOTIFICATION & CONFIRMATION MODAL */}
      {customNotification.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Accent Gradient Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-2 ${
                customNotification.type === 'SUCCESS'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : customNotification.type === 'ERROR'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
            />

            {/* Icon Badge */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
                  customNotification.type === 'SUCCESS'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : customNotification.type === 'ERROR'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
              >
                {customNotification.type === 'SUCCESS' && <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
                {customNotification.type === 'ERROR' && <AlertCircle className="w-8 h-8 text-rose-600" />}
                {customNotification.type === 'INFO' && <Sparkles className="w-8 h-8 text-blue-600" />}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-slate-900">
                {customNotification.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {customNotification.message}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={() => setCustomNotification({ ...customNotification, isOpen: false })}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                  customNotification.type === 'SUCCESS'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : customNotification.type === 'ERROR'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                Aceptar / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOUBLE CONFIRMATION OVERWRITE MODAL */}
      {showOverwriteModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-amber-200 text-center space-y-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 animate-pulse" />

            {/* Warning Icon Badge */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200 shadow-inner">
                <AlertCircle className="w-8 h-8 text-amber-600 animate-bounce" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold uppercase border border-amber-300">
                PROTECCIÓN DE FOTOGRAFÍA CONGELADA
              </span>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                ¿Deseas planchar y re-descargar comentarios?
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Esta jornada ({dayLabel}) ya cuenta con una <strong>fotografía respaldada</strong> de <strong className="text-slate-900">{allContributions.length} comentarios</strong>. Re-descargar reemplazará la captura actual y afectará las secuencias registradas.
              </p>
            </div>

            {/* Security Phrase Input */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 font-sans">
              <label className="text-[11px] font-bold text-slate-800 block">
                Para confirmar la sobresuscripción, escribe exactamente:
              </label>
              <div className="flex items-center gap-2">
                <code className="bg-amber-100 text-amber-950 font-mono font-extrabold px-2.5 py-1 rounded border border-amber-300 text-xs select-all">
                  DESCARGAR_NUEVAMENTE
                </code>
              </div>
              <input
                type="text"
                value={overwriteConfirmationInput}
                onChange={(e) => setOverwriteConfirmationInput(e.target.value)}
                placeholder="Escribe DESCARGAR_NUEVAMENTE aquí..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none shadow-2xs font-bold"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowOverwriteModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={executeTikTokFetch}
                disabled={overwriteConfirmationInput.trim() !== 'DESCARGAR_NUEVAMENTE'}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Planchar y Descargar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
