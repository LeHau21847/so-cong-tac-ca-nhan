// src/components/layout/BottomNav.tsx
import React from 'react';
import { useApp, AppTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck2,
  FileSpreadsheet,
  Camera,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openQuickCapture } = useApp();

  const navItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'work_log',
      label: 'Sổ công tác',
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      id: 'scheduler',
      label: 'Lịch sắp tới',
      icon: <CalendarCheck2 className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="relative flex items-center justify-around h-16 px-1">
        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Center Floating Action Button (FAB) - Chụp Nhanh / Ghi Việc */}
        <div className="flex flex-col items-center justify-center flex-1 relative -top-4">
          <button
            onClick={() => openQuickCapture()}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center active:scale-90 transition-transform border-4 border-white dark:border-slate-900 group"
            title="Chụp nhanh hiện trường / Ghi việc"
            aria-label="Chụp nhanh hoặc ghi việc"
          >
            <Camera className="w-6 h-6 transition-transform group-hover:scale-110" />
          </button>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            Chụp / Ghi
          </span>
        </div>

        {/* Right 2 items */}
        {navItems.slice(2).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

