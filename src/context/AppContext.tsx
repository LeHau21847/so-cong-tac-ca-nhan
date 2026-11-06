// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, FilterState, SyncStatus, WorkImage, WorkItem } from '../types';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredWorkItems,
  saveStoredWorkItems,
  resetToInitialData,
  saveItemToGas,
  deleteItemFromGas,
  fetchItemsFromGas,
  batchSyncToGas,
  getDeletedItemIds,
  recordDeletedItemId,
  mergeWorkItems,
} from '../services/storage';
import { getTodayDateString } from '../utils/dateHelpers';

export type AppTab = 'dashboard' | 'work_log' | 'scheduler' | 'reports' | 'gallery';

interface AppContextType {
  items: WorkItem[];
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  syncStatus: SyncStatus;
  isQuickCaptureOpen: boolean;
  quickCaptureInitialData: Partial<WorkItem> | null;
  openQuickCapture: (initialData?: Partial<WorkItem>) => void;
  closeQuickCapture: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  lightboxImage: { url: string; caption?: string; title?: string } | null;
  openLightbox: (data: { url: string; caption?: string; title?: string }) => void;
  closeLightbox: () => void;
  addItem: (itemData: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkItem>;
  updateItem: (item: WorkItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleHighlight: (id: string) => Promise<void>;
  completeScheduledItem: (id: string, resultDescription: string, newImages: WorkImage[]) => Promise<void>;
  syncNow: () => Promise<void>;
  resetData: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialFilterState: FilterState = {
  category: 'all',
  cycle: 'all',
  selectedDate: getTodayDateString(),
  selectedMonth: new Date().getMonth() + 1,
  selectedQuarter: Math.floor(new Date().getMonth() / 3) + 1,
  selectedYear: new Date().getFullYear(),
  dateRange: {
    from: '',
    to: '',
  },
  onlyHighlighted: false,
  searchQuery: '',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [filter, setFilter] = useState<FilterState>(initialFilterState);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [quickCaptureInitialData, setQuickCaptureInitialData] = useState<Partial<WorkItem> | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string; title?: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load stored items on mount
  useEffect(() => {
    const loaded = getStoredWorkItems();
    setItems(loaded);

    // Apply dark/light theme
    const theme = settings.theme || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Tự động đồng bộ 2 chiều ngay khi mở ứng dụng (cả trên điện thoại và máy tính)
    if (settings.gasApiUrl) {
      performSync(true);
    } else {
      setSyncStatus('offline');
    }

    // Tự động đồng bộ lại khi người dùng quay lại tab hoặc mở lại ứng dụng
    const handleFocus = () => {
      if (settings.gasApiUrl) {
        performSync(true);
      }
    };
    window.addEventListener('focus', handleFocus);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && settings.gasApiUrl) {
        performSync(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Định kỳ tự động đồng bộ ngầm mỗi 45 giây nếu có mạng
    const interval = setInterval(() => {
      if (settings.gasApiUrl && navigator.onLine) {
        performSync(true);
      }
    }, 45000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [settings.gasApiUrl]);

  // Đồng bộ 2 chiều (Bidirectional Sync) thông minh giữa máy tính, điện thoại và Google Sheets
  const performSync = async (isSilent = false) => {
    if (!settings.gasApiUrl) {
      if (!isSilent) {
        showToast('Vui lòng gắn URL Google Apps Script trong Cài đặt trước', 'error');
      }
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    if (!isSilent) {
      showToast('Đang kết nối và đồng bộ dữ liệu...', 'info');
    }

    try {
      const res = await fetchItemsFromGas(settings.gasApiUrl);
      if (res.success && Array.isArray(res.items)) {
        const currentLocal = getStoredWorkItems();
        const deletedIds = getDeletedItemIds();

        // 1. Thêm danh sách deletedIds từ Google Sheets vào tập hợp xóa
        if (Array.isArray(res.deletedIds)) {
          for (const dId of res.deletedIds) {
            deletedIds.add(dId);
            recordDeletedItemId(dId);
          }
        }

        // 2. Thực hiện gộp dữ liệu 2 chiều thông minh
        const { mergedItems, hasLocalChangesToUpload, newlyDeletedIds } = mergeWorkItems(
          currentLocal,
          res.items,
          deletedIds
        );

        // 3. Ghi nhận các mục đã bị xóa từ thiết bị khác để vĩnh viễn không tải ngược lên
        if (newlyDeletedIds && newlyDeletedIds.length > 0) {
          for (const nId of newlyDeletedIds) {
            recordDeletedItemId(nId);
          }
        }

        setItems(mergedItems);
        saveStoredWorkItems(mergedItems);
        setSyncStatus('online');

        // 4. Nếu máy này có việc mới chưa có trên Cloud -> Đẩy lên Google Sheets
        if (hasLocalChangesToUpload) {
          console.log(`[Auto-Sync] Đang đồng bộ ${mergedItems.length} công việc lên Google Sheets...`);
          await batchSyncToGas(mergedItems, settings.gasApiUrl);
        }

        updateSettings({ lastSync: new Date().toISOString() });
        if (!isSilent) {
          showToast(`Đã đồng bộ thành công! Hiện có ${mergedItems.length} công việc.`, 'success');
        }
      } else {
        setSyncStatus('error');
        if (!isSilent) {
          showToast(res.error || 'Lỗi khi đồng bộ Google Sheets', 'error');
        }
      }
    } catch (err: any) {
      console.warn('Sync failed:', err);
      setSyncStatus('error');
      if (!isSilent) {
        showToast('Lỗi mạng khi đồng bộ', 'error');
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStoredSettings(updated);
    if (newSettings.theme) {
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    showToast('Đã lưu cài đặt thành công', 'success');
  };

  const openQuickCapture = (initialData?: Partial<WorkItem>) => {
    setQuickCaptureInitialData(initialData || null);
    setIsQuickCaptureOpen(true);
  };

  const closeQuickCapture = () => {
    setIsQuickCaptureOpen(false);
    setQuickCaptureInitialData(null);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const openLightbox = (data: { url: string; caption?: string; title?: string }) => setLightboxImage(data);
  const closeLightbox = () => setLightboxImage(null);

  // Add Item (Optimistic UI: saves locally immediately, then syncs to Google Apps Script if URL exists)
  const addItem = async (itemData: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkItem> => {
    const now = new Date().toISOString();
    const newItem: WorkItem = {
      ...itemData,
      id: 'work_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: now,
      updatedAt: now,
      syncedWithCloud: false,
    };

    const newItems = [newItem, ...items];
    setItems(newItems);
    saveStoredWorkItems(newItems);

    // Trigger Cloud Sync if configured
    if (settings.gasApiUrl) {
      setSyncStatus('syncing');
      try {
        await saveItemToGas(newItem, settings.gasApiUrl);
        const syncedItems = newItems.map((it) =>
          it.id === newItem.id ? { ...it, syncedWithCloud: true } : it
        );
        setItems(syncedItems);
        saveStoredWorkItems(syncedItems);
        setSyncStatus('online');
      } catch (e) {
        console.warn('Sync failed, queued locally', e);
        setSyncStatus('online');
      }
    }

    showToast('Đã ghi nhận công tác thành công!', 'success');
    return newItem;
  };

  // Update existing item
  const updateItem = async (updatedItem: WorkItem) => {
    const updatedWithTime: WorkItem = {
      ...updatedItem,
      updatedAt: new Date().toISOString(),
      syncedWithCloud: false,
    };
    const newItems = items.map((i) => (i.id === updatedItem.id ? updatedWithTime : i));
    setItems(newItems);
    saveStoredWorkItems(newItems);

    if (settings.gasApiUrl) {
      setSyncStatus('syncing');
      try {
        await saveItemToGas(updatedWithTime, settings.gasApiUrl);
        const syncedItems = newItems.map((it) =>
          it.id === updatedItem.id ? { ...it, syncedWithCloud: true } : it
        );
        setItems(syncedItems);
        saveStoredWorkItems(syncedItems);
        setSyncStatus('online');
      } catch (e) {
        console.warn('Update sync failed', e);
        setSyncStatus('online');
      }
    }
    showToast('Đã cập nhật công việc', 'success');
  };

  // Delete item: Xóa ở local, gửi lệnh xóa lên Cloud và đẩy danh sách sạch lên Google Sheets
  const deleteItem = async (id: string) => {
    recordDeletedItemId(id);
    const newItems = items.filter((i) => i.id !== id);
    setItems(newItems);
    saveStoredWorkItems(newItems);

    if (settings.gasApiUrl) {
      setSyncStatus('syncing');
      try {
        await deleteItemFromGas(id, settings.gasApiUrl);
        // Đồng bộ danh sách còn lại lên Google Sheets để đảm bảo triệt để
        await batchSyncToGas(newItems, settings.gasApiUrl);
        setSyncStatus('online');
      } catch (e) {
        console.warn('Delete sync failed', e);
        setSyncStatus('online');
      }
    }
    showToast('Đã xóa công việc', 'info');
  };

  // Toggle Highlight (Star for Awards / Báo cáo thi đua khen thưởng)
  const toggleHighlight = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const updated: WorkItem = {
      ...target,
      isHighlighted: !target.isHighlighted,
      updatedAt: new Date().toISOString(),
    };
    await updateItem(updated);
    showToast(
      updated.isHighlighted
        ? 'Đã gắn sao Công việc tiêu biểu (Xét khen thưởng) ⭐'
        : 'Đã bỏ đánh dấu tiêu biểu',
      'info'
    );
  };

  // Complete scheduled item and transition to completed_log
  const completeScheduledItem = async (
    id: string,
    resultDescription: string,
    newImages: WorkImage[]
  ) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const mergedDescription = target.description
      ? `${target.description}\n\n[KẾT QUẢ THỰC HIỆN]: ${resultDescription}`
      : resultDescription;

    const updated: WorkItem = {
      ...target,
      type: 'completed_log',
      status: 'done',
      description: mergedDescription,
      images: [...(target.images || []), ...newImages],
      updatedAt: new Date().toISOString(),
    };

    await updateItem(updated);
    showToast('Đã hoàn thành và chuyển vào Sổ công tác đã làm!', 'success');
  };

  // Manual Full Sync with Google Sheets
  const syncNow = async () => {
    await performSync(false);
  };

  // Reset to empty clean state
  const resetData = () => {
    const clean = resetToInitialData();
    setItems(clean);
    showToast('Đã xóa dữ liệu và đưa về trạng thái mới', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        items,
        activeTab,
        setActiveTab,
        filter,
        setFilter,
        settings,
        updateSettings,
        syncStatus,
        isQuickCaptureOpen,
        quickCaptureInitialData,
        openQuickCapture,
        closeQuickCapture,
        isSettingsOpen,
        openSettings,
        closeSettings,
        lightboxImage,
        openLightbox,
        closeLightbox,
        addItem,
        updateItem,
        deleteItem,
        toggleHighlight,
        completeScheduledItem,
        syncNow,
        resetData,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
