// src/components/work-log/WorkItemDetailModal.tsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import { formatVNDate } from '../../utils/dateHelpers';
import {
  X,
  Star,
  MapPin,
  Clock,
  Calendar,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';

interface WorkItemDetailModalProps {
  item: WorkItem | null;
  onClose: () => void;
  onEdit: (item: WorkItem) => void;
}

export const WorkItemDetailModal: React.FC<WorkItemDetailModalProps> = ({
  item,
  onClose,
  onEdit,
}) => {
  const { toggleHighlight, deleteItem, openLightbox } = useApp();

  if (!item) return null;

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi công việc này không?')) {
      deleteItem(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={item.category} size="md" />
              <span
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  item.type === 'completed_log'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                {item.type === 'completed_log' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-3 h-3" /> Kế hoạch sắp tới
                  </>
                )}
              </span>
              {item.isHighlighted && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Tiêu biểu
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Metadata badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                <strong>Ngày:</strong> {formatVNDate(item.date, true)}
              </span>
            </div>
            {item.time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span>
                  <strong>Thời gian:</strong> {item.time}
                </span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>
                  <strong>Địa điểm:</strong> {item.location}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nội dung chi tiết & Kết quả thực hiện
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
              {item.description || 'Chưa có mô tả chi tiết.'}
            </div>
          </div>

          {/* Photos */}
          {item.images && item.images.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Hình ảnh minh chứng thực tế ({item.images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {item.images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    onClick={() =>
                      openLightbox({
                        url: img.url,
                        caption: img.caption,
                        title: item.title,
                      })
                    }
                    className="group cursor-pointer relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs hover:shadow-md transition-all"
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'Minh chứng'}
                      className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    {img.caption && (
                      <p className="p-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-white/95 dark:bg-slate-900/95 truncate">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-2">
          {/* Toggle Star */}
          <button
            onClick={() => toggleHighlight(item.id)}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              item.isHighlighted
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                item.isHighlighted ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
              }`}
            />
            <span>{item.isHighlighted ? 'Đang gắn sao Tiêu biểu' : 'Gắn sao Khen thưởng'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </button>
            <button
              onClick={handleDelete}
              className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

