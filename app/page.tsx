'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import KpiCards from '@/components/KpiCards';
import YieldTrendChart from '@/components/YieldTrendChart';
import DefectParetoChart from '@/components/DefectParetoChart';
import WaferMapPreview from '@/components/WaferMapPreview';
import LotTable from '@/components/LotTable';
import InspectionTable from '@/components/InspectionTable';
import NewInspectionModal from '@/components/NewInspectionModal';
import NewLotModal from '@/components/NewLotModal';
import DatabaseStatusModal from '@/components/DatabaseStatusModal';
import {
  getProducts,
  getLots,
  getDefectTypes,
  getInspections,
  createInspection,
  createLot,
  seedInitialDataToSupabase,
  checkDatabaseDiagnostics,
  computeLotSummaries,
  computeDefectPareto,
} from '@/lib/api';
import { Product, Lot, DefectType, Inspection, LotYieldSummary, DefectParetoItem } from '@/types/database';
import { Database, AlertTriangle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'lots' | 'inspections' | 'database'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Raw data from Supabase / Local fallback
  const [products, setProducts] = useState<Product[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [defectTypes, setDefectTypes] = useState<DefectType[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  // Computed data
  const [summaries, setSummaries] = useState<LotYieldSummary[]>([]);
  const [paretoData, setParetoData] = useState<DefectParetoItem[]>([]);

  // Diagnostics & Status
  const [diagnostics, setDiagnostics] = useState({
    configured: false,
    connected: false,
    tables: { product: 0, lot: 0, defect_type: 0, inspection: 0 },
    message: '',
  });

  // Modals state
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [preselectedLotId, setPreselectedLotId] = useState<string | undefined>(undefined);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodRes, lotRes, dtRes, inspRes, diag] = await Promise.all([
        getProducts(),
        getLots(),
        getDefectTypes(),
        getInspections(),
        checkDatabaseDiagnostics(),
      ]);

      setProducts(prodRes.data);
      setLots(lotRes.data);
      setDefectTypes(dtRes.data);
      setInspections(inspRes.data);
      setDiagnostics(diag);

      // Compute summaries & pareto
      const sums = computeLotSummaries(lotRes.data, prodRes.data, inspRes.data);
      setSummaries(sums);

      const pareto = computeDefectPareto(inspRes.data, dtRes.data);
      setParetoData(pareto);
    } catch (err: any) {
      console.error('Data load error:', err);
      showToast('데이터 조회 중 오류 발생: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle new inspection submission
  const handleCreateInspection = async (data: {
    insp_id: string;
    lot_id: string;
    defect_type_id: string;
    inspect_qty: number;
    defect_qty: number;
    inspected_at: string;
  }) => {
    const res = await createInspection(data);
    if (res.success) {
      showToast(`검사 데이터(${data.insp_id})가 성공적으로 등록되었습니다.`);
    } else {
      showToast(`등록 완료 (로컬 임시 반영): ${res.error || ''}`);
    }
    await loadData();
  };

  // Handle new lot submission
  const handleCreateLot = async (data: {
    lot_id: string;
    product_id: string;
    status: string;
    created_at: string;
  }) => {
    const res = await createLot(data);
    if (res.success) {
      showToast(`신규 Lot(${data.lot_id})이 성공적으로 등록되었습니다.`);
    } else {
      showToast(`등록 완료 (로컬 임시 반영): ${res.error || ''}`);
    }
    await loadData();
  };

  const handleOpenLotInspection = (lotId: string) => {
    setPreselectedLotId(lotId);
    setIsInspectionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 border border-cyan-500/80 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl text-xs animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDbConnected={diagnostics.connected}
        onRefresh={loadData}
        isLoading={isLoading}
        onOpenNewInspection={() => {
          setPreselectedLotId(undefined);
          setIsInspectionModalOpen(true);
        }}
        onOpenNewLot={() => setIsLotModalOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Status Notification Banner if in Demo mode */}
        {!diagnostics.connected && (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong>데모 모드 동작 중:</strong> Supabase 연동 키가 설정되지 않아 샘플 반도체 데이터셋으로 구동 중입니다.
              </span>
            </div>
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center space-x-1 whitespace-nowrap self-start sm:self-auto"
            >
              <span>Supabase 연동 안내 및 설정 확인 &rarr;</span>
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <KpiCards summaries={summaries} />

            {/* Yield Trend & Defect Pareto Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <YieldTrendChart summaries={summaries} />
              <DefectParetoChart paretoData={paretoData} />
            </div>

            {/* Silicon Wafer Die Map Visual */}
            <WaferMapPreview summaries={summaries} />

            {/* Quick Lot Status List */}
            <LotTable
              summaries={summaries}
              onSelectLotForInspection={handleOpenLotInspection}
              onOpenNewLot={() => setIsLotModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: LOT MONITORING TABLE */}
        {currentTab === 'lots' && (
          <div className="space-y-4">
            <LotTable
              summaries={summaries}
              onSelectLotForInspection={handleOpenLotInspection}
              onOpenNewLot={() => setIsLotModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: RAW INSPECTION RECORDS TABLE */}
        {currentTab === 'inspections' && (
          <div className="space-y-4">
            <InspectionTable
              inspections={inspections}
              defectTypes={defectTypes}
              lots={lots}
              onOpenNewInspection={() => {
                setPreselectedLotId(undefined);
                setIsInspectionModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 4: DATABASE & SCHEMA MANAGEMENT */}
        {currentTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <span>Supabase 데이터베이스 연동 현황 및 테이블 구조</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    반도체 결함 & 수율 모니터링을 위한 4개 테이블 (`product`, `lot`, `defect_type`, `inspection`) 실시간 조회 및 동기화
                  </p>
                </div>
                <button
                  onClick={() => setIsDbModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md transition-colors self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>연동 진단 & 샘플 데이터 시딩</span>
                </button>
              </div>

              {/* Table Structure Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. product */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-sm">1. product</span>
                    <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {products.length}개 레코드
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">생산 제품군 및 디바이스 사양 마스터 테이블</p>
                  <div className="font-mono text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                    <div>• product_id (VARCHAR PK) - 제품 식별코드</div>
                    <div>• product_name (VARCHAR) - 제품 명칭</div>
                    <div>• device_type (VARCHAR) - 디바이스 분류 (DRAM, NAND 등)</div>
                  </div>
                </div>

                {/* 2. lot */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-400 font-bold text-sm">2. lot</span>
                    <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {lots.length}개 레코드
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">생산 롯트 단위 및 공정 진행 상태 테이블</p>
                  <div className="font-mono text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                    <div>• lot_id (VARCHAR PK) - Lot 식별코드</div>
                    <div>• product_id (VARCHAR FK) - 제품 외래키</div>
                    <div>• status (VARCHAR) - RUNNING, COMPLETED, HOLD, SCRAP</div>
                    <div>• created_at (TIMESTAMPTZ) - 투입 일시</div>
                  </div>
                </div>

                {/* 3. defect_type */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-rose-400 font-bold text-sm">3. defect_type</span>
                    <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {defectTypes.length}개 레코드
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">공정 결함 분류 코드 및 상세 설명 마스터 테이블</p>
                  <div className="font-mono text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                    <div>• defect_type_id (VARCHAR PK) - 결함 유형 ID</div>
                    <div>• defect_code (VARCHAR UNIQUE) - 결함 코드 (PTCL-01 등)</div>
                    <div>• description (TEXT) - 결함 상세 원인 설명</div>
                  </div>
                </div>

                {/* 4. inspection */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold text-sm">4. inspection</span>
                    <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {inspections.length}개 레코드
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">웨이퍼 인스펙션 설비 실시간 검출 결과 로그 테이블</p>
                  <div className="font-mono text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                    <div>• insp_id (VARCHAR PK) - 검사 고유 ID</div>
                    <div>• lot_id (VARCHAR FK) - 대상 Lot</div>
                    <div>• defect_type_id (VARCHAR FK) - 검출 결함 코드</div>
                    <div>• inspect_qty (INTEGER) - 총 검사 수량</div>
                    <div>• defect_qty (INTEGER) - 검출 불량 수</div>
                    <div>• inspected_at (TIMESTAMPTZ) - 검사 수행 일시</div>
                  </div>
                </div>
              </div>

              {/* Vercel Environment Variables Instruction */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Vercel 배포 시 환경 변수 설정 안내</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Vercel 배포 후 Supabase 데이터베이스와 실시간으로 동기화하려면 Vercel 대시보드의
                  <span className="text-cyan-300 font-medium"> [Project Settings] &gt; [Environment Variables]</span> 에서
                  아래 두 환경 변수를 등록해 주시면 빌드 시 자동 연동됩니다.
                </p>
                <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-slate-300 space-y-1">
                  <div><span className="text-cyan-400">NEXT_PUBLIC_SUPABASE_URL</span> = https://[프로젝트-ID].supabase.co</div>
                  <div><span className="text-cyan-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> = eyJhbGciOi...[Supabase 익명 Anon Key]</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>YieldTrace Web · Semiconductor Fab Defect & Yield Monitoring System · Powered by Next.js & Supabase</p>
      </footer>

      {/* Modals */}
      <NewInspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        lots={lots}
        defectTypes={defectTypes}
        preselectedLotId={preselectedLotId}
        onSubmit={handleCreateInspection}
      />

      <NewLotModal
        isOpen={isLotModalOpen}
        onClose={() => setIsLotModalOpen(false)}
        products={products}
        onSubmit={handleCreateLot}
      />

      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        diagnostics={diagnostics}
        onRefreshDiagnostics={loadData}
        onSeedData={seedInitialDataToSupabase}
      />
    </div>
  );
}
