import { Product, Lot, DefectType, Inspection } from '@/types/database';

export const INITIAL_PRODUCTS: Product[] = [
  { product_id: 'PRD-DDR5-16G', product_name: '16Gb DDR5 SDRAM (1b nm)', device_type: 'DRAM' },
  { product_id: 'PRD-NAND-1TB', product_name: '1Tb 3D V-NAND V9 (290L)', device_type: 'NAND Flash' },
  { product_id: 'PRD-AP-3NM', product_name: 'Exynos 2500 AI Mobile AP (3nm GAA)', device_type: 'Logic AP' },
  { product_id: 'PRD-CIS-200M', product_name: '200MP Ultra-Fine ISOCELL CIS', device_type: 'CIS' },
  { product_id: 'PRD-HBM3E-24G', product_name: '24GB HBM3E 8-Hi Stack', device_type: 'DRAM' },
];

export const INITIAL_DEFECT_TYPES: DefectType[] = [
  { defect_type_id: 'DFT-PTCL', defect_code: 'PTCL-01', description: '클린룸 파티클 오염 (Particle Contamination)' },
  { defect_type_id: 'DFT-PAT-BRG', defect_code: 'BRDG-02', description: '포토 공정 패턴 브릿지 (Photo Pattern Bridge)' },
  { defect_type_id: 'DFT-SCRATCH', defect_code: 'SCR-03', description: 'CMP 연마 스크래치 (CMP Surface Scratch)' },
  { defect_type_id: 'DFT-ETCH-RES', defect_code: 'ETCH-04', description: '식각 잔류물 결함 (Etch Residue Defect)' },
  { defect_type_id: 'DFT-GATE-BRK', defect_code: 'BRK-05', description: '게이트 산화막 크랙/파손 (Gate Breakdown)' },
  { defect_type_id: 'DFT-SHORT', defect_code: 'SHRT-06', description: '메탈 배선 쇼트 결함 (Metal Line Short)' },
];

export const INITIAL_LOTS: Lot[] = [
  { lot_id: 'LOT-2611-D01', product_id: 'PRD-DDR5-16G', status: 'COMPLETED', created_at: '2026-11-10T08:30:00Z' },
  { lot_id: 'LOT-2611-D02', product_id: 'PRD-DDR5-16G', status: 'COMPLETED', created_at: '2026-11-11T09:15:00Z' },
  { lot_id: 'LOT-2611-D03', product_id: 'PRD-DDR5-16G', status: 'RUNNING', created_at: '2026-11-12T10:00:00Z' },
  { lot_id: 'LOT-2611-N01', product_id: 'PRD-NAND-1TB', status: 'COMPLETED', created_at: '2026-11-11T13:20:00Z' },
  { lot_id: 'LOT-2611-N02', product_id: 'PRD-NAND-1TB', status: 'RUNNING', created_at: '2026-11-13T14:40:00Z' },
  { lot_id: 'LOT-2611-A01', product_id: 'PRD-AP-3NM', status: 'HOLD', created_at: '2026-11-12T16:10:00Z' },
  { lot_id: 'LOT-2611-A02', product_id: 'PRD-AP-3NM', status: 'RUNNING', created_at: '2026-11-14T08:00:00Z' },
  { lot_id: 'LOT-2611-C01', product_id: 'PRD-CIS-200M', status: 'COMPLETED', created_at: '2026-11-13T11:25:00Z' },
  { lot_id: 'LOT-2611-H01', product_id: 'PRD-HBM3E-24G', status: 'RUNNING', created_at: '2026-11-15T09:30:00Z' },
  { lot_id: 'LOT-2611-H02', product_id: 'PRD-HBM3E-24G', status: 'SCRAP', created_at: '2026-11-14T17:45:00Z' },
];

export const INITIAL_INSPECTIONS: Inspection[] = [
  // LOT-2611-D01 (DDR5) - Total: 1000, Defect: 32 -> Yield: 96.8%
  { insp_id: 'INSP-1001', lot_id: 'LOT-2611-D01', defect_type_id: 'DFT-PTCL', inspect_qty: 1000, defect_qty: 14, inspected_at: '2026-11-10T12:00:00Z' },
  { insp_id: 'INSP-1002', lot_id: 'LOT-2611-D01', defect_type_id: 'DFT-SCRATCH', inspect_qty: 1000, defect_qty: 18, inspected_at: '2026-11-10T15:30:00Z' },

  // LOT-2611-D02 (DDR5) - Total: 1200, Defect: 24 -> Yield: 98.0%
  { insp_id: 'INSP-1003', lot_id: 'LOT-2611-D02', defect_type_id: 'DFT-PTCL', inspect_qty: 1200, defect_qty: 9, inspected_at: '2026-11-11T14:00:00Z' },
  { insp_id: 'INSP-1004', lot_id: 'LOT-2611-D02', defect_type_id: 'DFT-PAT-BRG', inspect_qty: 1200, defect_qty: 15, inspected_at: '2026-11-11T18:00:00Z' },

  // LOT-2611-D03 (DDR5) - Total: 1000, Defect: 48 -> Yield: 95.2%
  { insp_id: 'INSP-1005', lot_id: 'LOT-2611-D03', defect_type_id: 'DFT-ETCH-RES', inspect_qty: 1000, defect_qty: 28, inspected_at: '2026-11-12T13:45:00Z' },
  { insp_id: 'INSP-1006', lot_id: 'LOT-2611-D03', defect_type_id: 'DFT-PTCL', inspect_qty: 1000, defect_qty: 20, inspected_at: '2026-11-12T16:15:00Z' },

  // LOT-2611-N01 (NAND) - Total: 1500, Defect: 45 -> Yield: 97.0%
  { insp_id: 'INSP-1007', lot_id: 'LOT-2611-N01', defect_type_id: 'DFT-PAT-BRG', inspect_qty: 1500, defect_qty: 32, inspected_at: '2026-11-12T09:20:00Z' },
  { insp_id: 'INSP-1008', lot_id: 'LOT-2611-N01', defect_type_id: 'DFT-SHORT', inspect_qty: 1500, defect_qty: 13, inspected_at: '2026-11-12T11:40:00Z' },

  // LOT-2611-N02 (NAND) - Total: 1500, Defect: 30 -> Yield: 98.0%
  { insp_id: 'INSP-1009', lot_id: 'LOT-2611-N02', defect_type_id: 'DFT-PTCL', inspect_qty: 1500, defect_qty: 18, inspected_at: '2026-11-14T10:00:00Z' },
  { insp_id: 'INSP-1010', lot_id: 'LOT-2611-N02', defect_type_id: 'DFT-SCRATCH', inspect_qty: 1500, defect_qty: 12, inspected_at: '2026-11-14T15:30:00Z' },

  // LOT-2611-A01 (3nm AP) - Total: 800, Defect: 96 -> Yield: 88.0% (HOLD status - low yield alert!)
  { insp_id: 'INSP-1011', lot_id: 'LOT-2611-A01', defect_type_id: 'DFT-GATE-BRK', inspect_qty: 800, defect_qty: 54, inspected_at: '2026-11-13T10:30:00Z' },
  { insp_id: 'INSP-1012', lot_id: 'LOT-2611-A01', defect_type_id: 'DFT-PAT-BRG', inspect_qty: 800, defect_qty: 42, inspected_at: '2026-11-13T14:10:00Z' },

  // LOT-2611-A02 (3nm AP) - Total: 800, Defect: 40 -> Yield: 95.0%
  { insp_id: 'INSP-1013', lot_id: 'LOT-2611-A02', defect_type_id: 'DFT-PTCL', inspect_qty: 800, defect_qty: 25, inspected_at: '2026-11-15T09:00:00Z' },
  { insp_id: 'INSP-1014', lot_id: 'LOT-2611-A02', defect_type_id: 'DFT-ETCH-RES', inspect_qty: 800, defect_qty: 15, inspected_at: '2026-11-15T11:45:00Z' },

  // LOT-2611-C01 (CIS) - Total: 1000, Defect: 28 -> Yield: 97.2%
  { insp_id: 'INSP-1015', lot_id: 'LOT-2611-C01', defect_type_id: 'DFT-PTCL', inspect_qty: 1000, defect_qty: 16, inspected_at: '2026-11-14T14:20:00Z' },
  { insp_id: 'INSP-1016', lot_id: 'LOT-2611-C01', defect_type_id: 'DFT-SCRATCH', inspect_qty: 1000, defect_qty: 12, inspected_at: '2026-11-14T17:00:00Z' },

  // LOT-2611-H01 (HBM3E) - Total: 600, Defect: 18 -> Yield: 97.0%
  { insp_id: 'INSP-1017', lot_id: 'LOT-2611-H01', defect_type_id: 'DFT-SHORT', inspect_qty: 600, defect_qty: 10, inspected_at: '2026-11-15T13:30:00Z' },
  { insp_id: 'INSP-1018', lot_id: 'LOT-2611-H01', defect_type_id: 'DFT-PTCL', inspect_qty: 600, defect_qty: 8, inspected_at: '2026-11-15T16:00:00Z' },

  // LOT-2611-H02 (HBM3E) - Total: 600, Defect: 110 -> Yield: 81.6% (SCRAP status)
  { insp_id: 'INSP-1019', lot_id: 'LOT-2611-H02', defect_type_id: 'DFT-GATE-BRK', inspect_qty: 600, defect_qty: 70, inspected_at: '2026-11-15T10:15:00Z' },
  { insp_id: 'INSP-1020', lot_id: 'LOT-2611-H02', defect_type_id: 'DFT-PAT-BRG', inspect_qty: 600, defect_qty: 40, inspected_at: '2026-11-15T12:00:00Z' },
];
