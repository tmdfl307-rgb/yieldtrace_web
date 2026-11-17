-- =========================================================
-- YieldTrace Web : 반도체 공정 Defect & 수율 모니터링 시스템
-- Supabase Table Schema & Sample DDL
-- =========================================================

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
  status VARCHAR(30) NOT NULL DEFAULT 'RUNNING', -- RUNNING(진행중), COMPLETED(완료), HOLD(보류), SCRAP(폐기)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 불량 유형(Defect Type) 테이블
CREATE TABLE IF NOT EXISTS defect_type (
  defect_type_id VARCHAR(50) PRIMARY KEY,
  defect_code VARCHAR(30) NOT NULL UNIQUE, -- 예: PTCL-01, BRDG-02, SCR-03, ETCH-04, BRK-05, SHRT-06
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

-- =========================================================
-- Row Level Security (RLS) 정책 설정 (공개 접근 허용)
-- =========================================================
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot ENABLE ROW LEVEL SECURITY;
ALTER TABLE defect_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public access product" ON product;
  CREATE POLICY "Public access product" ON product FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public access lot" ON lot;
  CREATE POLICY "Public access lot" ON lot FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public access defect_type" ON defect_type;
  CREATE POLICY "Public access defect_type" ON defect_type FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public access inspection" ON inspection;
  CREATE POLICY "Public access inspection" ON inspection FOR ALL USING (true);
END $$;
