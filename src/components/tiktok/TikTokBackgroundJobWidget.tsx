'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, CheckCircle2, AlertTriangle, Terminal, 
  ChevronDown, ChevronUp, Database, CloudDownload
} from 'lucide-react';

export interface ImportJobState {
  id: string;
  projectDayId: string;
  platform: string;
  videoUrl: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  totalFetched: number;
  totalSaved: number;
  errorMessage?: string | null;
  parsedLogs?: string[];
  startedAt?: string;
  completedAt?: string | null;
}

interface TikTokBackgroundJobWidgetProps {
  projectDayId: string;
  currentJobId?: string | null;
  onJobComplete?: (job: ImportJobState) => void;
}

export function TikTokBackgroundJobWidget({
  projectDayId,
  currentJobId,
  onJobComplete,
}: TikTokBackgroundJobWidgetProps) {
  const [job, setJob] = useState<ImportJobState | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const hasNotifiedCompleteRef = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobStatus = async (jobIdToFetch: string) => {
    try {
      const res = await fetch(`/api/tiktok/jobs/${jobIdToFetch}?_t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.job) {
        setJob(data.job);

        if (data.job.status === 'COMPLETED') {
          if (!hasNotifiedCompleteRef.current) {
            hasNotifiedCompleteRef.current = true;
            if (onJobComplete) {
              onJobComplete(data.job);
            }
          }
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else if (data.job.status === 'FAILED') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    } catch (err) {
      console.warn('Error al verificar estado de job en background:', err);
    }
  };

  // Initial load: check if there's an active job for this projectDayId or use currentJobId
  useEffect(() => {
    let isCancelled = false;

    const checkActiveJobs = async () => {
      if (currentJobId) {
        await fetchJobStatus(currentJobId);
        return;
      }

      try {
        const res = await fetch(`/api/tiktok/jobs?projectDayId=${projectDayId}&active=true`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled && data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
          const activeJob = data.jobs[0];
          setJob(activeJob);
        }
      } catch {
        // ignore
      }
    };

    checkActiveJobs();

    return () => {
      isCancelled = true;
    };
  }, [projectDayId, currentJobId]);

  // Polling effect while job is PENDING or PROCESSING
  useEffect(() => {
    if (!job || (job.status !== 'PENDING' && job.status !== 'PROCESSING')) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    hasNotifiedCompleteRef.current = false;
    pollIntervalRef.current = setInterval(() => {
      fetchJobStatus(job.id);
    }, 2500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [job?.id, job?.status]);

  if (!job) return null;

  const isRunning = job.status === 'PENDING' || job.status === 'PROCESSING';
  const isSuccess = job.status === 'COMPLETED';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${
        isRunning
          ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400/30'
          : isSuccess
          ? 'bg-emerald-50/80 border-emerald-300'
          : 'bg-rose-50/80 border-rose-300'
      }`}
    >
      {/* Header bar */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              isRunning
                ? 'bg-blue-600 text-white'
                : isSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {isRunning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Proceso en Segundo Plano (TikTok)
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isRunning
                    ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse'
                    : isSuccess
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}
              >
                {isRunning ? 'EN EJECUCIÓN' : isSuccess ? 'COMPLETADO' : 'FALLIDO'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isRunning
                ? 'El servidor está descargando y archivando comentarios de forma independiente. Puedes navegar o cerrar la pestaña sin interrumpir.'
                : isSuccess
                ? `Extracción finalizada exitosamente: ${job.totalSaved} comentarios archivados.`
                : job.errorMessage || 'Ocurrió un inconveniente durante la extracción.'}
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <CloudDownload className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600 font-medium">Extraídos:</span>
            <span className="font-bold text-slate-900">{job.totalFetched}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-600 font-medium">Guardados:</span>
            <span className="font-bold text-slate-900">{job.totalSaved}</span>
          </div>

          {job.parsedLogs && job.parsedLogs.length > 0 && (
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition-colors"
              title={showLogs ? 'Ocultar terminal de logs' : 'Ver terminal de logs'}
            >
              {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for running states */}
      {isRunning && (
        <div className="w-full bg-blue-100 h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500 rounded-r-full"
            style={{ width: `${Math.max(10, Math.min(job.progress, 95))}%` }}
          />
        </div>
      )}

      {/* Expandable Live Terminal Logs */}
      {showLogs && job.parsedLogs && (
        <div className="bg-slate-950 text-slate-200 p-3 text-[11px] font-mono border-t border-slate-800 space-y-1 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-slate-400 pb-1 border-b border-slate-800 mb-1">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registro de actividad en el servidor (Worker ID: {job.id.slice(0, 8)}...)</span>
          </div>
          {job.parsedLogs.map((logLine, idx) => (
            <div key={idx} className="leading-relaxed hover:text-white">
              {logLine}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
