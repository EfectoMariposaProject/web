'use client';

import React from 'react';
import { useNotifications } from '@/lib/notifications/NotificationProvider';
import { AlertCircle, Info, X, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function GlobalToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-3 font-sans">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'SUCCESS';
        const isError = toast.type === 'ERROR';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/30'
                : isError
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/30'
                : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-slate-950/30'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isError
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {isSuccess ? (
                <Sparkles className="w-5 h-5" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  {toast.title}
                </h4>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">{toast.message}</p>

              {toast.actionUrl && (
                <div className="mt-2.5">
                  <Link
                    href={toast.actionUrl}
                    onClick={() => removeToast(toast.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 shadow-xs"
                  >
                    <span>{toast.actionLabel || 'Ver'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
