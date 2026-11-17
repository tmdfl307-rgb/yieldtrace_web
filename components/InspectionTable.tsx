'use client';

import React, { useState } from 'react';
import { Search, Filter, Microscope, Calendar, CheckCircle2 } from 'lucide-react';
import { Inspection, DefectType, Lot } from '@/types/database';

interface InspectionTableProps {
  inspections: Inspection[];
  defectTypes: DefectType[];
  lots: Lot[];
  onOpenNewInspection: () => void;
}

export default function InspectionTable({
  inspections,
  defectTypes,
  lots,
  onOpenNewInspection,
}: InspectionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDefectCode, setSelectedDefectCode] = useState('ALL');
  const [selectedLotId, setSelectedLotId] = useState('ALL');

  const filtered = inspections.filter(insp => {
    const defectCode = insp.defect_type?.defect_code || '';
    const lotId = insp.lot_id || '';
    const inspId = insp.insp_id || '';

    const matchesSearch =
      lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defectCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDefect = selectedDefectCode === 'ALL' || defectCode === selectedDefectCode;
    const matchesLot = selectedLotId === 'ALL' || lotId === selectedLotId;

    return matchesSearch && matchesDefect && matchesLot;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <Microscope className="w-5 h-5 text-cyan-400" />
            <span>🔬 반도체 공정 검사 상세 로그 (Inspection Records)</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              총 {inspections.length}건 기록
            </span>
          </h3>
          <p className="text-xs text-slate-400">Supabase `inspection` 테이블에 적재된 실시간 검사 및 결함 검출 이력</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="검사 ID, Lot ID 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-700 pl-9 pr-3 py-1.5 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-40 sm:w-48"
            />
          </div>

          {/* Lot Filter */}
          <select
            value={selectedLotId}
            onChange={(e) => setSelectedLotId(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">전체 Lot</option>
            {lots.map(l => (
              <option key={l.lot_id} value={l.lot_id}>{l.lot_id}</option>
            ))}
          </select>

          {/* Defect Code Filter */}
          <select
            value={selectedDefectCode}
            onChange={(e) => setSelectedDefectCode(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">전체 결함 유형</option>
            {defectTypes.map(d => (
              <option key={d.defect_type_id} value={d.defect_code}>{d.defect_code} - {d.description.substring(0, 15)}</option>
            ))}
          </select>

          {/* Add Inspection Button */}
          <button
            onClick={onOpenNewInspection}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
          >
            <span>+ 검사 등록</span>
          </button>
        </div>
      </div>

      {/* Inspection Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-medium">
            <tr>
              <th className="py-3 px-3.5">검사 번호 (insp_id)</th>
              <th className="py-3 px-3.5">Lot ID</th>
              <th className="py-3 px-3.5">결함 코드 (Defect Code)</th>
              <th className="py-3 px-3.5">결함 세부 설명</th>
              <th className="py-3 px-3.5 text-right">검사 수량 (ea)</th>
              <th className="py-3 px-3.5 text-right">검출 불량 (ea)</th>
              <th className="py-3 px-3.5 text-right">불량률 (%)</th>
              <th className="py-3 px-3.5 text-right">검사 일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                  검색 조건에 일치하는 검사 로그가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((insp) => {
                const inspectQty = Number(insp.inspect_qty) || 0;
                const defectQty = Number(insp.defect_qty) || 0;
                const rate = inspectQty > 0 ? (defectQty / inspectQty) * 100 : 0;
                const defect = defectTypes.find(d => d.defect_type_id === insp.defect_type_id) || insp.defect_type;

                return (
                  <tr key={insp.insp_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-cyan-400 whitespace-nowrap">
                      {insp.insp_id}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-200 whitespace-nowrap">
                      {insp.lot_id}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/70">
                        {defect?.defect_code || insp.defect_type_id}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-300 max-w-xs truncate" title={defect?.description}>
                      {defect?.description || '미등록 결함 유형'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-medium text-slate-300">
                      {inspectQty.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-rose-400">
                      {defectQty.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <span className={`font-semibold ${rate > 5 ? 'text-rose-400' : rate > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right text-slate-400 whitespace-nowrap">
                      {insp.inspected_at ? new Date(insp.inspected_at).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
