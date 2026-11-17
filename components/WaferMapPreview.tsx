'use client';

import React, { useState } from 'react';
import { Disc, Layers, Info } from 'lucide-react';
import { LotYieldSummary } from '@/types/database';

interface WaferMapPreviewProps {
  summaries: LotYieldSummary[];
}

export default function WaferMapPreview({ summaries }: WaferMapPreviewProps) {
  const [selectedLotId, setSelectedLotId] = useState<string>(summaries[0]?.lot_id || '');

  const selectedLot = summaries.find(s => s.lot_id === selectedLotId) || summaries[0];

  const gridSize = 13;
  const radius = gridSize / 2;

  const yieldRate = selectedLot ? selectedLot.yield_rate : 97.0;
  const defectRate = 100 - yieldRate;

  const getDieStatus = (r: number, c: number) => {
    const dist = Math.sqrt(Math.pow(r - radius + 0.5, 2) + Math.pow(c - radius + 0.5, 2));
    if (dist > radius - 0.2) return 'outside';

    const isEdge = dist > radius - 1.2;
    const edgeMultiplier = isEdge ? 2.5 : 0.8;

    const seed = (r * 37 + c * 19 + (selectedLot?.lot_id.charCodeAt(selectedLot.lot_id.length - 1) || 1)) % 100;
    if (seed < defectRate * edgeMultiplier) {
      return seed % 3 === 0 ? 'defect-critical' : 'defect-particle';
    }
    return 'pass';
  };

  const dies: { r: number; c: number; status: string }[] = [];
  let totalDies = 0;
  let passDies = 0;
  let failDies = 0;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const status = getDieStatus(r, c);
      if (status !== 'outside') {
        totalDies++;
        if (status === 'pass') passDies++;
        else failDies++;
      }
      dies.push({ r, c, status });
    }
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <Disc className="w-5 h-5 text-cyan-400" />
            <span>300mm 웨이퍼 다이 맵 (Wafer Die Map)</span>
          </h3>
          <p className="text-xs text-slate-400">선택한 Lot의 실리콘 웨이퍼 내 불량 다이(Die) 분포 시각화</p>
        </div>

        {/* Lot Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400">대상 Lot:</label>
          <select
            value={selectedLot?.lot_id || ''}
            onChange={(e) => setSelectedLotId(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500"
          >
            {summaries.map(s => (
              <option key={s.lot_id} value={s.lot_id}>
                {s.lot_id} ({s.yield_rate}%) - {s.product_name.substring(0, 15)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Wafer Map Visual */}
        <div className="md:col-span-6 flex justify-center py-2">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center shadow-inner overflow-hidden">
            {/* Wafer Notch */}
            <div className="absolute bottom-0 w-8 h-2 bg-slate-800 rounded-t-md z-10 border-t border-slate-600"></div>

            {/* Grid of dies */}
            <div
              className="grid gap-[2px] p-2"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: '90%',
                height: '90%'
              }}
            >
              {dies.map((die, idx) => {
                if (die.status === 'outside') {
                  return <div key={idx} className="opacity-0" />;
                }
                if (die.status === 'pass') {
                  return (
                    <div
                      key={idx}
                      className="bg-emerald-500/80 rounded-[1px] hover:bg-emerald-400 transition-colors shadow-sm"
                      title={`Die [${die.r},${die.c}]: PASS`}
                    />
                  );
                }
                if (die.status === 'defect-critical') {
                  return (
                    <div
                      key={idx}
                      className="bg-rose-500 rounded-[1px] hover:bg-rose-400 animate-pulse shadow-sm shadow-rose-500/50"
                      title={`Die [${die.r},${die.c}]: FAIL (Critical Defect)`}
                    />
                  );
                }
                return (
                  <div
                    key={idx}
                    className="bg-amber-400 rounded-[1px] hover:bg-amber-300 shadow-sm"
                    title={`Die [${die.r},${die.c}]: FAIL (Particle Defect)`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Wafer Stats & Legend */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">선택된 Lot</span>
              <span className="font-bold text-cyan-300">{selectedLot?.lot_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">적용 제품</span>
              <span className="text-slate-200 font-medium">{selectedLot?.product_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">디바이스 분류</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px]">
                {selectedLot?.device_type}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">실시간 수율</span>
              <span className={`text-base font-extrabold ${selectedLot && selectedLot.yield_rate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {selectedLot?.yield_rate}%
              </span>
            </div>
          </div>

          {/* Die Legend */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block">다이(Die) 범례 및 판정 결과:</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 bg-slate-950/40 p-2 rounded border border-slate-800">
                <div className="w-3.5 h-3.5 rounded bg-emerald-500"></div>
                <div>
                  <div className="text-slate-200 font-medium">Pass Die (양품)</div>
                  <div className="text-[10px] text-slate-400">{passDies}개 ({((passDies / totalDies) * 100).toFixed(1)}%)</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-slate-950/40 p-2 rounded border border-slate-800">
                <div className="w-3.5 h-3.5 rounded bg-rose-500"></div>
                <div>
                  <div className="text-slate-200 font-medium">Fail Die (불량)</div>
                  <div className="text-[10px] text-rose-400">{failDies}개 ({((failDies / totalDies) * 100).toFixed(1)}%)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              웨이퍼 외곽(Edge Bead 영역)은 식각 및 CMP 공정 특성상 불량 밀도가 상대적으로 높게 집중되는 경향을 반영합니다.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
