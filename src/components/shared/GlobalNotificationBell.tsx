'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/lib/notifications/NotificationProvider';
import { 
  Bell, RefreshCw, ArrowRight, BellRing, Clock, CloudDownload, Database
} from 'lucide-react';
import Link from 'next/link';

export function GlobalNotificationBell() {
  const { 
    jobs, 
    activeJobs, 
    unreadCount, 
    markAllAsRead, 
    requestDesktopPermission, 
    desktopPermission 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  const hasActive = activeJobs.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-xl border transition-all ${
          isOpen
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
            : hasActive
            ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
        }`}
        title="Centro de Notificaciones y Procesos en Background"
        aria-label="Notificaciones"
      >
        {hasActive ? (
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        ) : (
          <Bell className="w-4 h-4" />
        )}

        {/* Pulse / Badge indicator */}
        {hasActive ? (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
          </span>
        ) : unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white font-mono font-bold text-[10px] rounded-full border border-white shadow-2xs">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Centro de Actividad
              </span>
            </div>
            {desktopPermission === 'default' && (
              <button
                onClick={requestDesktopPermission}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Activar avisos de escritorio
              </button>
            )}
          </div>

          {/* Body List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-1">
                <Clock className="w-6 h-6 mx-auto text-slate-400" />
                <p className="text-xs font-bold text-slate-700">Sin tareas registradas</p>
                <p className="text-[11px] text-slate-500">
                  Las extracciones de comentarios de TikTok aparecerán aquí en vivo.
                </p>
              </div>
            ) : (
              jobs.map((job) => {
                const isRunning = job.status === 'PENDING' || job.status === 'PROCESSING';
                const isSuccess = job.status === 'COMPLETED';
                const dayMatch = job.projectDayId.match(/day-(\d+)/i);
                const dayNum = dayMatch ? Number(dayMatch[1]) : 1;
                const dayUrl = `/project/day/${dayNum}`;

                return (
                  <div
                    key={job.id}
                    className={`p-3.5 transition-colors ${
                      isRunning ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRunning
                              ? 'bg-blue-600 animate-pulse'
                              : isSuccess
                              ? 'bg-emerald-600'
                              : 'bg-rose-600'
                          }`}
                        />
                        <span className="text-xs font-bold font-mono text-slate-900">
                          Jornada Día {String(dayNum).padStart(2, '0')}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isRunning
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : isSuccess
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}
                      >
                        {isRunning ? 'EN PROCESO' : isSuccess ? 'FINALIZADO' : 'FALLIDO'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-1 mb-2">
                      {isRunning
                        ? 'Extrayendo comentarios y respuestas en segundo plano...'
                        : isSuccess
                        ? `Se archivaron ${job.totalSaved} comentarios en la base de datos.`
                        : job.errorMessage || 'Error durante la extracción.'}
                    </p>

                    {/* Progress details */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CloudDownload className="w-3 h-3 text-blue-600" />
                          {job.totalFetched}
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-emerald-600" />
                          {job.totalSaved}
                        </span>
                      </div>

                      <Link
                        href={dayUrl}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <span>Abrir Jornada</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Los procesos continúan aunque cierres la pestaña
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
