'use client';

import React from 'react';
import { Percent, Layers, CheckCircle, AlertOctagon, TrendingUp, Cpu } from 'lucide-react';
import { LotYieldSummary } from '@/types/database';

interface KpiCardsProps {
  summaries: LotYieldSummary[];
}

export default function KpiCards({ summaries }: KpiCardsProps) {
  const totalLots = summaries.length;
  const totalInspect = summaries.reduce((sum, s) => sum + s.total_inspect_qty, 0);
  const totalDefect = summaries.reduce((sum, s) => sum + s.total_defect_qty, 0);

  const avgYield = totalInspect > 0 ? ((totalInspect - totalDefect) / totalInspect) * 100 : 100;
  const avgDefectRate = totalInspect > 0 ? (totalDefect / totalInspect) * 100 : 0;
  const defectPpm = totalInspect > 0 ? Math.round((totalDefect / totalInspect) * 1000000) : 0;

  const goodLots = summaries.filter(s => s.yield_rate >= 95.0).length;
  const goodLotRatio = totalLots > 0 ? ((goodLots / totalLots) * 100).toFixed(1) : '100.0';

  const runningLots = summaries.filter(s => s.status === 'RUNNING').length;
  const holdOrScrapLots = summaries.filter(s => s.status === 'HOLD' || s.status === 'SCRAP').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Overall Yield Rate */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">종합 공정 수율 (Yield)</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 text-cyan-400 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className={`text-2xl sm:text-3xl font-extrabold ${avgYield >= 95 ? 'text-emerald-400' : avgYield >= 90 ? 'text-amber-400' : 'text-rose-400'}`}>
            {avgYield.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-slate-400">%</span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-400">
          <span className="text-emerald-400 font-medium mr-1">Target 95.0%</span>
          <span>{avgYield >= 95.0 ? '달성 (양호)' : '주의 필요'}</span>
        </div>
      </div>

      {/* 2. Total Monitored Lots */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">모니터링 Lot 수</span>
          <div className="w-8 h-8 rounded-lg bg-blue-950/80 text-blue-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">{totalLots}</span>
          <span className="text-xs font-semibold text-slate-400">Lots</span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-400">
          <span className="text-cyan-400 font-medium mr-1">{runningLots} 진행중</span>
          <span>· {totalLots - runningLots} 완료/보류</span>
        </div>
      </div>

      {/* 3. Total Inspect Qty */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">총 검사 수량 (Inspect)</span>
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 text-purple-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {totalInspect.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">ea</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 truncate">
          전체 인스펙션 누적 검사량
        </div>
      </div>

      {/* 4. Total Defect Qty */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-rose-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">총 검출 불량 수 (Defects)</span>
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">
            {totalDefect.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">ea</span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-400">
          <span>불량률: </span>
          <span className="font-semibold text-slate-200 ml-1">{avgDefectRate.toFixed(2)}%</span>
        </div>
      </div>

      {/* 5. Defect PPM */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">불량 지수 (PPM)</span>
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
            {defectPpm.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">PPM</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Parts Per Million 단위 결함율
        </div>
      </div>

      {/* 6. Good Lots Ratio & Hold/Scrap Alert */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">수율 양호 Lot 비율</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{goodLotRatio}</span>
          <span className="text-xs font-semibold text-slate-400">%</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
          <span>기준: 95% 이상</span>
          {holdOrScrapLots > 0 && (
            <span className="text-rose-400 font-semibold">{holdOrScrapLots}건 이상 조치</span>
          )}
        </div>
      </div>
    </div>
  );
}
