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

    // Check online status
    if (settings.gasApiUrl) {
      setSyncStatus('online');
    } else {
      setSyncStatus('offline');
    }
  }, []);

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
    };

    const newItems = [newItem, ...items];
    setItems(newItems);
    saveStoredWorkItems(newItems);

    // Trigger Cloud Sync if configured
    if (settings.gasApiUrl) {
      setSyncStatus('syncing');
      try {
        await saveItemToGas(newItem, settings.gasApiUrl);
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
    };
    const newItems = items.map((i) => (i.id === updatedItem.id ? updatedWithTime : i));
    setItems(newItems);
    saveStoredWorkItems(newItems);

    if (settings.gasApiUrl) {
      setSyncStatus('syncing');
      try {
        await saveItemToGas(updatedWithTime, settings.gasApiUrl);
        setSyncStatus('online');
      } catch (e) {
        console.warn('Update sync failed', e);
        setSyncStatus('online');
      }
    }
    showToast('Đã cập nhật công việc', 'success');
  };

  // Delete item
  const deleteItem = async (id: string) => {
    const newItems = items.filter((i) => i.id !== id);
    setItems(newItems);
    saveStoredWorkItems(newItems);

    if (settings.gasApiUrl) {
      try {
        await deleteItemFromGas(id, settings.gasApiUrl);
      } catch (e) {
        console.warn('Delete sync failed', e);
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
    if (!settings.gasApiUrl) {
      showToast('Vui lòng gắn URL Google Apps Script trong Cài đặt trước', 'error');
      return;
    }
    setSyncStatus('syncing');
    showToast('Đang kết nối và đồng bộ với Google Sheets...', 'info');

    try {
      const res = await fetchItemsFromGas(settings.gasApiUrl);
      if (res.success && res.items) {
        if (res.items.length > 0) {
          setItems(res.items);
          saveStoredWorkItems(res.items);
        }
        setSyncStatus('online');
        updateSettings({ lastSync: new Date().toISOString() });
        showToast(`Đã đồng bộ thành công ${res.items.length} công việc!`, 'success');
      } else {
        setSyncStatus('error');
        showToast(res.error || 'Lỗi khi đồng bộ Google Sheets', 'error');
      }
    } catch (err: any) {
      setSyncStatus('error');
      showToast('Lỗi mạng khi đồng bộ', 'error');
    }
  };

  // Reset to initial demo data
  const resetData = () => {
    const sample = resetToInitialData();
    setItems(sample);
    showToast('Đã khôi phục dữ liệu mẫu thành công', 'success');
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
