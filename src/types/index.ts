// src/types/index.ts

export type Category = 'doan_thanh_nien' | 'antt_co_so' | 'cong_viec_khac';

export type WorkItemType = 'completed_log' | 'scheduled';

export type WorkItemStatus = 'todo' | 'in_progress' | 'done';

export interface WorkImage {
  id: string;
  url: string;
  driveFileId?: string;
  caption?: string;
  createdAt: string;
  base64?: string; // used for local cache & offline
  thumbnailUrl?: string;
}

export interface WorkAttachment {
  id: string;
  name: string; // Tên tệp văn bản (vd: Ke_hoach_thang_11.pdf)
  size: number; // Kích thước tệp (bytes)
  type: string; // Loại tệp: pdf, word, excel, powerpoint, text, document
  url: string; // Link xem hoặc tải trực tiếp từ Google Drive
  driveFileId?: string; // File ID trên Google Drive
  createdAt: string;
  base64?: string; // Tạm thời dùng khi tải lên
}

export interface WorkItem {
  id: string;
  title: string;
  category: Category;
  type: WorkItemType;
  status: WorkItemStatus;
  date: string; // ISO Date YYYY-MM-DD
  time?: string; // e.g. "08:00 - 11:30"
  location?: string;
  description?: string;
  images: WorkImage[];
  attachments?: WorkAttachment[]; // Danh sách tệp văn bản đính kèm
  isHighlighted: boolean; // Đánh dấu sao "Công việc tiêu biểu / Thành tích nổi bật"
  createdAt: string;
  updatedAt: string;
  syncedWithCloud?: boolean; // Cờ nhận diện bản ghi đã từng đồng bộ lên Cloud
}

export type TimeCycle = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' | 'all';

export interface FilterState {
  category: Category | 'all';
  cycle: TimeCycle;
  selectedDate: string; // YYYY-MM-DD
  selectedMonth: number; // 1 - 12
  selectedQuarter: number; // 1 - 4
  selectedYear: number; // e.g. 2026
  dateRange: {
    from: string;
    to: string;
  };
  onlyHighlighted: boolean;
  searchQuery: string;
}

export interface AppSettings {
  gasApiUrl: string;
  lastSync?: string;
  theme: 'light' | 'dark' | 'system';
  userName: string;
  userRole: string;
  unitName: string;
}

export type SyncStatus = 'offline' | 'online' | 'syncing' | 'error' | 'success';

