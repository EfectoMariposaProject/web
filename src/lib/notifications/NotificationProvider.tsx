'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ImportJobState } from '@/components/tiktok/TikTokBackgroundJobWidget';

export interface ToastNotification {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  createdAt: number;
}

interface NotificationContextValue {
  jobs: ImportJobState[];
  activeJobs: ImportJobState[];
  unreadCount: number;
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
  markAllAsRead: () => void;
  requestDesktopPermission: () => Promise<void>;
  desktopPermission: NotificationPermission | 'unsupported';
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // ignore audio failure
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<ImportJobState[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission | 'unsupported'>('default');

  const knownJobStatusRef = useRef<Map<string, string>>(new Map());
  const isInitialLoadRef = useRef(true);

  // Check desktop notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopPermission(Notification.permission);
    } else {
      setDesktopPermission('unsupported');
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'createdAt'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setUnreadCount((c) => c + 1);
    playChime();

    // Auto-remove after 8 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 8000);
  }, [removeToast]);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const requestDesktopPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setDesktopPermission(result);
        if (result === 'granted') {
          addToast({
            type: 'SUCCESS',
            title: 'Notificaciones Habilitadas',
            message: 'Recibirás avisos en tu escritorio cuando finalicen descargas de TikTok.',
          });
        }
      } catch (err) {
        console.warn('Error al solicitar permiso de notificaciones:', err);
      }
    }
  }, [addToast]);

  const sendBrowserNotification = (title: string, body: string, url?: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
        if (url) {
          notif.onclick = () => {
            window.focus();
            window.location.href = url;
          };
        }
      } catch (err) {
        console.warn('Error al lanzar notificación nativa:', err);
      }
    }
  };

  // Background poller for TikTok import jobs
  useEffect(() => {
    let isCancelled = false;

    const pollJobs = async () => {
      try {
        const res = await fetch('/api/tiktok/jobs');
        if (!res.ok) return;
        const data = await res.json();
        if (isCancelled || !data.success || !Array.isArray(data.jobs)) return;

        const fetchedJobs: ImportJobState[] = data.jobs;
        setJobs(fetchedJobs);

        // Detect state transitions
        fetchedJobs.forEach((job) => {
          const prevStatus = knownJobStatusRef.current.get(job.id);
          const dayMatch = job.projectDayId.match(/day-(\d+)/i);
          const dayNum = dayMatch ? Number(dayMatch[1]) : 1;
          const dayLabel = `Día ${String(dayNum).padStart(2, '0')}`;
          const dayUrl = `/project/day/${dayNum}`;

          if (!isInitialLoadRef.current && prevStatus) {
            if ((prevStatus === 'PENDING' || prevStatus === 'PROCESSING') && job.status === 'COMPLETED') {
              const title = `¡Descarga de TikTok Finalizada! (${dayLabel})`;
              const message = `Se capturaron y archivaron exitosamente ${job.totalSaved} comentarios en la base de datos.`;

              addToast({
                type: 'SUCCESS',
                title,
                message,
                actionLabel: 'Ver Jornada',
                actionUrl: dayUrl,
              });

              sendBrowserNotification(title, message, dayUrl);
            } else if ((prevStatus === 'PENDING' || prevStatus === 'PROCESSING') && job.status === 'FAILED') {
              const title = `Inconveniente en Extracción (${dayLabel})`;
              const message = job.errorMessage || 'Ocurrió un error durante la descarga de comentarios.';

              addToast({
                type: 'ERROR',
                title,
                message,
                actionLabel: 'Ver Detalles',
                actionUrl: dayUrl,
              });

              sendBrowserNotification(title, message, dayUrl);
            }
          }

          knownJobStatusRef.current.set(job.id, job.status);
        });

        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } catch {
        // ignore network hiccup
      }
    };

    pollJobs();
    const interval = setInterval(pollJobs, 4000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [addToast]);

  const activeJobs = jobs.filter((j) => j.status === 'PENDING' || j.status === 'PROCESSING');

  return (
    <NotificationContext.Provider
      value={{
        jobs,
        activeJobs,
        unreadCount,
        toasts,
        removeToast,
        markAllAsRead,
        requestDesktopPermission,
        desktopPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
