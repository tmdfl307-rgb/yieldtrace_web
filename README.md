# YieldTrace Web 🏭 (반도체 공정 Defect & 수율 모니터링 시스템)

**YieldTrace Web**은 반도체 제조 공정(Fab)의 실시간 웨이퍼 수율(Yield) 및 불량(Defect) 데이터를 모니터링하고 분석하는 웹 애플리케이션입니다.  
**Next.js (App Router, TypeScript) + Tailwind CSS + Supabase (`@supabase/supabase-js`)** 기술 스택으로 구성되어 있으며, **Vercel**에 즉시 배포할 수 있도록 최적화되어 있습니다.

---

## 🚀 주요 기능

1. **실시간 종합 대시보드 (KPIs & Metrics)**
   - 반도체 공정 종합 수율 (Overall Yield Rate, %) 및 목표 수율(95.0%) 달성률
   - 전체 모니터링 Lot 수, 누적 검사 수량(Inspect Qty), 총 검출 불량 수량(Defects)
   - PPM(Parts Per Million) 결함 지수 및 이상 Lot(Hold/Scrap) 경고 알림

2. **수율 추이 분석 (Yield Trend Chart)**
   - 시간/Lot 순서에 따른 실시간 공정 수율 변동 추이 꺾은선 차트 (Recharts)
   - 공정 관리 한계선(LCL 90%) 및 수율 목표선(Target 95%) 가이드라인 제공

3. **결함 유형 파레토 분석 (Defect Pareto Chart)**
   - 주요 불량 코드(Defect Code)별 검출 빈도(막대) 및 누적 기여율(선) 분석
   - 80/20 법칙에 따른 주요 결함 원인(Particle, Gate Breakdown, Pattern Bridge 등) 집중 분석

4. **300mm 웨이퍼 다이 맵 (Silicon Wafer Die Map)**
   - 12인치(300mm) 실리콘 웨이퍼 내 Pass Die(양품) 및 Fail Die(불량)의 위치적 분포 시각화
   - 외곽(Edge Bead) 영역 결함 집중 현상 등 반도체 공정 특성 시뮬레이션 반영

5. **Lot & Inspection 상세 조회 및 신규 등록**
   - Lot별 상태(RUNNING, COMPLETED, HOLD, SCRAP) 및 제품별 필터링/검색
   - 신규 공정 검사 데이터(`inspection`) 실시간 등록 모달 (수율 자동 계산 프리뷰)
   - 신규 생산 Lot(`lot`) 생성 모달

6. **Supabase 4개 테이블 연동 & 데모 모드 지원**
   - `product`, `lot`, `defect_type`, `inspection` 4개 테이블 실시간 조회/저장
   - `.env.local` 키 설정 전에도 완전한 기능 체험이 가능한 Realistic Semiconductor Demo Mode 제공
   - 클릭 한 번으로 Supabase 클라우드 데이터베이스에 초기 반도체 데이터를 채워 넣는 **1-Click Seeding 기능**

---

## 🗄️ 데이터베이스 스키마 구조 (Supabase)

Supabase 대시보드의 **SQL Editor**에서 아래 4개 테이블을 확인하거나 생성할 수 있습니다 (`supabase_schema.sql` 파일 포함):

```sql
-- 1. 제품(Product) 테이블
CREATE TABLE IF NOT EXISTS product (
  product_id VARCHAR(50) PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  device_type VARCHAR(50) NOT NULL -- 예: DRAM, NAND Flash, Logic AP, CIS, Power IC
);

-- 2. 롯트(Lot) 테이블
CREATE TABLE IF NOT EXISTS lot (
  lot_id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES product(product_id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'RUNNING', -- RUNNING, COMPLETED, HOLD, SCRAP
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 불량 유형(Defect Type) 테이블
CREATE TABLE IF NOT EXISTS defect_type (
  defect_type_id VARCHAR(50) PRIMARY KEY,
  defect_code VARCHAR(30) NOT NULL UNIQUE, -- 예: PTCL-01, BRDG-02, SCR-03
  description TEXT
);

-- 4. 검사(Inspection) 테이블
CREATE TABLE IF NOT EXISTS inspection (
  insp_id VARCHAR(50) PRIMARY KEY,
  lot_id VARCHAR(50) REFERENCES lot(lot_id) ON DELETE CASCADE,
  defect_type_id VARCHAR(50) REFERENCES defect_type(defect_type_id) ON DELETE SET NULL,
  inspect_qty INTEGER NOT NULL CHECK (inspect_qty >= 0),
  defect_qty INTEGER NOT NULL DEFAULT 0 CHECK (defect_qty >= 0),
  inspected_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ⚙️ 로컬 실행 방법

1. **환경 변수 설정 (`.env.local`)**
   `.env.local` 파일에 본인의 Supabase 프로젝트 정보를 입력합니다:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
   ```

2. **패키지 설치 및 실행**
   ```bash
   pnpm install  # 또는 npm install
   pnpm run dev  # 또는 npm run dev
   ```
   브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 🌐 Vercel 배포 방법

1. GitHub 레포지토리에 본 프로젝트를 푸시합니다.
2. [Vercel](https://vercel.com) 대시보드에서 **Add New... > Project**를 선택하고 해당 레포지토리를 불러옵니다.
3. **Environment Variables**에 다음 두 변수를 추가합니다:
   - `NEXT_PUBLIC_SUPABASE_URL`: 본인의 Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 본인의 Supabase Anon Key
4. **Deploy** 버튼을 누르면 배포가 완료됩니다!
