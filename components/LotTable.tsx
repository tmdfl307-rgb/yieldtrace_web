'use client';

import React, { useState } from 'react';
import { Search, Filter, Plus, CheckCircle, Clock, AlertTriangle, XCircle, ArrowUpDown } from 'lucide-react';
import { LotYieldSummary } from '@/types/database';

interface LotTableProps {
  summaries: LotYieldSummary[];
  onSelectLotForInspection: (lotId: string) => void;
  onOpenNewLot: () => void;
}

export default function LotTable({
  summaries,
  onSelectLotForInspection,
  onOpenNewLot,
}: LotTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'yield_rate' | 'created_at' | 'lot_id'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = summaries.filter(s => {
    const matchesSearch =
      s.lot_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.device_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'yield_rate') comparison = a.yield_rate - b.yield_rate;
    else if (sortField === 'lot_id') comparison = a.lot_id.localeCompare(b.lot_id);
    else comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortAsc ? comparison : -comparison;
  });

  const toggleSort = (field: 'yield_rate' | 'created_at' | 'lot_id') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Clock className="w-3 h-3 mr-1" />
            진행중 (RUN)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            완료 (DONE)
          </span>
        );
      case 'HOLD':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            보류 (HOLD)
          </span>
        );
      case 'SCRAP':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-800">
            <XCircle className="w-3 h-3 mr-1" />
            폐기 (SCRAP)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-300 bg-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Table Header with Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <span>📋 반도체 Lot별 수율 & 상태 현황</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              총 {summaries.length}개 Lot
            </span>
          </h3>
          <p className="text-xs text-slate-400">각 Lot의 총 검사 수량, 결함 수량 및 실시간 수율 모니터링</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Lot ID, 제품명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-700 pl-9 pr-3 py-1.5 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">전체 상태</option>
              <option value="RUNNING">RUNNING (진행중)</option>
              <option value="COMPLETED">COMPLETED (완료)</option>
              <option value="HOLD">HOLD (보류)</option>
              <option value="SCRAP">SCRAP (폐기)</option>
            </select>
          </div>

          {/* Add Lot Button */}
          <button
            onClick={onOpenNewLot}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>신규 Lot</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-medium">
            <tr>
              <th
                onClick={() => toggleSort('lot_id')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center space-x-1">
                  <span>Lot ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3.5">제품명 (Product)</th>
              <th className="py-3 px-3.5">디바이스 종류</th>
              <th className="py-3 px-3.5">진행 상태 (Status)</th>
              <th className="py-3 px-3.5 text-right">검사 수량</th>
              <th className="py-3 px-3.5 text-right">불량 수량</th>
              <th
                onClick={() => toggleSort('yield_rate')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>수율 (Yield)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3.5 text-center">주요 불량</th>
              <th className="py-3 px-3.5 text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 text-sm">
                  검색 조건에 맞는 Lot이 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              sorted.map((lot) => (
                <tr key={lot.lot_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-cyan-300 whitespace-nowrap">
                    {lot.lot_id}
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-200 max-w-[200px] truncate" title={lot.product_name}>
                    {lot.product_name}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                      {lot.device_type}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {getStatusBadge(lot.status)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-medium text-slate-300">
                    {lot.total_inspect_qty.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-medium text-rose-400">
                    {lot.total_defect_qty.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            lot.yield_rate >= 95 ? 'bg-emerald-400' : lot.yield_rate >= 90 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, lot.yield_rate))}%` }}
                        />
                      </div>
                      <span className={`font-bold ${
                        lot.yield_rate >= 95 ? 'text-emerald-400' : lot.yield_rate >= 90 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {lot.yield_rate.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    {lot.dominant_defect_code ? (
                      <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/60">
                        {lot.dominant_defect_code}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">무결함</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => onSelectLotForInspection(lot.lot_id)}
                      className="px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-800/80 border border-cyan-800 rounded transition-colors"
                      title="이 Lot에 새 검사 데이터 추가"
                    >
                      + 검사 등록
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
