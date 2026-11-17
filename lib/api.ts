import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Lot, DefectType, Inspection, LotYieldSummary, DefectParetoItem } from '@/types/database';
import { INITIAL_PRODUCTS, INITIAL_DEFECT_TYPES, INITIAL_LOTS, INITIAL_INSPECTIONS } from './mockData';

// In-memory fallback cache so that UI modifications are interactive even if Supabase is not yet connected
let localProducts = [...INITIAL_PRODUCTS];
let localDefectTypes = [...INITIAL_DEFECT_TYPES];
let localLots = [...INITIAL_LOTS];
let localInspections = [...INITIAL_INSPECTIONS];

export interface FetchResult<T> {
  data: T;
  source: 'supabase' | 'local_fallback';
  error?: string | null;
}

// 1. Fetch Products from Supabase 'product' table
export async function getProducts(): Promise<FetchResult<Product[]>> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('product').select('*').order('product_id');
      if (!error && data && data.length > 0) {
        return { data: data as Product[], source: 'supabase' };
      }
      if (error) {
        console.warn('Supabase product query error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase product fetch exception:', err.message);
    }
  }
  return { data: localProducts, source: 'local_fallback' };
}

// 2. Fetch Lots from Supabase 'lot' table
export async function getLots(): Promise<FetchResult<Lot[]>> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('lot').select('*, product:product_id(*)').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return { data: data as Lot[], source: 'supabase' };
      }
      if (error) {
        console.warn('Supabase lot query error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase lot fetch exception:', err.message);
    }
  }
  const lotsWithProduct = localLots.map(l => ({
    ...l,
    product: localProducts.find(p => p.product_id === l.product_id)
  }));
  return { data: lotsWithProduct, source: 'local_fallback' };
}

// 3. Fetch Defect Types from Supabase 'defect_type' table
export async function getDefectTypes(): Promise<FetchResult<DefectType[]>> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('defect_type').select('*').order('defect_code');
      if (!error && data && data.length > 0) {
        return { data: data as DefectType[], source: 'supabase' };
      }
      if (error) {
        console.warn('Supabase defect_type query error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase defect_type fetch exception:', err.message);
    }
  }
  return { data: localDefectTypes, source: 'local_fallback' };
}

// 4. Fetch Inspections from Supabase 'inspection' table
export async function getInspections(): Promise<FetchResult<Inspection[]>> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('inspection')
        .select('*, lot:lot_id(*), defect_type:defect_type_id(*)')
        .order('inspected_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return { data: data as Inspection[], source: 'supabase' };
      }
      if (error) {
        console.warn('Supabase inspection query error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase inspection fetch exception:', err.message);
    }
  }

  const inspectionsWithJoins = localInspections.map(insp => ({
    ...insp,
    lot: localLots.find(l => l.lot_id === insp.lot_id),
    defect_type: localDefectTypes.find(d => d.defect_type_id === insp.defect_type_id)
  }));
  return { data: inspectionsWithJoins, source: 'local_fallback' };
}

// 5. Insert New Inspection into Supabase 'inspection' table
export async function createInspection(newInsp: Omit<Inspection, 'lot' | 'defect_type'>): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('inspection').insert([{
        insp_id: newInsp.insp_id,
        lot_id: newInsp.lot_id,
        defect_type_id: newInsp.defect_type_id,
        inspect_qty: Number(newInsp.inspect_qty),
        defect_qty: Number(newInsp.defect_qty),
        inspected_at: newInsp.inspected_at || new Date().toISOString()
      }]);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error inserting inspection into Supabase:', err);
      localInspections.unshift(newInsp);
      return { success: false, error: err.message };
    }
  } else {
    localInspections.unshift(newInsp);
    return { success: true };
  }
}

// 6. Insert New Lot into Supabase 'lot' table
export async function createLot(newLot: Omit<Lot, 'product'>): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('lot').insert([{
        lot_id: newLot.lot_id,
        product_id: newLot.product_id,
        status: newLot.status,
        created_at: newLot.created_at || new Date().toISOString()
      }]);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error inserting lot into Supabase:', err);
      localLots.unshift(newLot);
      return { success: false, error: err.message };
    }
  } else {
    localLots.unshift(newLot);
    return { success: true };
  }
}

// 7. Insert New Product into Supabase 'product' table
export async function createProduct(newProduct: Product): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('product').insert([newProduct]);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error inserting product into Supabase:', err);
      localProducts.push(newProduct);
      return { success: false, error: err.message };
    }
  } else {
    localProducts.push(newProduct);
    return { success: true };
  }
}

// 8. Insert New Defect Type into Supabase 'defect_type' table
export async function createDefectType(newDefectType: DefectType): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('defect_type').insert([newDefectType]);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error inserting defect_type into Supabase:', err);
      localDefectTypes.push(newDefectType);
      return { success: false, error: err.message };
    }
  } else {
    localDefectTypes.push(newDefectType);
    return { success: true };
  }
}

// 9. Seed Initial Data into Supabase
export async function seedInitialDataToSupabase(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase URL과 Anon Key가 아직 .env.local에 설정되지 않았습니다. 환경 변수를 먼저 입력해 주세요.'
    };
  }

  try {
    const { error: pErr } = await supabase.from('product').upsert(INITIAL_PRODUCTS, { onConflict: 'product_id' });
    if (pErr) throw new Error(`Product 등록 실패: ${pErr.message}`);

    const { error: dtErr } = await supabase.from('defect_type').upsert(INITIAL_DEFECT_TYPES, { onConflict: 'defect_type_id' });
    if (dtErr) throw new Error(`DefectType 등록 실패: ${dtErr.message}`);

    const { error: lErr } = await supabase.from('lot').upsert(INITIAL_LOTS, { onConflict: 'lot_id' });
    if (lErr) throw new Error(`Lot 등록 실패: ${lErr.message}`);

    const { error: iErr } = await supabase.from('inspection').upsert(INITIAL_INSPECTIONS, { onConflict: 'insp_id' });
    if (iErr) throw new Error(`Inspection 등록 실패: ${iErr.message}`);

    return {
      success: true,
      message: 'Supabase의 4개 테이블(product, lot, defect_type, inspection)에 초기 반도체 공정 데이터가 성공적으로 등록되었습니다!'
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// 10. Check Supabase Diagnostics & Table counts
export async function checkDatabaseDiagnostics() {
  const isConfigured = isSupabaseConfigured();
  if (!isConfigured) {
    return {
      configured: false,
      connected: false,
      tables: {
        product: localProducts.length,
        lot: localLots.length,
        defect_type: localDefectTypes.length,
        inspection: localInspections.length,
      },
      message: '현재 로컬 데모 모드로 동작 중입니다 (.env.local 설정 대기)'
    };
  }

  try {
    const [pRes, lRes, dRes, iRes] = await Promise.all([
      supabase.from('product').select('*', { count: 'exact', head: true }),
      supabase.from('lot').select('*', { count: 'exact', head: true }),
      supabase.from('defect_type').select('*', { count: 'exact', head: true }),
      supabase.from('inspection').select('*', { count: 'exact', head: true }),
    ]);

    const error = pRes.error || lRes.error || dRes.error || iRes.error;
    if (error) {
      return {
        configured: true,
        connected: false,
        tables: { product: 0, lot: 0, defect_type: 0, inspection: 0 },
        message: `Supabase 연결 에러: ${error.message} (테이블이 생성되어 있는지 확인하세요)`
      };
    }

    return {
      configured: true,
      connected: true,
      tables: {
        product: pRes.count ?? 0,
        lot: lRes.count ?? 0,
        defect_type: dRes.count ?? 0,
        inspection: iRes.count ?? 0,
      },
      message: 'Supabase와 정상적으로 연결되었습니다.'
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      tables: { product: 0, lot: 0, defect_type: 0, inspection: 0 },
      message: `연결 시도 중 예외 발생: ${err.message}`
    };
  }
}

// Helper calculation functions for Semiconductor Yield Analysis
export function computeLotSummaries(lots: Lot[], products: Product[], inspections: Inspection[]): LotYieldSummary[] {
  return lots.map(lot => {
    const prod = products.find(p => p.product_id === lot.product_id) || lot.product;
    const lotInspections = inspections.filter(i => i.lot_id === lot.lot_id);

    const totalInspect = lotInspections.reduce((sum, i) => sum + (Number(i.inspect_qty) || 0), 0);
    const totalDefect = lotInspections.reduce((sum, i) => sum + (Number(i.defect_qty) || 0), 0);

    const yieldRate = totalInspect > 0 ? Math.max(0, Math.min(100, ((totalInspect - totalDefect) / totalInspect) * 100)) : 100;
    const defectRate = totalInspect > 0 ? (totalDefect / totalInspect) * 100 : 0;

    const defectCounts: Record<string, number> = {};
    lotInspections.forEach(i => {
      const code = i.defect_type?.defect_code || i.defect_type_id;
      defectCounts[code] = (defectCounts[code] || 0) + Number(i.defect_qty);
    });
    let dominantDefect: string | undefined = undefined;
    let maxCount = 0;
    Object.entries(defectCounts).forEach(([code, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantDefect = code;
      }
    });

    const lastInsp = lotInspections.sort((a, b) => new Date(b.inspected_at).getTime() - new Date(a.inspected_at).getTime())[0];

    return {
      lot_id: lot.lot_id,
      product_id: lot.product_id,
      product_name: prod?.product_name || lot.product_id,
      device_type: prod?.device_type || 'Unknown',
      status: lot.status,
      created_at: lot.created_at,
      total_inspect_qty: totalInspect,
      total_defect_qty: totalDefect,
      yield_rate: Number(yieldRate.toFixed(2)),
      defect_rate: Number(defectRate.toFixed(2)),
      inspection_count: lotInspections.length,
      last_inspected_at: lastInsp ? lastInsp.inspected_at : null,
      dominant_defect_code: dominantDefect
    };
  });
}

// Pareto Calculation for Defect Types
export function computeDefectPareto(inspections: Inspection[], defectTypes: DefectType[]): DefectParetoItem[] {
  const defectMap: Record<string, { code: string; desc: string; qty: number }> = {};

  defectTypes.forEach(d => {
    defectMap[d.defect_type_id] = {
      code: d.defect_code,
      desc: d.description,
      qty: 0
    };
  });

  let totalDefects = 0;
  inspections.forEach(insp => {
    const qty = Number(insp.defect_qty) || 0;
    totalDefects += qty;
    if (defectMap[insp.defect_type_id]) {
      defectMap[insp.defect_type_id].qty += qty;
    } else {
      defectMap[insp.defect_type_id] = {
        code: insp.defect_type?.defect_code || insp.defect_type_id,
        desc: insp.defect_type?.description || '기타 불량',
        qty: qty
      };
    }
  });

  const sorted = Object.values(defectMap)
    .filter(item => item.qty > 0)
    .sort((a, b) => b.qty - a.qty);

  let runningSum = 0;
  return sorted.map(item => {
    runningSum += item.qty;
    const percentage = totalDefects > 0 ? (item.qty / totalDefects) * 100 : 0;
    const cumulative = totalDefects > 0 ? (runningSum / totalDefects) * 100 : 0;
    return {
      defect_code: item.code,
      description: item.desc,
      defect_qty: item.qty,
      percentage: Number(percentage.toFixed(1)),
      cumulative_percentage: Number(cumulative.toFixed(1))
    };
  });
}
