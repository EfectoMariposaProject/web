import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  footer?: React.ReactNode;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconColorClass = 'text-amber-600',
  footer,
  loading = false,
}: KPICardProps) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-sm">
      <div className="flex justify-between items-center text-slate-500 mb-2">
        <span className="text-xs uppercase font-semibold tracking-wider">{title}</span>
        <Icon className={`w-4 h-4 ${iconColorClass}`} />
      </div>
      <div className="text-2xl font-bold text-slate-900 font-mono">
        {loading ? (
          <span className="inline-block w-16 h-7 bg-slate-100 animate-pulse rounded" />
        ) : (
          value
        )}
      </div>
      {footer && <div className="mt-2 text-xs">{footer}</div>}
    </div>
  );
}
