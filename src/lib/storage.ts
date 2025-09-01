// localStorage utilities for data persistence

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

const STORAGE_KEYS = {
  REELS: 'crafts_reels',
  FAN_SIZES: 'crafts_fan_sizes',
  BOTTOM_SIZES: 'crafts_bottom_sizes',
  SLIT_RESULTS: 'crafts_slit_results',
  SHEET_PRESETS: 'crafts_sheet_presets'
} as const;

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

// Reel inventory functions
export const getReels = (): ReelInventory[] => getFromStorage<ReelInventory>(STORAGE_KEYS.REELS);
export const saveReels = (reels: ReelInventory[]): void => saveToStorage(STORAGE_KEYS.REELS, reels);

export const generateReelId = (): string => {
  const reels = getReels();
  const count = reels.length + 1;
  return `R${count.toString().padStart(3, '0')}`;
};

// Fan sizes functions
export const getFanSizes = (): FanSize[] => getFromStorage<FanSize>(STORAGE_KEYS.FAN_SIZES);
export const saveFanSizes = (fanSizes: FanSize[]): void => saveToStorage(STORAGE_KEYS.FAN_SIZES, fanSizes);

export const generateFanId = (): string => {
  const fanSizes = getFanSizes();
  const count = fanSizes.length + 1;
  return `F${count.toString().padStart(3, '0')}`;
};

// Bottom sizes functions
export const getBottomSizes = (): BottomSize[] => getFromStorage<BottomSize>(STORAGE_KEYS.BOTTOM_SIZES);
export const saveBottomSizes = (bottomSizes: BottomSize[]): void => saveToStorage(STORAGE_KEYS.BOTTOM_SIZES, bottomSizes);

export const generateBottomId = (): string => {
  const bottomSizes = getBottomSizes();
  const count = bottomSizes.length + 1;
  return `B${count.toString().padStart(3, '0')}`;
};

// Slit plan results
export const getSlitResults = (): SlitPlanResult[] => getFromStorage<SlitPlanResult>(STORAGE_KEYS.SLIT_RESULTS);
export const saveSlitResults = (results: SlitPlanResult[]): void => saveToStorage(STORAGE_KEYS.SLIT_RESULTS, results);

// Sheet calculation presets
export const getSheetPresets = (): SheetCalculationPreset[] => getFromStorage<SheetCalculationPreset>(STORAGE_KEYS.SHEET_PRESETS);
export const saveSheetPresets = (presets: SheetCalculationPreset[]): void => saveToStorage(STORAGE_KEYS.SHEET_PRESETS, presets);

// Clear all data
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Export to CSV
export const exportToCSV = (data: any[], filename: string): void => {
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