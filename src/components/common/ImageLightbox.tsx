// src/components/common/ImageLightbox.tsx
import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Download, ExternalLink } from 'lucide-react';

export const ImageLightbox: React.FC = () => {
  const { lightboxImage, closeLightbox } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    if (lightboxImage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [lightboxImage, closeLightbox]);

  if (!lightboxImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      {/* Top action bar */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <a
          href={lightboxImage.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Mở trong tab mới"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        <a
          href={lightboxImage.url}
          download="minh_chung_cong_tac.jpg"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Tải ảnh về máy"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          onClick={closeLightbox}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Đóng (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
        <img
          src={lightboxImage.url}
          alt={lightboxImage.caption || 'Minh chứng công tác'}
          className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
        />
        {(lightboxImage.title || lightboxImage.caption) && (
          <div className="mt-4 text-center px-4 max-w-2xl">
            {lightboxImage.title && (
              <h4 className="text-white font-semibold text-base mb-1">
                {lightboxImage.title}
              </h4>
            )}
            {lightboxImage.caption && (
              <p className="text-slate-300 text-sm">{lightboxImage.caption}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

