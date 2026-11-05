// src/components/work-log/WorkLogView.tsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { CategoryBadge } from '../common/CategoryBadge';
import { WorkItemDetailModal } from './WorkItemDetailModal';
import { isDateInFilter, formatVNDate } from '../../utils/dateHelpers';
import { CATEGORIES } from '../../utils/constants';
import { WorkItem } from '../../types';
import {
  LayoutGrid,
  Table as TableIcon,
  Star,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Plus,
  Search,
} from 'lucide-react';

export const WorkLogView: React.FC = () => {
  const { items, filter, setFilter, openQuickCapture, toggleHighlight } = useApp();

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);

  // Filter items: completed_log only, matching search query and date interval
  const filteredItems = items
    .filter((item) => {
      // Must match search query
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchLoc = (item.location || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }

      // Category filter
      if (filter.category !== 'all' && item.category !== filter.category) {
        return false;
      }

      // Highlighted only filter
      if (filter.onlyHighlighted && !item.isHighlighted) {
        return false;
      }

      // Time cycle filter
      return isDateInFilter(item.date, filter);
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4 animate-fade-in pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Sổ Công Tác Đã Thực Hiện</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {filteredItems.length} việc
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Nhật ký công tác theo dõi kết quả thực hiện và bằng chứng hình ảnh
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Card / Table Switcher */}
          <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Chế độ Thẻ (Card View)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Chế độ Bảng (Table View)"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openQuickCapture({ type: 'completed_log' })}
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi việc mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Mobile Search input if not on desktop */}
      <div className="md:hidden relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm kiếm công việc, cuộc họp..."
          value={filter.searchQuery}
          onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-hidden"
        />
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Không tìm thấy công việc nào
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Không có bản ghi nào phù hợp với bộ lọc hiện tại. Thử chọn "Tất cả" hoặc tạo một bản ghi mới.
          </p>
          <button
            onClick={() => openQuickCapture({ type: 'completed_log' })}
            className="py-2 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi nhận công việc ngay</span>
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const cat = CATEGORIES[item.category] || CATEGORIES.cong_viec_khac;
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group ${cat.cardBorder}`}
              >
                {/* Image Preview Banner if images exist */}
                {item.images && item.images.length > 0 && (
                  <div className="relative h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Image count pill */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>{item.images.length} ảnh</span>
                    </div>

                    {/* Star highlight top right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHighlight(item.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-xs text-white hover:bg-black/60 transition-colors"
                      title={item.isHighlighted ? 'Bỏ sao tiêu biểu' : 'Gắn sao tiêu biểu'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isHighlighted ? 'text-amber-400 fill-amber-400' : 'text-white'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Card Body */}
                <div
                  className="p-4 flex-1 flex flex-col justify-between cursor-pointer space-y-2.5"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <CategoryBadge category={item.category} size="sm" />
                      {!item.images || item.images.length === 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHighlight(item.id);
                          }}
                          className="p-1 text-slate-300 hover:text-amber-500"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              item.isHighlighted ? 'text-amber-500 fill-amber-500' : ''
                            }`}
                          />
                        </button>
                      ) : null}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      <span>{formatVNDate(item.date)}</span>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-1 max-w-[140px] truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Desktop Optimized) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">⭐</th>
                  <th className="py-3 px-3 w-32">Ngày & Giờ</th>
                  <th className="py-3 px-3 w-36">Mảng</th>
                  <th className="py-3 px-4">Tên công việc / Nội dung</th>
                  <th className="py-3 px-3 w-36">Địa điểm</th>
                  <th className="py-3 px-3 w-20 text-center">Ảnh</th>
                  <th className="py-3 px-3 w-16 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleHighlight(item.id)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            item.isHighlighted
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <div>{formatVNDate(item.date)}</div>
                      {item.time && <div className="text-[10px] text-slate-400">{item.time}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <CategoryBadge category={item.category} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-[140px]">
                      {item.location || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.images && item.images.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-semibold">
                          <ImageIcon className="w-3 h-3" />
                          {item.images.length}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs">
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <WorkItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={(it) => {
            setSelectedItem(null);
            openQuickCapture(it);
          }}
        />
      )}
    </div>
  );
};
