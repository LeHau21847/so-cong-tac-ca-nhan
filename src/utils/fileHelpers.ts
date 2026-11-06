// src/utils/fileHelpers.ts

export interface FileTypeInfo {
  type: 'pdf' | 'word' | 'excel' | 'powerpoint' | 'text' | 'document';
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconColor: string;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileTypeInfo(fileName: string): FileTypeInfo {
  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';

  if (['pdf'].includes(ext)) {
    return {
      type: 'pdf',
      label: 'PDF',
      badgeBg: 'bg-red-100 dark:bg-red-950/60',
      badgeText: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
    };
  }

  if (['doc', 'docx'].includes(ext)) {
    return {
      type: 'word',
      label: 'Word',
      badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
      badgeText: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
    };
  }

  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return {
      type: 'excel',
      label: 'Excel',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    };
  }

  if (['ppt', 'pptx'].includes(ext)) {
    return {
      type: 'powerpoint',
      label: 'PowerPoint',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
      badgeText: 'text-amber-700 dark:text-amber-300',
      borderColor: 'border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
    };
  }

  if (['txt', 'md'].includes(ext)) {
    return {
      type: 'text',
      label: 'Văn bản',
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-700 dark:text-slate-300',
      borderColor: 'border-slate-200 dark:border-slate-700',
      iconColor: 'text-slate-600 dark:text-slate-400',
    };
  }

  return {
    type: 'document',
    label: ext.toUpperCase() || 'Tài liệu',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
  };
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lỗi khi đọc tệp văn bản'));
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
