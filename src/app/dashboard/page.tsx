'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Users, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { useEmpCache } from '@/lib/cache/CacheProvider';
import { KPICard } from '@/components/dashboard/KPICard';
import { DaySelector } from '@/components/dashboard/DaySelector';
import { AuthorDistribution } from '@/components/dashboard/AuthorDistribution';
import { StoryHealthCard } from '@/components/dashboard/StoryHealthCard';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const { fetchWithCache } = useEmpCache();

  const [kpis, setKpis] = useState({
    dayNumber: 1,
    totalDays: 80,
    weekNumber: 1,
    totalContributions: 0,
    dailyContributions: 0,
    validContributions: 0,
    invalidContributions: 0,
    incorporatedContributions: 0,
    uniqueAuthors: 0,
    authorsWith1: 0,
    authorsWith2: 0,
    authorsWith3Max: 0,
    openMysteries: 3,
    activeSeeds: 5,
    pendingContradictions: 0,
  });

  const projectDayId = `day-${String(selectedDay).padStart(3, '0')}`;
  const weekNumber = Math.ceil(selectedDay / 5);

  useEffect(() => {
    let isCancelled = false;

    const fetchDayMetrics = async () => {
      try {
        // Fast lightweight query using summary=true (direct server aggregation)
        const data = await fetchWithCache(`/api/contributions?projectDayId=${projectDayId}&summary=true`);

        if (isCancelled) return;

        if (data?.success && data.summary) {
          setKpis((prev) => ({
            ...prev,
            ...data.summary,
            dayNumber: selectedDay,
            totalDays: 80,
            weekNumber,
          }));
        }
      } catch (err) {
        console.warn('Error al cargar KPIs del dashboard desde caché/API:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchDayMetrics();

    return () => {
      isCancelled = true;
    };
  }, [selectedDay, projectDayId, weekNumber, fetchWithCache]);

  return (
    <div className="space-y-8">
      {/* Banner / Header Hero */}
      <div className="glass-panel p-8 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 relative overflow-hidden butterfly-glow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> RETO EN CURSO (4 MESES / 80 DÍAS)
              </span>
              <span className="text-slate-500 text-xs font-mono font-semibold">SEMANA {weekNumber}</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
              EFECTO MARIPOSA <span className="gold-gradient-text">PROJECT</span>
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Plataforma de gestión y control de la novela colaborativa construida en 4 meses (Mín 100, Máx 150 palabras).
            </p>
          </div>

          {/* Reusable Day Selector Component */}
          <DaySelector
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            totalDays={80}
          />
        </div>
      </div>

      {/* Main KPI Grid with Reusable KPICards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={`Participaciones Día ${selectedDay}`}
          value={kpis.dailyContributions.toLocaleString()}
          icon={FileText}
          iconColorClass="text-amber-600"
          loading={loading}
          footer={
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-emerald-700 font-semibold">✓ {kpis.validContributions} válidas</span>
              <span>•</span>
              <span className="text-rose-600">✗ {kpis.invalidContributions} inválidas</span>
            </div>
          }
        />

        <KPICard
          title="Incorporadas a Novela"
          value={kpis.incorporatedContributions}
          icon={CheckCircle}
          iconColorClass="text-emerald-600"
          loading={loading}
          footer={
            <span className="text-slate-500">Selecciones oficiales Día {selectedDay}</span>
          }
        />

        <KPICard
          title="Autores Únicos"
          value={kpis.uniqueAuthors.toLocaleString()}
          icon={Users}
          iconColorClass="text-blue-600"
          loading={loading}
          footer={
            <span className="text-slate-500">{kpis.authorsWith3Max} autores han alcanzado el límite (3/3)</span>
          }
        />

        <KPICard
          title="Contradicciones"
          value={kpis.pendingContradictions}
          icon={ShieldCheck}
          iconColorClass="text-emerald-600"
          loading={loading}
          footer={
            <span className="text-emerald-700 font-semibold">Continuidad limpia en la novela</span>
          }
        />
      </div>

      {/* Reusable Modular Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AuthorDistribution
          authorsWith1={kpis.authorsWith1}
          authorsWith2={kpis.authorsWith2}
          authorsWith3Max={kpis.authorsWith3Max}
        />

        <StoryHealthCard
          openMysteries={kpis.openMysteries}
          activeSeeds={kpis.activeSeeds}
          riskLevel="BAJO"
        />

        <QuickActions selectedDay={selectedDay} />
      </div>
    </div>
  );
}
