// src/components/layout/Sidebar.tsx
import React from 'react';
import { useApp, AppTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck2,
  FileSpreadsheet,
  Images,
  PlusCircle,
  Award,
} from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, openQuickCapture, items, filter, setFilter } = useApp();

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; badgeCount?: number }[] = [
    {
      id: 'dashboard',
      label: 'Tổng quan Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'work_log',
      label: 'Sổ công tác cá nhân',
      icon: <ClipboardList className="w-5 h-5" />,
      badgeCount: items.filter((i) => i.type === 'completed_log').length,
    },
    {
      id: 'scheduler',
      label: 'Kế hoạch & Lịch họp',
      icon: <CalendarCheck2 className="w-5 h-5" />,
      badgeCount: items.filter((i) => i.type === 'scheduled' && i.status !== 'done').length,
    },
    {
      id: 'reports',
      label: 'Tổng hợp Báo cáo',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      id: 'gallery',
      label: 'Thư viện minh chứng',
      icon: <Images className="w-5 h-5" />,
      badgeCount: items.reduce((acc, curr) => acc + (curr.images?.length || 0), 0),
    },
  ];

  const highlightedCount = items.filter((i) => i.isHighlighted).length;

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 p-4 justify-between">
      <div className="space-y-6">
        {/* Quick Action Button */}
        <button
          onClick={() => openQuickCapture()}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-98 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Ghi nhận công tác</span>
        </button>

        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Phân hệ chính
          </p>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badgeCount !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Category Filter Shortcuts */}
        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Theo mảng phụ trách
          </p>
          {Object.values(CATEGORIES).map((cat) => {
            const count = items.filter((i) => i.category === cat.id).length;
            const isSelected = activeTab === 'work_log' && filter.category === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setFilter((prev) => ({ ...prev, category: cat.id }));
                  setActiveTab('work_log');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {cat.iconUrl ? (
                    <img src={cat.iconUrl} alt={cat.shortLabel} className="w-4 h-4 object-contain shrink-0" />
                  ) : (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                  <span className="truncate">{cat.label}</span>
                </div>
                <span className="text-[11px] text-slate-400">{count}</span>
              </button>
            );
          })}

          {/* Quick Highlight Star filter */}
          <button
            onClick={() => {
              setFilter((prev) => ({ ...prev, onlyHighlighted: !prev.onlyHighlighted }));
              setActiveTab('work_log');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 mt-1 rounded-lg text-xs font-medium transition-colors ${
              filter.onlyHighlighted
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Việc tiêu biểu / Khen thưởng</span>
            </div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              {highlightedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Sổ Công Tác v1.0
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Serverless Google Cloud 5TB
        </p>
      </div>
    </aside>
  );
};

