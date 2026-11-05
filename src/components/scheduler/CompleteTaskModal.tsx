// src/components/scheduler/CompleteTaskModal.tsx
import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem, WorkImage } from '../../types';
import { compressImage, CompressedImageResult } from '../../utils/imageCompressor';
import { uploadImageToDrive } from '../../services/storage';
import {
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  X,
  Trash2,
  Loader2,
} from 'lucide-react';

interface CompleteTaskModalProps {
  item: WorkItem | null;
  onClose: () => void;
}

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({ item, onClose }) => {
  const { completeScheduledItem, settings, showToast } = useApp();

  const [resultNotes, setResultNotes] = useState('');
  const [images, setImages] = useState<WorkImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const newCompressedImages: WorkImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result: CompressedImageResult = await compressImage(file, 1600, 0.78);
        newCompressedImages.push({
          id: 'img_' + Date.now() + '_' + i,
          url: result.previewUrl,
          base64: result.base64,
          createdAt: new Date().toISOString(),
          caption: 'Ảnh thực tế tại buổi làm việc / cuộc họp',
        });
      }
      setImages((prev) => [...prev, ...newCompressedImages]);
    } catch (err: any) {
      showToast('Lỗi nén ảnh: ' + err.message, 'error');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImages = [...images];

      // Upload to Google Drive if configured
      if (settings.gasApiUrl && images.some((img) => img.base64)) {
        showToast('Đang tải ảnh minh chứng lên Google Drive...', 'info');
        const yearMonth = item.date ? item.date.substring(0, 7) : new Date().toISOString().substring(0, 7);

        const uploadedImages = await Promise.all(
          images.map(async (img, idx) => {
            if (img.base64) {
              try {
                const uploadRes = await uploadImageToDrive(
                  img.base64,
                  `complete_${item.id}_${idx + 1}.jpg`,
                  item.category,
                  yearMonth,
                  settings.gasApiUrl
                );
                if (uploadRes.success && uploadRes.fileData) {
                  return {
                    ...img,
                    url: uploadRes.fileData.url || img.url,
                    driveFileId: uploadRes.fileData.fileId,
                  };
                }
              } catch (e) {
                console.warn('Drive upload error', e);
              }
            }
            return img;
          })
        );
        finalImages = uploadedImages;
      }

      await completeScheduledItem(item.id, resultNotes, finalImages);
      onClose();
    } catch (err: any) {
      showToast('Lỗi cập nhật hoàn thành: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Hoàn Thành & Bổ Sung Ảnh
              </h3>
              <p className="text-xs text-slate-500">
                Chuyển lịch sang Sổ công tác đã hoàn thành
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Công việc / Cuộc họp:
            </p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {item.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {item.date} {item.time ? `• ${item.time}` : ''} {item.location ? `• ${item.location}` : ''}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kết quả thực hiện / Ý kiến chỉ đạo sau cuộc họp
            </label>
            <textarea
              rows={3}
              required
              placeholder="VD: Cuộc họp đã thống nhất các chỉ tiêu; đã phân công nhiệm vụ cụ thể cho từng thành viên..."
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Bổ sung ảnh chụp hiện trường thực tế ({images.length})
            </label>

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

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isCompressing}
                className="py-2.5 px-3 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Chụp ảnh ngay</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isCompressing}
                className="py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Chọn từ máy</span>
              </button>
            </div>

            {isCompressing && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang nén ảnh HD...
              </p>
            )}

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={img.url} alt="Minh chứng" className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận Hoàn Thành</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

