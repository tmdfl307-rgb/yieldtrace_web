'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { LotYieldSummary } from '@/types/database';

interface YieldTrendChartProps {
  summaries: LotYieldSummary[];
}

export default function YieldTrendChart({ summaries }: YieldTrendChartProps) {
  const chartData = [...summaries]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(s => ({
      lot_id: s.lot_id,
      yield_rate: s.yield_rate,
      inspect_qty: s.total_inspect_qty,
      defect_qty: s.total_defect_qty,
      product_name: s.product_name,
      status: s.status,
      date: s.created_at ? s.created_at.substring(5, 10) : '',
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="flex items-center justify-between space-x-3 border-b border-slate-800 pb-1">
            <span className="font-bold text-cyan-300">{data.lot_id}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              data.status === 'RUNNING' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
              data.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              data.status === 'HOLD' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {data.status}
            </span>
          </div>
          <p className="text-slate-300 truncate max-w-[200px]">{data.product_name}</p>
          <div className="flex justify-between text-slate-400 pt-1">
            <span>수율 (Yield):</span>
            <span className={`font-bold ${data.yield_rate >= 95 ? 'text-emerald-400' : data.yield_rate >= 90 ? 'text-amber-400' : 'text-rose-400'}`}>
              {data.yield_rate.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>검사 / 불량:</span>
            <span className="text-slate-200">
              {data.inspect_qty.toLocaleString()} / <span className="text-rose-400">{data.defect_qty.toLocaleString()}</span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <span>📈 반도체 Lot별 수율 추이 (Yield Trend)</span>
          </h3>
          <p className="text-xs text-slate-400">생성 일자 순서에 따른 각 Lot의 실시간 공정 수율 변동 모니터링</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">목표치 (95%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="text-slate-400">관리한계 (90%)</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="yieldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="lot_id"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                interval={0}
                tickFormatter={(val) => val.replace('LOT-2611-', '')}
              />
              <YAxis
                domain={[70, 100]}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={95} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target 95%', fill: '#10b981', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={90} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'LCL 90%', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
              <Area
                type="monotone"
                dataKey="yield_rate"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#yieldAreaGrad)"
              />
              <Line
                type="monotone"
                dataKey="yield_rate"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#38bdf8' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
