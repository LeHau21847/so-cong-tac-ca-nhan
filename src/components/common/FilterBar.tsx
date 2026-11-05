// src/components/common/FilterBar.tsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Category, TimeCycle } from '../../types';
import { CATEGORIES } from '../../utils/constants';
import { getTodayDateString } from '../../utils/dateHelpers';
import {
  Calendar,
  Star,
  RotateCcw,
} from 'lucide-react';

export const FilterBar: React.FC = () => {
  const { filter, setFilter } = useApp();

  const handleCategoryChange = (cat: Category | 'all') => {
    setFilter((prev) => ({ ...prev, category: cat }));
  };

  const handleCycleChange = (cycle: TimeCycle) => {
    setFilter((prev) => ({ ...prev, cycle }));
  };

  const resetFilters = () => {
    setFilter({
      category: 'all',
      cycle: 'all',
      selectedDate: getTodayDateString(),
      selectedMonth: new Date().getMonth() + 1,
      selectedQuarter: Math.floor(new Date().getMonth() / 3) + 1,
      selectedYear: new Date().getFullYear(),
      dateRange: { from: '', to: '' },
      onlyHighlighted: false,
      searchQuery: '',
    });
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs space-y-3">
      {/* 1. MẢNG CÔNG TÁC (TẤT CẢ / ĐOÀN TN / ANTT / KHÁC) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filter.category === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Tất cả mảng
        </button>
        {Object.values(CATEGORIES).map((cat) => {
          const isSelected = filter.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isSelected
                  ? `${cat.badgeBg} text-white shadow-xs`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat.iconUrl ? (
                <img src={cat.iconUrl} alt={cat.shortLabel} className="w-3.5 h-3.5 object-contain shrink-0" />
              ) : (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : cat.color }}
                />
              )}
              <span>{cat.shortLabel}</span>
            </button>
          );
        })}

        {/* Highlight Filter */}
        <button
          onClick={() => setFilter((prev) => ({ ...prev, onlyHighlighted: !prev.onlyHighlighted }))}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ml-auto transition-all ${
            filter.onlyHighlighted
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 hover:bg-amber-100'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${filter.onlyHighlighted ? 'fill-white' : 'fill-amber-500 text-amber-500'}`} />
          <span>Việc tiêu biểu</span>
        </button>
      </div>

      {/* 2. CHU KỲ THỜI GIAN (NGÀY / TUẦN / THÁNG / QUÝ / NĂM / TÙY CHỌN) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            <Calendar className="w-3.5 h-3.5 inline mr-1" /> Kỳ:
          </span>
          {(['all', 'day', 'week', 'month', 'quarter', 'year', 'custom'] as TimeCycle[]).map((cycle) => {
            const labels: Record<TimeCycle, string> = {
              all: 'Tất cả',
              day: 'Ngày',
              week: 'Tuần',
              month: 'Tháng',
              quarter: 'Quý',
              year: 'Năm',
              custom: 'Tùy chọn',
            };
            const isSelected = filter.cycle === cycle;
            return (
              <button
                key={cycle}
                onClick={() => handleCycleChange(cycle)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {labels[cycle]}
              </button>
            );
          })}
        </div>

        {/* Secondary Cycle Pickers */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {filter.cycle === 'day' && (
            <input
              type="date"
              value={filter.selectedDate}
              onChange={(e) => setFilter((prev) => ({ ...prev, selectedDate: e.target.value }))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-hidden text-xs"
            />
          )}

          {filter.cycle === 'month' && (
            <div className="flex items-center gap-1.5">
              <select
                value={filter.selectedMonth}
                onChange={(e) => setFilter((prev) => ({ ...prev, selectedMonth: Number(e.target.value) }))}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
              <select
                value={filter.selectedYear}
                onChange={(e) => setFilter((prev) => ({ ...prev, selectedYear: Number(e.target.value) }))}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filter.cycle === 'quarter' && (
            <div className="flex items-center gap-1.5">
              <select
                value={filter.selectedQuarter}
                onChange={(e) => setFilter((prev) => ({ ...prev, selectedQuarter: Number(e.target.value) }))}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value={1}>Quý I (Tháng 1-3)</option>
                <option value={2}>Quý II (Tháng 4-6)</option>
                <option value={3}>Quý III (Tháng 7-9)</option>
                <option value={4}>Quý IV (Tháng 10-12)</option>
              </select>
              <select
                value={filter.selectedYear}
                onChange={(e) => setFilter((prev) => ({ ...prev, selectedYear: Number(e.target.value) }))}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filter.cycle === 'year' && (
            <select
              value={filter.selectedYear}
              onChange={(e) => setFilter((prev) => ({ ...prev, selectedYear: Number(e.target.value) }))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          )}

          {filter.cycle === 'custom' && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                placeholder="Từ ngày"
                value={filter.dateRange.from}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value },
                  }))
                }
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                placeholder="Đến ngày"
                value={filter.dateRange.to}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value },
                  }))
                }
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          )}

          {/* Reset Filters button */}
          {(filter.category !== 'all' ||
            filter.cycle !== 'all' ||
            filter.onlyHighlighted ||
            filter.searchQuery) && (
            <button
              onClick={resetFilters}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
