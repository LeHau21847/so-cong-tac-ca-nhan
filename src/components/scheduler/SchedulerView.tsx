// src/components/scheduler/SchedulerView.tsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryBadge } from '../common/CategoryBadge';
import { CompleteTaskModal } from './CompleteTaskModal';
import { WorkItemDetailModal } from '../work-log/WorkItemDetailModal';
import { formatVNDate, getTodayDateString } from '../../utils/dateHelpers';
import { CATEGORIES } from '../../utils/constants';
import { WorkItem } from '../../types';
import {
  CalendarCheck2,
  CheckCircle2,
  Plus,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  FileEdit,
  Trash2,
} from 'lucide-react';
import { isToday, isTomorrow, isThisWeek, parseISO, isPast } from 'date-fns';

export const SchedulerView: React.FC = () => {
  const { items, openQuickCapture, deleteItem } = useApp();

  const [completingItem, setCompletingItem] = useState<WorkItem | null>(null);
  const [inspectingItem, setInspectingItem] = useState<WorkItem | null>(null);

  // Scheduled tasks only
  const scheduledTasks = items
    .filter((item) => item.type === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date));

  // Timeline grouping:
  // 1. Quá hạn / Cần xử lý ngay (Past date)
  // 2. Hôm nay
  // 3. Ngày mai
  // 4. Tuần này
  // 5. Thời gian tới
  const todayTasks: WorkItem[] = [];
  const tomorrowTasks: WorkItem[] = [];
  const thisWeekTasks: WorkItem[] = [];
  const upcomingTasks: WorkItem[] = [];
  const pastDueTasks: WorkItem[] = [];

  scheduledTasks.forEach((task) => {
    try {
      const d = parseISO(task.date);
      if (isToday(d)) {
        todayTasks.push(task);
      } else if (isTomorrow(d)) {
        tomorrowTasks.push(task);
      } else if (isPast(d)) {
        pastDueTasks.push(task);
      } else if (isThisWeek(d, { weekStartsOn: 1 })) {
        thisWeekTasks.push(task);
      } else {
        upcomingTasks.push(task);
      }
    } catch {
      upcomingTasks.push(task);
    }
  });

  const renderTaskCard = (task: WorkItem) => {
    const cat = CATEGORIES[task.category] || CATEGORIES.cong_viec_khac;
    return (
      <div
        key={task.id}
        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cat.cardBorder}`}
      >
        <div
          className="space-y-1.5 flex-1 cursor-pointer"
          onClick={() => setInspectingItem(task)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={task.category} size="sm" />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatVNDate(task.date)}
            </span>
            {task.time && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {task.time}
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
            {task.title}
          </h3>

          {task.location && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{task.location}</span>
            </p>
          )}

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => setCompletingItem(task)}
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
            title="Đánh dấu đã xong và bổ sung ảnh chụp hiện trường"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hoàn thành & Bổ sung ảnh</span>
          </button>

          <button
            onClick={() => openQuickCapture(task)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Chỉnh sửa lịch"
          >
            <FileEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn xóa lịch hẹn này?')) {
                deleteItem(task.id);
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Xóa lịch"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Kế Hoạch & Lịch Họp Sắp Tới</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {scheduledTasks.length} lịch
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý lịch công tác, cuộc họp và chuyển nhanh sang Sổ công tác kèm ảnh thực tế
          </p>
        </div>

        <button
          onClick={() =>
            openQuickCapture({
              type: 'scheduled',
              date: getTodayDateString(),
            })
          }
          className="self-start sm:self-auto py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-500/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lịch mới</span>
        </button>
      </div>

      {scheduledTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 mx-auto flex items-center justify-center">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Chưa có lịch họp hay kế hoạch nào
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ghi trước các cuộc họp giao ban, lịch công tác cơ sở để không bị bỏ sót.
          </p>
          <button
            onClick={() => openQuickCapture({ type: 'scheduled' })}
            className="py-2 px-4 rounded-xl bg-purple-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm lịch họp ngay</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section: Hôm nay */}
          {todayTasks.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Hôm nay ({todayTasks.length})
                </h3>
              </div>
              <div className="space-y-2.5">{todayTasks.map(renderTaskCard)}</div>
            </div>
          )}

          {/* Section: Ngày mai */}
          {tomorrowTasks.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ngày mai ({tomorrowTasks.length})
              </h3>
              <div className="space-y-2.5">{tomorrowTasks.map(renderTaskCard)}</div>
            </div>
          )}

          {/* Section: Tuần này */}
          {thisWeekTasks.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Trong tuần này ({thisWeekTasks.length})
              </h3>
              <div className="space-y-2.5">{thisWeekTasks.map(renderTaskCard)}</div>
            </div>
          )}

          {/* Section: Thời gian tới */}
          {upcomingTasks.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lịch trình sắp tới ({upcomingTasks.length})
              </h3>
              <div className="space-y-2.5">{upcomingTasks.map(renderTaskCard)}</div>
            </div>
          )}

          {/* Section: Cần hoàn thành (Quá hạn) */}
          {pastDueTasks.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-4 h-4" />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Đã đến hạn / Cần xác nhận kết quả ({pastDueTasks.length})
                </h3>
              </div>
              <div className="space-y-2.5">{pastDueTasks.map(renderTaskCard)}</div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {completingItem && (
        <CompleteTaskModal
          item={completingItem}
          onClose={() => setCompletingItem(null)}
        />
      )}

      {inspectingItem && (
        <WorkItemDetailModal
          item={inspectingItem}
          onClose={() => setInspectingItem(null)}
          onEdit={(it) => {
            setInspectingItem(null);
            openQuickCapture(it);
          }}
        />
      )}
    </div>
  );
};

