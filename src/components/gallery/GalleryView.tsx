// src/components/gallery/GalleryView.tsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import { CATEGORIES } from '../../utils/constants';
import { formatVNDate } from '../../utils/dateHelpers';
import {
  Images,
  Folder,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { items, openLightbox } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  // Extract all images with their parent item context
  const allImages: {
    id: string;
    url: string;
    caption?: string;
    category: Category;
    itemTitle: string;
    itemDate: string;
    itemId: string;
  }[] = [];

  items.forEach((item) => {
    if (item.images && item.images.length > 0) {
      item.images.forEach((img) => {
        allImages.push({
          id: img.id,
          url: img.url,
          caption: img.caption,
          category: item.category,
          itemTitle: item.title,
          itemDate: item.date,
          itemId: item.id,
        });
      });
    }
  });

  // Filter by category
  const filteredImages = selectedCategory === 'all'
    ? allImages
    : allImages.filter((img) => img.category === selectedCategory);

  // Group counts
  const dtnImagesCount = allImages.filter((i) => i.category === 'doan_thanh_nien').length;
  const anttImagesCount = allImages.filter((i) => i.category === 'antt_co_so').length;
  const otherImagesCount = allImages.filter((i) => i.category === 'cong_viec_khac').length;

  return (
    <div className="space-y-5 animate-fade-in pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Thư Viện Minh Chứng Hoạt Động</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {filteredImages.length} bức ảnh
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Lưu trữ và phân loại tự động trên Google Drive 5TB theo phân hệ công tác
          </p>
        </div>
      </div>

      {/* Category Folders Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Folder className="w-5 h-5" />
            <span className="text-xs font-bold">{allImages.length}</span>
          </div>
          <p className="text-xs font-semibold">Tất cả hình ảnh</p>
          <p className={`text-[10px] mt-0.5 ${selectedCategory === 'all' ? 'text-blue-100' : 'text-slate-400'}`}>
            Toàn bộ hoạt động
          </p>
        </button>

        <button
          onClick={() => setSelectedCategory('doan_thanh_nien')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedCategory === 'doan_thanh_nien'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <img src="/assets/logo-doan.png" alt="Đoàn TN" className="w-5 h-5 object-contain" />
            <span className="text-xs font-bold">{dtnImagesCount}</span>
          </div>
          <p className="text-xs font-semibold truncate">Đoàn Thanh Niên</p>
          <p className={`text-[10px] mt-0.5 truncate ${selectedCategory === 'doan_thanh_nien' ? 'text-blue-100' : 'text-slate-400'}`}>
            01_Doan_Thanh_Nien
          </p>
        </button>

        <button
          onClick={() => setSelectedCategory('antt_co_so')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedCategory === 'antt_co_so'
              ? 'bg-red-600 text-white border-red-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <img src="/assets/logo-antt.png" alt="ANTT" className="w-5 h-5 object-contain" />
            <span className="text-xs font-bold">{anttImagesCount}</span>
          </div>
          <p className="text-xs font-semibold truncate">ANTT Cơ Sở</p>
          <p className={`text-[10px] mt-0.5 truncate ${selectedCategory === 'antt_co_so' ? 'text-red-100' : 'text-slate-400'}`}>
            02_ANTT_Co_So
          </p>
        </button>

        <button
          onClick={() => setSelectedCategory('cong_viec_khac')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedCategory === 'cong_viec_khac'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs font-bold">{otherImagesCount}</span>
          </div>
          <p className="text-xs font-semibold truncate">Công Việc Khác</p>
          <p className={`text-[10px] mt-0.5 truncate ${selectedCategory === 'cong_viec_khac' ? 'text-purple-100' : 'text-slate-400'}`}>
            03_Cong_Viec_Khac
          </p>
        </button>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Images className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Chưa có hình ảnh minh chứng nào
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khi chụp ảnh hiện trường hoặc hoàn thành lịch họp kèm ảnh, các bức ảnh sẽ tự động hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredImages.map((img, idx) => {
            const cat = CATEGORIES[img.category] || CATEGORIES.cong_viec_khac;
            return (
              <div
                key={img.id || idx}
                onClick={() =>
                  openLightbox({
                    url: img.url,
                    caption: img.caption,
                    title: img.itemTitle,
                  })
                }
                className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={img.url}
                    alt={img.caption || img.itemTitle}
                    className="w-full h-full object-cover transition-transform group-hover:scale-108 duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  {/* Category dot */}
                  <span
                    className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>

                <div className="p-2.5 space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {img.itemTitle}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatVNDate(img.itemDate)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
