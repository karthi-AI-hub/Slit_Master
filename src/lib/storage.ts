import { supabase } from './supabase';

export interface ReelInventory {
  id: string;
  width: number;
  gsm: number;
  weight: number;
  paperType: string;
  date: string;
  notes: string;
}

export interface FanSize {
  id: string;
  name: string;
  dieWidth: number;
  dieHeight: number;
  printWidth: number;
  printHeight: number;
  rows: number;
  ups1Width: number;
  ups2Width: number;
  ups3Width: number;
  ups4Width: number;
}

export interface BottomSize {
  id: string;
  name: string;
  width: number;
}

export interface SlitPlanResult {
  id?: string;
  combination: string;
  usedWidth: number;
  waste: number;
  efficiency: number;
}

export interface SheetCalculationPreset {
  id: string;
  name: string;
  length: number;
  width: number;
  lengthUnit: string;
  widthUnit: string;
  reelWeight: number;
  coreWeight: number;
  gsm: number;
  wastage: number;
  roundingMode: string;
}

export const getReels = async (): Promise<ReelInventory[]> => {
  const { data, error } = await supabase.from('reels').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data as ReelInventory[];
};

export const saveReels = async (reels: ReelInventory[]): Promise<void> => {
  const { error } = await supabase.from('reels').upsert(reels, { onConflict: 'id' });
  if (error) throw error;
};

export const deleteReel = async (id: string): Promise<void> => {
  const { error } = await supabase.from('reels').delete().eq('id', id);
  if (error) throw error;
};

export const generateReelId = async (): Promise<string> => {
  const reels = await getReels();
  const count = reels.length + 1;
  return `R${count.toString().padStart(3, '0')}`;
};

export const getFanSizes = async (): Promise<FanSize[]> => {
  const { data, error } = await supabase.from('fan_sizes').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data as FanSize[];
};

export const saveFanSizes = async (fanSizes: FanSize[]): Promise<void> => {
  const { error } = await supabase.from('fan_sizes').upsert(fanSizes, { onConflict: 'id' });
  if (error) throw error;
};

export const deleteFanSize = async (id: string): Promise<void> => {
  const { error } = await supabase.from('fan_sizes').delete().eq('id', id);
  if (error) throw error;
};

export const generateFanId = async (): Promise<string> => {
  const fanSizes = await getFanSizes();
  const count = fanSizes.length + 1;
  return `F${count.toString().padStart(3, '0')}`;
};

export const getBottomSizes = async (): Promise<BottomSize[]> => {
  const { data, error } = await supabase.from('bottom_sizes').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data as BottomSize[];
};

export const saveBottomSizes = async (bottomSizes: BottomSize[]): Promise<void> => {
  const { error } = await supabase.from('bottom_sizes').upsert(bottomSizes, { onConflict: 'id' });
  if (error) throw error;
};

export const deleteBottomSize = async (id: string): Promise<void> => {
  const { error } = await supabase.from('bottom_sizes').delete().eq('id', id);
  if (error) throw error;
};

export const generateBottomId = async (): Promise<string> => {
  const bottomSizes = await getBottomSizes();
  const count = bottomSizes.length + 1;
  return `B${count.toString().padStart(3, '0')}`;
};

export const getSlitResults = async (): Promise<SlitPlanResult[]> => {
  const { data, error } = await supabase.from('slit_results').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data as SlitPlanResult[];
};

export const saveSlitResults = async (results: SlitPlanResult[]): Promise<void> => {
  const { error } = await supabase.from('slit_results').upsert(results, { onConflict: 'id' });
  if (error) throw error;
};

export const getSheetPresets = async (): Promise<SheetCalculationPreset[]> => {
  const { data, error } = await supabase.from('sheet_presets').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data as SheetCalculationPreset[];
};

export const saveSheetPresets = async (presets: SheetCalculationPreset[]): Promise<void> => {
  const { error } = await supabase.from('sheet_presets').upsert(presets, { onConflict: 'id' });
  if (error) throw error;
};

export const exportToCSV = <T extends Record<string, unknown>>(data: T[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => 
    Object.values(item).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    ).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};