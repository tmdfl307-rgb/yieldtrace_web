'use client';

import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, Copy, Check, Sparkles, RefreshCw, Server } from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: {
    configured: boolean;
    connected: boolean;
    tables: {
      product: number;
      lot: number;
      defect_type: number;
      inspection: number;
    };
    message: string;
  };
  onRefreshDiagnostics: () => Promise<void>;
  onSeedData: () => Promise<{ success: boolean; message: string }>;
}

export default function DatabaseStatusModal({
  isOpen,
  onClose,
  diagnostics,
  onRefreshDiagnostics,
  onSeedData,
}: DatabaseStatusModalProps) {
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const sqlSchemaSnippet = `-- Supabase 4개 테이블 DDL
CREATE TABLE IF NOT EXISTS product (
  product_id VARCHAR(50) PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  device_type VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS lot (
  lot_id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES product(product_id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'RUNNING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS defect_type (
  defect_type_id VARCHAR(50) PRIMARY KEY,
  defect_code VARCHAR(30) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS inspection (
  insp_id VARCHAR(50) PRIMARY KEY,
  lot_id VARCHAR(50) REFERENCES lot(lot_id) ON DELETE CASCADE,
  defect_type_id VARCHAR(50) REFERENCES defect_type(defect_type_id) ON DELETE SET NULL,
  inspect_qty INTEGER NOT NULL CHECK (inspect_qty >= 0),
  defect_qty INTEGER NOT NULL DEFAULT 0 CHECK (defect_qty >= 0),
  inspected_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 설정 (공개 읽기/쓰기 허용)
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot ENABLE ROW LEVEL SECURITY;
ALTER TABLE defect_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public on product" ON product FOR ALL USING (true);
CREATE POLICY "Allow public on lot" ON lot FOR ALL USING (true);
CREATE POLICY "Allow public on defect_type" ON defect_type FOR ALL USING (true);
CREATE POLICY "Allow public on inspection" ON inspection FOR ALL USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await onSeedData();
      setSeedResult(res);
      await onRefreshDiagnostics();
    } catch (err: any) {
      setSeedResult({ success: false, message: err.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/80">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Supabase 데이터베이스 연동 및 스키마 진단</h2>
              <p className="text-xs text-slate-400">환경변수 연동 상태 및 4개 핵심 반도체 모니터링 테이블 검증</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Connection Status Banner */}
          <div className={`p-4 rounded-xl border ${
            diagnostics.connected
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800 text-amber-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                {diagnostics.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {diagnostics.connected ? 'Supabase 클라우드 DB 정상 연동 완료' : '로컬 데모 모드 동작 중 (연동 대기)'}
                  </h4>
                  <p className="mt-1 text-slate-300 leading-relaxed">{diagnostics.message}</p>
                </div>
              </div>
              <button
                onClick={onRefreshDiagnostics}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 transition-colors"
                title="상태 다시 확인"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4 Tables Live Row Counts */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-2 flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>연동 테이블 4종 현황 (Supabase Schema)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">1. product</div>
                <div className="text-lg font-bold text-cyan-300 mt-1">{diagnostics.tables.product}개</div>
                <div className="text-[10px] text-slate-500 mt-0.5">제품 정보</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">2. lot</div>
                <div className="text-lg font-bold text-blue-300 mt-1">{diagnostics.tables.lot}개</div>
                <div className="text-[10px] text-slate-500 mt-0.5">생산 롯트</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">3. defect_type</div>
                <div className="text-lg font-bold text-rose-300 mt-1">{diagnostics.tables.defect_type}개</div>
                <div className="text-[10px] text-slate-500 mt-0.5">결함 유형 분류</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">4. inspection</div>
                <div className="text-lg font-bold text-emerald-300 mt-1">{diagnostics.tables.inspection}개</div>
                <div className="text-[10px] text-slate-500 mt-0.5">실시간 검사 이력</div>
              </div>
            </div>
          </div>

          {/* Seed Initial Sample Data Action */}
          <div className="bg-gradient-to-r from-cyan-950/50 via-slate-950 to-blue-950/50 p-4 rounded-xl border border-cyan-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Supabase 초기 샘플 데이터 시딩 (Seed)</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                테이블이 비어 있는 경우 1-Click으로 현실적인 DRAM, NAND, 3nm AP Lot 및 불량 데이터를 자동 입력합니다.
              </p>
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? '시딩 중...' : '샘플 데이터 주입'}</span>
            </button>
          </div>

          {seedResult && (
            <div className={`p-3 rounded-lg border text-xs ${
              seedResult.success ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}>
              {seedResult.message}
            </div>
          )}

          {/* SQL Schema Copy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300">Supabase SQL Editor DDL 스크립트:</span>
              <button
                onClick={handleCopySql}
                className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사됨!' : 'SQL 복사'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-40">
              {sqlSchemaSnippet}
            </pre>
          </div>

          {/* Vercel Deployment Tips */}
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block mb-1">🚀 Vercel 배포 가이드:</span>
            <p>1. Vercel 프로젝트 대시보드 &gt; <strong>Settings &gt; Environment Variables</strong> 로 이동합니다.</p>
            <p>2. 아래 두 환경변수를 등록합니다:</p>
            <div className="font-mono text-[11px] text-cyan-300 pl-2">
              • NEXT_PUBLIC_SUPABASE_URL<br />
              • NEXT_PUBLIC_SUPABASE_ANON_KEY
            </div>
            <p>3. Git Push 시 Vercel에서 즉시 빌드 및 라이브 서비스로 배포됩니다.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
