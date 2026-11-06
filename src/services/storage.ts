// src/services/storage.ts
import { AppSettings, WorkItem } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';

const STORAGE_KEYS = {
  WORK_ITEMS: 'so_cong_tac_work_items_v2',
  SETTINGS: 'so_cong_tac_settings_v1',
  PENDING_SYNC: 'so_cong_tac_pending_sync_v1',
  DELETED_IDS: 'so_cong_tac_deleted_ids_v1',
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

/**
 * Đọc danh sách công tác lưu trữ trong trình duyệt
 * Đảm bảo an toàn dữ liệu: Kiểm tra cả v2 và v1 để không bị mất bất kỳ dữ liệu nào đã nhập!
 */
export function getStoredWorkItems(): WorkItem[] {
  try {
    // 1. Kiểm tra khóa v2
    const rawV2 = localStorage.getItem(STORAGE_KEYS.WORK_ITEMS);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 2. Nếu v2 trống, kiểm tra v1 để bảo vệ dữ liệu người dùng đã nhập trên máy tính
    const rawV1 = localStorage.getItem('so_cong_tac_work_items_v1');
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      if (Array.isArray(parsedV1) && parsedV1.length > 0) {
        // Chuyển sang v2 ngay lập tức
        saveStoredWorkItems(parsedV1);
        return parsedV1;
      }
    }
  } catch (e) {
    console.error('Error reading work items from localStorage:', e);
  }

  return [];
}

export function saveStoredWorkItems(items: WorkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORK_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving work items:', e);
  }
}

/**
 * Thuật toán Hợp nhất 2 chiều thông minh (Bidirectional Merge)
 * Đảm bảo:
 * - Không mất bất kỳ dữ liệu nào dù ở máy tính hay điện thoại
 * - Tự động xóa sạch các mục đã bị xóa trên thiết bị khác:
 *   + Dựa vào danh sách deletedIds từ server và local
 *   + Dựa vào cờ syncedWithCloud: Nếu một mục đã từng lên Cloud mà Cloud không còn nữa -> mục đó đã bị xóa trên máy khác!
 * - Không tạo bản sao duplicate: Cùng 1 ID luôn chỉ có 1 bản ghi duy nhất
 * - Hỗ trợ hoạt động offline: Các mục tạo mới khi chưa có mạng (syncedWithCloud !== true) luôn được bảo toàn và đẩy lên Cloud khi online
 */
export function mergeWorkItems(
  localItems: WorkItem[],
  cloudItems: WorkItem[],
  deletedIds: Set<string> = new Set()
): {
  mergedItems: WorkItem[];
  hasLocalChangesToUpload: boolean;
  newlyDeletedIds: string[];
} {
  const itemMap = new Map<string, WorkItem>();
  const newlyDeletedIds: string[] = [];
  let hasLocalChangesToUpload = false;

  // 1. Đưa tất cả cloudItems vào Map (bỏ qua nếu ID nằm trong danh sách đã xóa)
  for (const cItem of cloudItems) {
    if (cItem && cItem.id) {
      if (!deletedIds.has(cItem.id)) {
        itemMap.set(cItem.id, { ...cItem, syncedWithCloud: true });
      }
    }
  }

  // 2. So sánh và xử lý localItems
  for (const lItem of localItems) {
    if (!lItem || !lItem.id) continue;

    // Nếu ID nằm trong danh sách đã xóa -> Bỏ qua ngay
    if (deletedIds.has(lItem.id)) {
      continue;
    }

    if (!itemMap.has(lItem.id)) {
      // Bản ghi này có ở local nhưng KHÔNG CÓ TRÊN CLOUD
      // Ta kiểm tra xem bản ghi này là việc TẠO MỚI OFFLINE hay ĐÃ BỊ MÁY KHÁC XÓA:
      if (lItem.syncedWithCloud === true) {
        // Bản ghi này TRƯỚC ĐÓ ĐÃ TỪNG LÊN CLOUD, nhưng hiện tại Cloud KHÔNG CÒN!
        // -> Điều này chứng minh thiết bị khác (ví dụ: máy tính) đã XÓA nó!
        // -> PHẢI XÓA KHỎI THIẾT BỊ NÀY, không được tải ngược lên Cloud!
        newlyDeletedIds.push(lItem.id);
        continue;
      } else {
        // Bản ghi này CHƯA TỪNG LÊN CLOUD (được tạo mới trên máy này khi chưa đồng bộ)
        // -> Giữ lại và đánh dấu cần đẩy lên Cloud!
        itemMap.set(lItem.id, lItem);
        hasLocalChangesToUpload = true;
      }
    } else {
      // Có ở cả 2 nơi: Chọn bản ghi có thời gian mới hơn
      const cItem = itemMap.get(lItem.id)!;
      const localTime = new Date(lItem.updatedAt || lItem.createdAt || 0).getTime();
      const cloudTime = new Date(cItem.updatedAt || cItem.createdAt || 0).getTime();

      if (localTime > cloudTime) {
        // Local mới hơn (vừa chỉnh sửa trên máy này) -> giữ local và cần đẩy lên Cloud
        itemMap.set(lItem.id, lItem);
        hasLocalChangesToUpload = true;
      } else {
        // Cloud mới hơn hoặc bằng -> Giữ cloud item, nhưng nếu local có base64 cho ảnh mà cloud không có thì giữ lại base64 để offline xem nét
        let mergedImages = cItem.images || [];
        if (lItem.images && lItem.images.length > 0) {
          mergedImages = (cItem.images || []).map((cImg) => {
            const matchedLocalImg = lItem.images.find(
              (li) => li.id === cImg.id || (li.url && li.url === cImg.url)
            );
            if (matchedLocalImg && matchedLocalImg.base64 && !cImg.base64) {
              return { ...cImg, base64: matchedLocalImg.base64 };
            }
            return cImg;
          });
        }
        const mergedAttachments = (cItem.attachments && cItem.attachments.length > 0)
          ? cItem.attachments
          : (lItem.attachments || []);

        itemMap.set(lItem.id, {
          ...cItem,
          images: mergedImages,
          attachments: mergedAttachments,
          syncedWithCloud: true,
        });
      }
    }
  }

  // Chuyển Map thành mảng và sắp xếp theo ngày/giờ mới nhất lên đầu
  const merged = Array.from(itemMap.values()).sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime() || 0;
    const timeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime() || 0;
    return timeB - timeA;
  });

  return { mergedItems: merged, hasLocalChangesToUpload, newlyDeletedIds };
}

// Reset data to empty clean state
export function resetToInitialData(): WorkItem[] {
  saveStoredWorkItems([]);
  return [];
}

// Clear all data
export function clearAllStoredData(): void {
  localStorage.removeItem(STORAGE_KEYS.WORK_ITEMS);
  localStorage.removeItem('so_cong_tac_work_items_v1');
  localStorage.removeItem(STORAGE_KEYS.DELETED_IDS);
}

export function getDeletedItemIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.error('Error reading deleted ids:', e);
  }
  return new Set();
}

export function recordDeletedItemId(id: string): void {
  try {
    const current = getDeletedItemIds();
    current.add(id);
    const arr = Array.from(current).slice(-200);
    localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(arr));
  } catch (e) {
    console.error('Error recording deleted id:', e);
  }
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
 * Loại bỏ chuỗi base64 khỏi hình ảnh và tệp trước khi lưu lên Google Sheets
 * Tránh lỗi vượt quá 50.000 ký tự trên một ô tính và tăng tốc độ đồng bộ
 */
export function cleanItemForCloud(item: WorkItem): any {
  return {
    ...item,
    images: (item.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      driveFileId: img.driveFileId || '',
      caption: img.caption || '',
      createdAt: img.createdAt || new Date().toISOString(),
    })),
    attachments: (item.attachments || []).map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size || 0,
      type: att.type || 'document',
      url: att.url,
      driveFileId: att.driveFileId || '',
      createdAt: att.createdAt || new Date().toISOString(),
    })),
  };
}

/**
 * Hàm gọi fetch có giới hạn thời gian (Timeout), tối ưu cho mạng di động 4G/5G
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Fetch all items from Google Apps Script
 */
export async function fetchItemsFromGas(
  gasUrl: string
): Promise<{ success: boolean; items?: WorkItem[]; deletedIds?: string[]; error?: string }> {
  try {
    const url = gasUrl.includes('?') ? `${gasUrl}&action=getItems` : `${gasUrl}?action=getItems`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      mode: 'cors',
    }, 15000);

    if (!response.ok) {
      throw new Error(`Lỗi HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.success && Array.isArray(data.items)) {
      // Chuẩn hóa dữ liệu từ Google Sheets
      const cleanedItems: WorkItem[] = data.items.map((it: any) => {
        let cleanTime = it.time || '';
        // Sửa lỗi ngày giờ 1899 của Google Sheets
        if (cleanTime.includes('1899') || cleanTime.includes('GMT')) {
          const match = cleanTime.match(/\b(\d{2}:\d{2})(?::\d{2})?\b/);
          if (match) cleanTime = match[1];
        }

        return {
          id: String(it.id),
          title: String(it.title || ''),
          category: it.category || 'cong_viec_khac',
          type: it.type || 'completed_log',
          status: it.status || 'done',
          date: it.date || '',
          time: cleanTime,
          location: it.location || '',
          description: it.description || '',
          images: Array.isArray(it.images) ? it.images : [],
          attachments: Array.isArray(it.attachments) ? it.attachments : [],
          isHighlighted: Boolean(it.isHighlighted),
          createdAt: it.createdAt || new Date().toISOString(),
          updatedAt: it.updatedAt || new Date().toISOString(),
          syncedWithCloud: true, // Đánh dấu bản ghi đã nằm trên Cloud
        };
      });

      const deletedIds = Array.isArray(data.deletedIds) ? data.deletedIds.map(String) : [];

      return { success: true, items: cleanedItems, deletedIds };
    }
    return { success: false, error: data.error || 'Dữ liệu không hợp lệ từ Google Sheets' };
  } catch (err: any) {
    const msg = err.name === 'AbortError' ? 'Hết thời gian chờ kết nối (15 giây)' : (err.message || 'Không thể tải dữ liệu từ Google Sheets');
    return { success: false, error: msg };
  }
}

/**
 * Save single item to Google Apps Script
 */
export async function saveItemToGas(item: WorkItem, gasUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!gasUrl) return { success: false, error: 'Chưa cấu hình Google Apps Script' };

  try {
    const sanitized = cleanItemForCloud(item);
    await fetchWithTimeout(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveItem',
        item: sanitized,
      }),
    }, 15000);
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi lưu item lên Google Sheets:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Đồng bộ hàng loạt toàn bộ danh sách lên Google Apps Script
 */
export async function batchSyncToGas(items: WorkItem[], gasUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!gasUrl) return { success: false, error: 'Chưa cấu hình Google Apps Script' };

  try {
    const sanitizedList = items.map(cleanItemForCloud);
    await fetchWithTimeout(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'batchSync',
        items: sanitizedList,
      }),
    }, 20000);
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi đồng bộ hàng loạt lên Google Sheets:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete item from Google Apps Script
 */
export async function deleteItemFromGas(id: string, gasUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!gasUrl) return { success: false, error: 'Chưa cấu hình Google Apps Script' };

  try {
    await fetchWithTimeout(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'deleteItem',
        id: String(id),
      }),
    }, 15000);
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

/**
 * Upload tệp văn bản / tài liệu (PDF, Word, Excel, PowerPoint...) lên Google Drive via Google Apps Script
 */
export async function uploadFileToDrive(
  base64Data: string,
  fileName: string,
  category: string,
  yearMonth: string,
  gasUrl: string,
  mimeType?: string
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
        action: 'uploadFile',
        base64: base64Data,
        fileName,
        category,
        yearMonth,
        mimeType,
      }),
    });

    const data = await res.json();
    if (data.success && data.data) {
      return { success: true, fileData: data.data };
    }
    return { success: false, error: data.error || 'Lỗi lưu tệp vào Drive' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể upload tệp văn bản lên Drive' };
  }
}
