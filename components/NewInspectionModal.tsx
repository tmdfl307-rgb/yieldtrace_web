'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle, Calculator } from 'lucide-react';
import { Lot, DefectType } from '@/types/database';

interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lots: Lot[];
  defectTypes: DefectType[];
  preselectedLotId?: string;
  onSubmit: (data: {
    insp_id: string;
    lot_id: string;
    defect_type_id: string;
    inspect_qty: number;
    defect_qty: number;
    inspected_at: string;
  }) => Promise<void>;
}

export default function NewInspectionModal({
  isOpen,
  onClose,
  lots,
  defectTypes,
  preselectedLotId,
  onSubmit,
}: NewInspectionModalProps) {
  const [lotId, setLotId] = useState(preselectedLotId || lots[0]?.lot_id || '');
  const [defectTypeId, setDefectTypeId] = useState(defectTypes[0]?.defect_type_id || '');
  const [inspectQty, setInspectQty] = useState<number>(1000);
  const [defectQty, setDefectQty] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const defaultInspId = `INSP-${Date.now().toString().slice(-6)}`;

  const calculatedYield = inspectQty > 0
    ? Math.max(0, ((inspectQty - defectQty) / inspectQty) * 100).toFixed(2)
    : '100.00';
  const calculatedDefectRate = inspectQty > 0
    ? ((defectQty / inspectQty) * 100).toFixed(2)
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotId) {
      setErrorMsg('검사 대상 Lot을 선택해주세요.');
      return;
    }
    if (!defectTypeId) {
      setErrorMsg('결함 유형을 선택해주세요.');
      return;
    }
    if (inspectQty <= 0) {
      setErrorMsg('검사 수량은 1개 이상이어야 합니다.');
      return;
    }
    if (defectQty < 0 || defectQty > inspectQty) {
      setErrorMsg('불량 수량은 0 이상이며 검사 수량을 초과할 수 없습니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        insp_id: defaultInspId,
        lot_id: lotId,
        defect_type_id: defectTypeId,
        inspect_qty: inspectQty,
        defect_qty: defectQty,
        inspected_at: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>신규 공정 검사 데이터 등록 (New Inspection)</span>
            </h2>
            <p className="text-xs text-slate-400">Supabase `inspection` 테이블에 실시간 검사 데이터 저장</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Lot Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              대상 Lot (lot_id) <span className="text-cyan-400">*</span>
            </label>
            <select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="">선택하세요</option>
              {lots.map(l => (
                <option key={l.lot_id} value={l.lot_id}>
                  {l.lot_id} [{l.status}] - {l.product?.product_name || l.product_id}
                </option>
              ))}
            </select>
          </div>

          {/* Defect Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              검출 결함 유형 (defect_type_id) <span className="text-cyan-400">*</span>
            </label>
            <select
              value={defectTypeId}
              onChange={(e) => setDefectTypeId(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="">선택하세요</option>
              {defectTypes.map(d => (
                <option key={d.defect_type_id} value={d.defect_type_id}>
                  [{d.defect_code}] {d.description}
                </option>
              ))}
            </select>
          </div>

          {/* Inspect Qty & Defect Qty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                검사 수량 (inspect_qty) <span className="text-cyan-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={inspectQty}
                onChange={(e) => setInspectQty(parseInt(e.target.value) || 0)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                검출 불량 수 (defect_qty) <span className="text-cyan-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                max={inspectQty}
                value={defectQty}
                onChange={(e) => setDefectQty(parseInt(e.target.value) || 0)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Real-time Calculation Preview Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400 font-medium pb-1 border-b border-slate-800">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>실시간 수율 시뮬레이션 결과</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">예상 공정 수율:</span>
              <span className={`text-base font-extrabold ${Number(calculatedYield) >= 95 ? 'text-emerald-400' : Number(calculatedYield) >= 90 ? 'text-amber-400' : 'text-rose-400'}`}>
                {calculatedYield}%
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>불량률:</span>
              <span className="text-rose-400 font-semibold">{calculatedDefectRate}%</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-600/20 disabled:opacity-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? '등록 중...' : '검사 데이터 저장'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
