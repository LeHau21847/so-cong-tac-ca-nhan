// src/services/storage.ts
import { AppSettings, WorkItem } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';
import { INITIAL_WORK_ITEMS } from './mockData';

const STORAGE_KEYS = {
  WORK_ITEMS: 'so_cong_tac_work_items_v1',
  SETTINGS: 'so_cong_tac_settings_v1',
  PENDING_SYNC: 'so_cong_tac_pending_sync_v1',
};

// --- Storage API ---

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function getStoredWorkItems(): WorkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORK_ITEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading work items from localStorage:', e);
  }

  // First time initialization with mock data
  saveStoredWorkItems(INITIAL_WORK_ITEMS);
  return INITIAL_WORK_ITEMS;
}

export function saveStoredWorkItems(items: WorkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORK_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving work items:', e);
  }
}

// Reset data to initial mock data
export function resetToInitialData(): WorkItem[] {
  saveStoredWorkItems(INITIAL_WORK_ITEMS);
  return INITIAL_WORK_ITEMS;
}

// Clear all data
export function clearAllStoredData(): void {
  localStorage.removeItem(STORAGE_KEYS.WORK_ITEMS);
}

// Export data to JSON string
export function exportToJsonString(): string {
  const items = getStoredWorkItems();
  const settings = getStoredSettings();
  const exportPayload = {
    appName: 'Sổ Công Tác Cá Nhân',
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings,
    items,
  };
  return JSON.stringify(exportPayload, null, 2);
}

// Import data from JSON string
export function importFromJsonString(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.items)) {
      return { success: false, count: 0, error: 'Định dạng tệp sao lưu không hợp lệ (thiếu danh sách items).' };
    }
    saveStoredWorkItems(data.items);
    if (data.settings) {
      saveStoredSettings({ ...getStoredSettings(), ...data.settings });
    }
    return { success: true, count: data.items.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Lỗi đọc tệp JSON' };
  }
}

// --- Google Apps Script Cloud Sync Layer ---

export interface GasPingResponse {
  success: boolean;
  message?: string;
  serverTime?: string;
  error?: string;
}

export async function testGasConnection(gasUrl: string): Promise<GasPingResponse> {
  if (!gasUrl || !gasUrl.startsWith('http')) {
    return { success: false, error: 'URL không hợp lệ. Vui lòng kiểm tra lại URL Web App.' };
  }

  try {
    const pingUrl = gasUrl.includes('?') ? `${gasUrl}&action=ping` : `${gasUrl}?action=ping`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      return { success: false, error: `Máy chủ phản hồi mã lỗi HTTP: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'Không thể kết nối đến Google Apps Script. Kiểm tra xem bạn đã cấp quyền "Anyone" khi Triển khai Web App chưa. Lỗi: ' + (err.message || err.toString()),
    };
  }
}

/**
 * Fetch all items from Google Apps Script
 */
export async function fetchItemsFromGas(gasUrl: string): Promise<{ success: boolean; items?: WorkItem[]; error?: string }> {
  try {
    const url = gasUrl.includes('?') ? `${gasUrl}&action=getItems` : `${gasUrl}?action=getItems`;
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error(`Lỗi HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.success && Array.isArray(data.items)) {
      return { success: true, items: data.items };
    }
    return { success: false, error: data.error || 'Dữ liệu không hợp lệ từ Google Sheets' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể tải dữ liệu từ Google Sheets' };
  }
}

/**
 * Save item to Google Apps Script
 */
export async function saveItemToGas(item: WorkItem, gasUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!gasUrl) return { success: false, error: 'Chưa cấu hình Google Apps Script' };

  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors', // standard workaround for simple GAS POST triggers
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveItem',
        item,
      }),
    });
    // In no-cors mode we assume success if no network throw
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi lưu item lên Google Sheets:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete item from Google Apps Script
 */
export async function deleteItemFromGas(id: string, gasUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!gasUrl) return { success: false, error: 'Chưa cấu hình Google Apps Script' };

  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'deleteItem',
        id,
      }),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi xóa item trên Google Sheets:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Upload single image to Google Drive via Google Apps Script
 */
export async function uploadImageToDrive(
  base64Data: string,
  fileName: string,
  category: string,
  yearMonth: string,
  gasUrl: string
): Promise<{ success: boolean; fileData?: any; error?: string }> {
  if (!gasUrl) {
    return { success: false, error: 'Chưa cấu hình URL Google Apps Script' };
  }

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'uploadImage',
        base64: base64Data,
        fileName,
        category,
        yearMonth,
      }),
    });

    const data = await res.json();
    if (data.success && data.data) {
      return { success: true, fileData: data.data };
    }
    return { success: false, error: data.error || 'Lỗi lưu ảnh vào Drive' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể upload ảnh lên Drive' };
  }
}
