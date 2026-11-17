'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { DefectParetoItem } from '@/types/database';

interface DefectParetoChartProps {
  paretoData: DefectParetoItem[];
}

export default function DefectParetoChart({ paretoData }: DefectParetoChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-rose-400">{data.defect_code}</span>
            <span className="text-[11px] text-slate-400">{data.percentage}% 비중</span>
          </div>
          <p className="text-slate-200">{data.description}</p>
          <div className="flex justify-between text-slate-300 pt-1">
            <span>불량 검출 수량:</span>
            <span className="font-bold text-rose-400">{data.defect_qty.toLocaleString()} ea</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>누적 점유율 (Cumulative):</span>
            <span className="font-bold text-cyan-400">{data.cumulative_percentage}%</span>
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
            <span>📊 결함 유형 파레토 분석 (Defect Pareto)</span>
          </h3>
          <p className="text-xs text-slate-400">주요 불량 코드별 발생 빈도(막대) 및 누적 기여율(선) 80/20 법칙 분석</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
            <span className="text-slate-400">불량 수량 (ea)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">누적 비율 (%)</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        {paretoData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            검사 불량 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="defect_code" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="#06b6d4"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="defect_qty"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative_percentage"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0891b2', stroke: '#22d3ee', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
