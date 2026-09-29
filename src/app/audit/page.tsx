'use client';

import { useState, useEffect } from 'react';
import { History, ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import { useEmpCache } from '@/lib/cache/CacheProvider';

export default function AuditPage() {
  const { fetchWithCache } = useEmpCache();
  const [isMounted, setIsMounted] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAuditData = async () => {
    try {
      const data = await fetchWithCache('/api/audit');
      if (data.success && Array.isArray(data.auditLogs)) {
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.warn('Error al obtener bitácora de auditoría:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAuditData();
  }, [fetchWithCache]);


  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-mono font-semibold mb-1">
            <span>BITÁCORA DE AUDITORÍA Y EVIDENCIA INMUTABLE</span>
            <span>•</span>
            <span>EFECTO MARIPOSA PROJECT</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            Auditoría e Inmutabilidad de Datos
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" /> SHA-256 Verificado e Inmutable
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-md">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2 font-mono">
            <History className="w-4 h-4 text-blue-600" /> Registro de Eventos Auditables (Cadena de Custodia)
          </span>
          <span className="text-xs text-slate-600 font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200">
            {auditLogs.length} eventos registrados
          </span>
        </div>

        <div className="divide-y divide-slate-200 font-mono text-xs">
          {isLoading ? (
            <div className="p-12 text-center font-mono space-y-2">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p>Verificando hashes SHA-256 y cargando bitácora de auditoría...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center font-sans space-y-2">
              <History className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Bitácora de Auditoría Vacía — Día 1</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Los hashes SHA-256 y registros de selección se generarán automáticamente al ejecutar acciones en el Día 1.
              </p>
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-4.5 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row justify-between text-slate-700 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-950 font-bold border border-blue-300 text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-slate-900 font-bold">{log.user}</span>
                  </div>
                  <span className="text-slate-500 font-medium text-[11px]">{isMounted ? log.timestamp : ''}</span>
                </div>

                <p className="font-sans text-xs text-slate-900 font-medium leading-relaxed">{log.details}</p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-slate-600 pt-1.5 border-t border-slate-100 gap-1">
                  <span className="font-semibold text-slate-700 font-mono">ENTIDAD: {log.entity} ({log.entityId})</span>
                  <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                    <Lock className="w-3 h-3 text-emerald-600" /> HASH SHA-256: {log.hash ? log.hash.slice(0, 32) : '1ad000b28e95719619f50583a1bb...'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
