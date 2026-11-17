'use client';

import React, { useState } from 'react';
import { X, Layers, AlertCircle, Plus } from 'lucide-react';
import { Product } from '@/types/database';

interface NewLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (data: {
    lot_id: string;
    product_id: string;
    status: string;
    created_at: string;
  }) => Promise<void>;
}

export default function NewLotModal({
  isOpen,
  onClose,
  products,
  onSubmit,
}: NewLotModalProps) {
  const [lotId, setLotId] = useState(`LOT-2611-L0${Math.floor(Math.random() * 90 + 10)}`);
  const [productId, setProductId] = useState(products[0]?.product_id || '');
  const [status, setStatus] = useState('RUNNING');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotId.trim()) {
      setErrorMsg('Lot ID를 입력해주세요.');
      return;
    }
    if (!productId) {
      setErrorMsg('제품을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        lot_id: lotId.trim(),
        product_id: productId,
        status: status,
        created_at: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lot 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>신규 생산 Lot 등록 (New Lot)</span>
            </h2>
            <p className="text-xs text-slate-400">Supabase `lot` 테이블에 새 공정 Lot 추가</p>
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

          {/* Lot ID */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Lot ID 식별 번호 <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-500"
              placeholder="예: LOT-2611-D04"
              required
            />
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              생산 제품 (product_id) <span className="text-cyan-400">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="">제품 선택</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  [{p.device_type}] {p.product_name} ({p.product_id})
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              초기 공정 상태 (status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="RUNNING">RUNNING (공정 진행중)</option>
              <option value="COMPLETED">COMPLETED (공정 완료)</option>
              <option value="HOLD">HOLD (이상 감지 보류)</option>
              <option value="SCRAP">SCRAP (불량 폐기)</option>
            </select>
          </div>

          {/* Footer */}
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
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? '생성 중...' : '신규 Lot 생성'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
