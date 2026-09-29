import React from 'react';
import { Calendar } from 'lucide-react';

interface DaySelectorProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  totalDays?: number;
}

export function DaySelector({
  selectedDay,
  onSelectDay,
  totalDays = 80,
}: DaySelectorProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border border-amber-300 shadow-xs">
        <Calendar className="w-4 h-4 text-amber-700" />
        <span className="text-xs text-slate-600 font-mono uppercase tracking-wider font-bold">Jornada:</span>
        <select
          value={selectedDay}
          onChange={(e) => onSelectDay(Number(e.target.value))}
          className="bg-amber-50 text-amber-900 font-serif font-bold text-lg px-2.5 py-1 rounded-lg border border-amber-300 outline-none cursor-pointer hover:bg-amber-100 transition-colors"
        >
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              DÍA {String(d).padStart(2, '0')} (Semana {Math.ceil(d / 5)})
            </option>
          ))}
        </select>
        <span className="text-slate-400 font-mono text-sm">/ {totalDays}</span>
      </div>
      <span className="text-[11px] text-slate-500 font-mono font-medium">
        Lunes a Viernes • 16 Semanas Totales
      </span>
    </div>
  );
}
