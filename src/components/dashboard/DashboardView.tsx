// src/components/dashboard/DashboardView.tsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { isDateInFilter, getFilterPeriodLabel, formatVNDate } from '../../utils/dateHelpers';
import { CATEGORIES } from '../../utils/constants';
import { WorkItem } from '../../types';
import { CompleteTaskModal } from '../scheduler/CompleteTaskModal';
import { WorkItemDetailModal } from '../work-log/WorkItemDetailModal';
import {
  CheckCircle2,
  CalendarCheck2,
  Camera,
  Award,
  ArrowRight,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { items, filter, setActiveTab, openQuickCapture } = useApp();

  const [selectedItemForComplete, setSelectedItemForComplete] = useState<WorkItem | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<WorkItem | null>(null);

  // Filter completed items based on filter state
  const completedInFilter = items.filter(
    (item) => item.type === 'completed_log' && isDateInFilter(item.date, filter)
  );

  // Counts per category in selected filter
  const dtnCount = completedInFilter.filter((i) => i.category === 'doan_thanh_nien').length;
  const anttCount = completedInFilter.filter((i) => i.category === 'antt_co_so').length;
  const otherCount = completedInFilter.filter((i) => i.category === 'cong_viec_khac').length;
  const totalCompleted = completedInFilter.length;

  // Total images in filter
  const totalImages = completedInFilter.reduce((acc, curr) => acc + (curr.images?.length || 0), 0);

  // Upcoming meetings / tasks
  const upcomingTasks = items
    .filter((item) => item.type === 'scheduled' && item.status !== 'done')
    .sort((a, b) => a.date.localeCompare(b.date));

  // Highlighted achievements in filter
  const highlightedItems = completedInFilter.filter((i) => i.isHighlighted);

  // Recharts data
  const barData = [
    {
      name: 'Đoàn TN',
      count: dtnCount,
      fill: CATEGORIES.doan_thanh_nien.color,
    },
    {
      name: 'ANTT Cơ sở',
      count: anttCount,
      fill: CATEGORIES.antt_co_so.color,
    },
    {
      name: 'Việc khác',
      count: otherCount,
      fill: CATEGORIES.cong_viec_khac.color,
    },
  ];

  const pieData = [
    { name: 'Đoàn Thanh Niên', value: dtnCount, color: CATEGORIES.doan_thanh_nien.color },
    { name: 'ANTT Cơ Sở', value: anttCount, color: CATEGORIES.antt_co_so.color },
    { name: 'Việc Khác', value: otherCount, color: CATEGORIES.cong_viec_khac.color },
  ].filter((d) => d.value > 0);

  const periodLabel = getFilterPeriodLabel(filter);

  return (
    <div className="space-y-5 animate-fade-in pb-20 md:pb-8">
      {/* Top Banner & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Tổng Quan Hoạt Động</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {periodLabel}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi khối lượng công việc, lịch trình và báo cáo khen thưởng
          </p>
        </div>

        <button
          onClick={() => openQuickCapture()}
          className="self-start sm:self-auto py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>Chụp nhanh / Ghi việc</span>
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Tổng đã làm */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Việc đã hoàn thành
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalCompleted}
            </span>
            <span className="text-xs text-slate-500">nhiệm vụ</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 truncate">
            <span>Trong kỳ: {periodLabel}</span>
          </div>
        </div>

        {/* Card 2: Đoàn Thanh Niên */}
        <div
          onClick={() => setActiveTab('work_log')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-l-4 border-l-blue-600 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Đoàn Thanh Niên
            </span>
            <img src="/assets/logo-doan.png" alt="Đoàn Thanh Niên" className="w-8 h-8 object-contain" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {dtnCount}
            </span>
            <span className="text-xs text-slate-500">hoạt động</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Phong trào, xung kích</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: ANTT Cơ Sở */}
        <div
          onClick={() => setActiveTab('work_log')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-l-4 border-l-red-600 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              ANTT Cơ Sở
            </span>
            <img src="/assets/logo-antt.png" alt="Bảo Vệ ANTT" className="w-8 h-8 object-contain" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
              {anttCount}
            </span>
            <span className="text-xs text-slate-500">nhiệm vụ</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tuần tra, hòa giải</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Kế hoạch & Ảnh */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lịch sắp tới & Ảnh
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {upcomingTasks.length}
              </span>
              <span className="text-[11px] text-slate-500 ml-1">lịch họp</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div>
              <span className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">
                {totalImages}
              </span>
              <span className="text-[11px] text-slate-500 ml-1">ảnh</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Minh chứng Google Drive</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart: Phân bổ 3 mảng */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Khối Lượng Theo 3 Mảng Phụ Trách</span>
              </h3>
              <p className="text-xs text-slate-400">Số lượng nhiệm vụ thực hiện trong {periodLabel}</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Tổng: {totalCompleted}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [`${value} nhiệm vụ`, 'Số lượng']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Tỷ lệ % */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Tỷ Trọng Công Việc (%)
            </h3>
            <p className="text-xs text-slate-400 mb-2">Cơ cấu theo mảng</p>

            <div className="h-44 w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} việc`, '']}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderRadius: '8px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-slate-400 py-8">
                  Chưa có dữ liệu trong kỳ này
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {Object.values(CATEGORIES).map((cat) => {
              const count =
                cat.id === 'doan_thanh_nien'
                  ? dtnCount
                  : cat.id === 'antt_co_so'
                  ? anttCount
                  : otherCount;
              const percent = totalCompleted > 0 ? Math.round((count / totalCompleted) * 100) : 0;
              return (
                <div key={cat.id} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.shortLabel}</span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Columns: Upcoming Schedule vs Highlighted Accomplishments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Lịch họp & Kế hoạch sắp tới */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Lịch Họp & Kế Hoạch Sắp Tới
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('scheduler')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Không có lịch họp nào sắp tới. Bạn có thể tạo thêm!
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORIES[task.category].color }}
                      />
                      <span className="text-[11px] font-semibold text-slate-500">
                        {CATEGORIES[task.category].shortLabel}
                      </span>
                      <span className="text-[11px] text-blue-600 font-medium">
                        {formatVNDate(task.date)} {task.time ? `• ${task.time}` : ''}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                      {task.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => setSelectedItemForComplete(task)}
                    className="self-end sm:self-center py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0"
                    title="Hoàn thành lịch họp và bổ sung ảnh hiện trường"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hoàn thành & Thêm ảnh</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Việc tiêu biểu (Xét khen thưởng) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Công Việc Tiêu Biểu Xét Khen Thưởng
              </h3>
            </div>
            <button
              onClick={() => {
                setActiveTab('reports');
              }}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Lập báo cáo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {highlightedItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có công việc nào gắn sao ⭐ tiêu biểu trong kỳ này.
            </div>
          ) : (
            <div className="space-y-2.5">
              {highlightedItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForDetail(item)}
                  className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 transition-colors cursor-pointer flex items-start gap-3"
                >
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {item.description}
                    </p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                      {formatVNDate(item.date)} • {item.images.length} ảnh minh chứng
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedItemForComplete && (
        <CompleteTaskModal
          item={selectedItemForComplete}
          onClose={() => setSelectedItemForComplete(null)}
        />
      )}

      {selectedItemForDetail && (
        <WorkItemDetailModal
          item={selectedItemForDetail}
          onClose={() => setSelectedItemForDetail(null)}
          onEdit={(it) => {
            setSelectedItemForDetail(null);
            openQuickCapture(it);
          }}
        />
      )}
    </div>
  );
};
