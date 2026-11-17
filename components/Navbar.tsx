'use client';

import React from 'react';
import { Cpu, RefreshCw, PlusCircle, Database, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface NavbarProps {
  currentTab: 'overview' | 'lots' | 'inspections' | 'database';
  setCurrentTab: (tab: 'overview' | 'lots' | 'inspections' | 'database') => void;
  isDbConnected: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenNewInspection: () => void;
  onOpenNewLot: () => void;
  onOpenDbModal: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  isDbConnected,
  onRefresh,
  isLoading,
  onOpenNewInspection,
  onOpenNewLot,
  onOpenDbModal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  YieldTrace Web
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Fab Monitoring
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">반도체 공정 Defect & 수율 모니터링 시스템</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Supabase Connection Status Badge */}
            <button
              onClick={onOpenDbModal}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${
                isDbConnected
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border-amber-700/60 text-amber-300 hover:bg-amber-900/60'
              }`}
              title="Supabase 데이터베이스 연동 정보 확인"
            >
              {isDbConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline font-medium">Supabase 연결됨</span>
                  <span className="sm:hidden font-medium">DB 연동</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-medium">데모 모드 (DB 설정)</span>
                  <span className="sm:hidden font-medium">데모</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors disabled:opacity-50"
              title="데이터 새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* New Lot Button */}
            <button
              onClick={onOpenNewLot}
              className="hidden md:flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Lot 추가</span>
            </button>

            {/* New Inspection Button */}
            <button
              onClick={onOpenNewInspection}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-700/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>검사 데이터 등록</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 border-t border-slate-800/80 pt-2 pb-2 text-sm overflow-x-auto">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              currentTab === 'overview'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            📊 종합 모니터링 대시보드
          </button>
          <button
            onClick={() => setCurrentTab('lots')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              currentTab === 'lots'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            📋 Lot별 수율 현황
          </button>
          <button
            onClick={() => setCurrentTab('inspections')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              currentTab === 'inspections'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            🔬 검사 이력 로그 (Inspection)
          </button>
          <button
            onClick={() => setCurrentTab('database')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              currentTab === 'database'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            ⚙️ Supabase DB 스키마 관리
          </button>
        </nav>
      </div>
    </header>
  );
}
