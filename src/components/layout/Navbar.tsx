// src/components/layout/Navbar.tsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Settings,
  Sun,
  Moon,
  Plus,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    settings,
    updateSettings,
    syncStatus,
    syncNow,
    openSettings,
    openQuickCapture,
    filter,
    setFilter,
  } = useApp();

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center -space-x-2 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 p-0.5 shadow-md border border-slate-200 dark:border-slate-700 z-10 flex items-center justify-center">
              <img src="/assets/logo-doan.png" alt="Đoàn Thanh Niên" className="w-8 h-8 object-contain" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 p-0.5 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <img src="/assets/logo-antt.png" alt="Bảo Vệ ANTT Cơ Sở" className="w-8 h-8 object-contain" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                Sổ Công Tác
              </h1>
              <span className="hidden md:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Đoàn TN • ANTT Cơ Sở
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-[220px]">
              {settings.userName || 'Nhật ký & Lịch trình'}
            </p>
          </div>
        </div>

        {/* Global Search Bar (Medium & Large screens) */}
        <div className="flex-1 max-w-md hidden md:block mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc, cuộc họp, địa điểm..."
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-hidden transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Action Icons & Sync Status */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Cloud Sync Status Indicator */}
          {settings.gasApiUrl ? (
            <button
              onClick={syncNow}
              disabled={syncStatus === 'syncing'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              title="Nhấn để đồng bộ ngay với Google Sheets & Drive"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span className="hidden sm:inline text-blue-600">Đang đồng bộ...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Google Cloud</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={openSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 transition-colors"
              title="Chưa kết nối Google Drive & Sheets. Bấm để cài đặt."
            >
              <CloudOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Offline Mode</span>
            </button>
          )}

          {/* Quick Create Action (Desktop) */}
          <button
            onClick={() => openQuickCapture()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi việc</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            aria-label="Toggle Theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={openSettings}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Cài đặt & Kết nối Google Drive"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
            {!settings.gasApiUrl && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

