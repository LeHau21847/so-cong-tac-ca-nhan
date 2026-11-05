// src/components/quick-capture/QuickCaptureModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Category, WorkImage, WorkItemType } from '../../types';
import { CATEGORIES } from '../../utils/constants';
import { compressImage, formatBytes, CompressedImageResult } from '../../utils/imageCompressor';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dateHelpers';
import { uploadImageToDrive } from '../../services/storage';
import {
  Camera,
  Image as ImageIcon,
  X,
  Star,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  Loader2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const QuickCaptureModal: React.FC = () => {
  const {
    isQuickCaptureOpen,
    closeQuickCapture,
    quickCaptureInitialData,
    addItem,
    settings,
    showToast,
  } = useApp();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<Category>('doan_thanh_nien');
  const [type, setType] = useState<WorkItemType>('completed_log');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Images state
  const [images, setImages] = useState<WorkImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionSummary, setCompressionSummary] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick title suggestions based on category
  const titleSuggestions: Record<Category, string[]> = {
    doan_thanh_nien: [
      'Ra quân Ngày Chủ nhật Xanh vệ sinh môi trường',
      'Họp Ban Chấp hành Đoàn triển khai nhiệm vụ mới',
      'Tổ chức sinh hoạt chuyên đề cho thanh thiếu nhi',
      'Hoạt động đền ơn đáp nghĩa, thăm tặng quà gia đình chính sách',
      'Đội hình thanh niên tình nguyện hỗ trợ dịch vụ công trực tuyến',
    ],
    antt_co_so: [
      'Tuần tra kiểm soát ban đêm đảm bảo ANTT địa bàn',
      'Hòa giải cơ sở thành công mâu thuẫn tranh chấp dân sự',
      'Tuyên truyền phòng chống tội phạm và PCCC tại cơ sở',
      'Kiểm tra tạm trú, tạm vắng và trật tự kinh doanh',
      'Phối hợp xử lý phản ánh trật tự đô thị, an toàn giao thông',
    ],
    cong_viec_khac: [
      'Trực giải quyết thủ tục hành chính tại bộ phận Một cửa',
      'Họp giao ban cơ quan triển khai công việc tuần',
      'Tham gia lớp tập huấn, bồi dưỡng chuyên môn nghiệp vụ',
      'Kiểm tra tiến độ công tác dân vận, xây dựng nông thôn mới / đô thị văn minh',
    ],
  };

  useEffect(() => {
    if (quickCaptureInitialData) {
      if (quickCaptureInitialData.category) setCategory(quickCaptureInitialData.category);
      if (quickCaptureInitialData.type) setType(quickCaptureInitialData.type);
      if (quickCaptureInitialData.title) setTitle(quickCaptureInitialData.title);
      if (quickCaptureInitialData.date) setDate(quickCaptureInitialData.date);
      if (quickCaptureInitialData.time) setTime(quickCaptureInitialData.time);
      if (quickCaptureInitialData.location) setLocation(quickCaptureInitialData.location);
      if (quickCaptureInitialData.description) setDescription(quickCaptureInitialData.description);
      if (quickCaptureInitialData.images) setImages(quickCaptureInitialData.images);
      if (quickCaptureInitialData.isHighlighted !== undefined) setIsHighlighted(quickCaptureInitialData.isHighlighted);
    } else {
      // Default reset
      setCategory('doan_thanh_nien');
      setType('completed_log');
      setTitle('');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      setLocation('');
      setDescription('');
      setImages([]);
      setIsHighlighted(false);
      setCompressionSummary(null);
    }
  }, [quickCaptureInitialData, isQuickCaptureOpen]);

  if (!isQuickCaptureOpen) return null;

  // Handle files selected from camera or gallery
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    let totalOrig = 0;
    let totalComp = 0;

    const newCompressedImages: WorkImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalOrig += file.size;

        const result: CompressedImageResult = await compressImage(file, 1600, 0.78);
        totalComp += result.compressedSize;

        newCompressedImages.push({
          id: 'img_' + Date.now() + '_' + i,
          url: result.previewUrl,
          base64: result.base64,
          createdAt: new Date().toISOString(),
          caption: '',
        });
      }

      setImages((prev) => [...prev, ...newCompressedImages]);

      const percent = Math.round((1 - totalComp / totalOrig) * 100);
      setCompressionSummary(
        `Đã nén ${files.length} ảnh: ${formatBytes(totalOrig)} → ${formatBytes(totalComp)} (Giảm ${percent}%), sẵn sàng tải siêu tốc!`
      );
    } catch (err: any) {
      showToast('Lỗi khi xử lý nén ảnh: ' + err.message, 'error');
    } finally {
      setIsCompressing(false);
      // Reset input value so same files can be chosen again if needed
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If title is empty, generate an intuitive default title
      const finalTitle =
        title.trim() ||
        `${CATEGORIES[category].label} - ${type === 'completed_log' ? 'Công tác' : 'Lịch họp'} ngày ${date}`;

      // Final images array to save
      let finalImages = [...images];

      // If Google Apps Script URL is set and we have images with base64, we can asynchronously upload to Google Drive
      if (settings.gasApiUrl && images.some((img) => img.base64)) {
        showToast('Đang lưu công việc và tải ảnh lên Google Drive...', 'info');

        const yearMonth = date.substring(0, 7) || new Date().toISOString().substring(0, 7);

        // Upload images one by one to Google Drive
        const uploadedImages = await Promise.all(
          images.map(async (img, idx) => {
            if (img.base64) {
              try {
                const uploadRes = await uploadImageToDrive(
                  img.base64,
                  `photo_${date}_${idx + 1}.jpg`,
                  category,
                  yearMonth,
                  settings.gasApiUrl
                );
                if (uploadRes.success && uploadRes.fileData) {
                  return {
                    ...img,
                    url: uploadRes.fileData.url || img.url,
                    driveFileId: uploadRes.fileData.fileId,
                    // keep base64 as fallback for offline
                  };
                }
              } catch (upErr) {
                console.warn('Drive image upload error:', upErr);
              }
            }
            return img;
          })
        );
        finalImages = uploadedImages;
      }

      await addItem({
        title: finalTitle,
        category,
        type,
        status: type === 'completed_log' ? 'done' : 'todo',
        date,
        time,
        location,
        description,
        images: finalImages,
        isHighlighted,
      });

      closeQuickCapture();
    } catch (err: any) {
      showToast('Lỗi lưu công việc: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Chụp Nhanh Hiện Trường & Ghi Việc
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lưu vào Sổ công tác và sao lưu Google Drive 5TB
              </p>
            </div>
          </div>
          <button
            onClick={closeQuickCapture}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. MẢNG PHÂN HỆ (1 CHẠM 3 MỤC) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Chọn Mảng Công Tác (1 Chạm)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(CATEGORIES).map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold border-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-xs ${
                      isSelected
                        ? `${cat.badgeBg} text-white border-transparent scale-[1.02] shadow-md`
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : ''}`}
                      style={{ backgroundColor: isSelected ? '#FFFFFF' : cat.color }}
                    />
                    <span className="truncate">{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. LOẠI HÌNH: ĐÃ LÀM VS KẾ HOẠCH SẮP TỚI */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('completed_log')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'completed_log'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ✓ Đã thực hiện (Nhật ký)
            </button>
            <button
              type="button"
              onClick={() => setType('scheduled')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'scheduled'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📅 Kế hoạch / Lịch họp sắp tới
            </button>
          </div>

          {/* 3. CHỤP ẢNH HIỆN TRƯỜNG & THƯ VIỆN ẢNH */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Ảnh Minh Chứng Hiện Trường ({images.length})
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                Tự nén Client Canvas ~400KB/ảnh
              </span>
            </div>

            {/* Hidden native inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Action buttons to trigger camera or library */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isCompressing}
                className="py-3 px-3 rounded-xl border-2 border-dashed border-blue-400 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm active:scale-98 transition-all"
              >
                <Camera className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Chụp Camera sau</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isCompressing}
                className="py-3 px-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm active:scale-98 transition-all"
              >
                <ImageIcon className="w-5 h-5 text-slate-500 shrink-0" />
                <span>Chọn từ thư viện</span>
              </button>
            </div>

            {/* Compressing status */}
            {isCompressing && (
              <div className="mt-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Đang tối ưu & nén ảnh thông minh ở độ phân giải cao...</span>
              </div>
            )}

            {/* Compression summary */}
            {compressionSummary && (
              <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {compressionSummary}
              </p>
            )}

            {/* Preview image thumbnails */}
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs"
                  >
                    <img
                      src={img.url}
                      alt={`Minh chứng ${idx + 1}`}
                      className="w-full h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Ghi chú ảnh..."
                      value={img.caption || ''}
                      onChange={(e) => updateImageCaption(idx, e.target.value)}
                      className="w-full px-2 py-1 text-[11px] bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 outline-hidden truncate"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. TIÊU ĐỀ CÔNG VIỆC / CUỘC HỌP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Tên Công Việc / Nội Dung Cuộc Họp
              </label>
            </div>
            <input
              type="text"
              placeholder={`VD: ${titleSuggestions[category][0]}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
            />

            {/* Quick title suggestions pills */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 self-center">
                <Sparkles className="w-3 h-3 text-amber-500" /> Gợi ý nhanh:
              </span>
              {titleSuggestions[category].slice(0, 3).map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors truncate max-w-[200px]"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 5. THỜI GIAN & ĐỊA ĐIỂM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Ngày thực hiện
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Giờ cụ thể
              </label>
              <input
                type="text"
                placeholder="VD: 08:00 - 11:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Địa điểm công tác / Phòng họp
            </label>
            <input
              type="text"
              placeholder="VD: Nhà văn hóa Thôn 2 / Phòng họp UBND Xã"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden"
            />
          </div>

          {/* 6. NỘI DUNG CHI TIẾT & KẾT QUẢ ĐẠT ĐƯỢC */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Nội dung chi tiết, kết quả đạt được hoặc chỉ đạo
            </label>
            <textarea
              rows={3}
              placeholder="Ghi vắn tắt các số liệu, chỉ đạo quan trọng hoặc kết quả giải quyết..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden resize-none"
            />
          </div>

          {/* 7. ĐÁNH DẤU SAO: CÔNG VIỆC TIÊU BIỂU / XÉT KHEN THƯỞNG */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star
                className={`w-5 h-5 ${
                  isHighlighted ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                }`}
              />
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                  Công việc tiêu biểu (Xét khen thưởng)
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                  Gắn sao để lọc nhanh khi làm báo cáo thi đua, tổng kết năm
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isHighlighted}
                onChange={(e) => setIsHighlighted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center gap-3">
          <button
            type="button"
            onClick={closeQuickCapture}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isCompressing}
            className="flex-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Lưu vào Sổ Công Tác</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

