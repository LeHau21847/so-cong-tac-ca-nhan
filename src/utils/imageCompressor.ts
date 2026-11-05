// src/utils/imageCompressor.ts

export interface CompressedImageResult {
  base64: string;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  name: string;
  type: string;
}

/**
 * Smart Client-Side Image Compression using HTML5 Canvas
 * - Constrains max dimension to 1600px (HD/FullHD crispness preserved)
 * - Encodes as JPEG with quality 0.78
 * - Reduces file size to 250KB - 600KB, perfect for quick 4G uploads
 */
export async function compressImage(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.78
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Tệp không phải là hình ảnh hợp lệ'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Trình duyệt không hỗ trợ Canvas 2D'));
          return;
        }

        // Draw image with high quality interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Nén ảnh thất bại'));
              return;
            }

            const base64Reader = new FileReader();
            base64Reader.onloadend = () => {
              const base64 = base64Reader.result as string;
              const previewUrl = URL.createObjectURL(blob);

              resolve({
                base64,
                blob,
                previewUrl,
                width,
                height,
                originalSize: file.size,
                compressedSize: blob.size,
                name: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                type: 'image/jpeg',
              });
            };
            base64Reader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (KB / MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

