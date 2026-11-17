// Database types matching Supabase tables

export interface Product {
  product_id: string;
  product_name: string;
  device_type: string; // e.g. "DRAM", "NAND Flash", "Logic AP", "CIS", "Power IC"
}

export interface Lot {
  lot_id: string;
  product_id: string;
  status: 'RUNNING' | 'COMPLETED' | 'HOLD' | 'SCRAP' | string;
  created_at: string;
  // Joined or calculated fields for UI
  product?: Product;
}

export interface DefectType {
  defect_type_id: string;
  defect_code: string; // e.g. "PTCL-01", "BRDG-02", "SCR-03", "ETCH-04", "BRK-05", "SHRT-06"
  description: string;
}

export interface Inspection {
  insp_id: string;
  lot_id: string;
  defect_type_id: string;
  inspect_qty: number;
  defect_qty: number;
  inspected_at: string;
  // Joined fields
  lot?: Lot;
  defect_type?: DefectType;
}

// Aggregated View / Metric Types
export interface LotYieldSummary {
  lot_id: string;
  product_id: string;
  product_name: string;
  device_type: string;
  status: string;
  created_at: string;
  total_inspect_qty: number;
  total_defect_qty: number;
  yield_rate: number; // percentage (0 - 100)
  defect_rate: number; // percentage
  inspection_count: number;
  last_inspected_at: string | null;
  dominant_defect_code?: string;
}

export interface DefectParetoItem {
  defect_code: string;
  description: string;
  defect_qty: number;
  percentage: number;
  cumulative_percentage: number;
}
