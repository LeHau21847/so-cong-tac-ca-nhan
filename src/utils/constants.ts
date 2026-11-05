// src/utils/constants.ts
import { Category } from '../types';

export interface CategoryMeta {
  id: Category;
  label: string;
  shortLabel: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  lightBg: string;
  accentBg: string;
  driveFolder: string;
  description: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  doan_thanh_nien: {
    id: 'doan_thanh_nien',
    label: 'Đoàn Thanh Niên',
    shortLabel: 'Đoàn TN',
    color: '#0066FF',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-blue-600',
    lightBg: 'bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    accentBg: 'bg-blue-500 hover:bg-blue-600 text-white',
    driveFolder: '01_Doan_Thanh_Nien',
    description: 'Hoạt động phong trào, tình nguyện, sinh hoạt chi đoàn, phát triển thanh niên',
  },
  antt_co_so: {
    id: 'antt_co_so',
    label: 'ANTT Cơ Sở',
    shortLabel: 'ANTT',
    color: '#DC2626',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-red-600',
    lightBg: 'bg-red-50/80 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900',
    accentBg: 'bg-red-600 hover:bg-red-700 text-white',
    driveFolder: '02_ANTT_Co_So',
    description: 'Tuần tra kiểm soát, an ninh trật tự địa bàn, hòa giải cơ sở, phòng chống tội phạm',
  },
  cong_viec_khac: {
    id: 'cong_viec_khac',
    label: 'Công Việc Khác',
    shortLabel: 'Việc Khác',
    color: '#7C3AED',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-purple-600',
    lightBg: 'bg-purple-50/80 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900',
    accentBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    driveFolder: '03_Cong_Viec_Khac',
    description: 'Nhiệm vụ chuyên môn, hành chính cơ quan, bồi dưỡng học tập và nhiệm vụ đột xuất',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const DEFAULT_SETTINGS = {
  gasApiUrl: 'https://script.google.com/macros/s/AKfycbzad_EbB8ZC3tQeJGJ2vpCZ6t5s4ybupZKJ5bsAhrtww1AQLNELU7mUZh8AFs_ZESAC/exec',
  userName: 'Cán Bộ Phụ Trách',
  userRole: 'Bí thư Đoàn / Phụ trách ANTT Cơ sở',
  unitName: 'UBND Xã/Phường - Công an Xã/Phường',
  theme: 'light' as const,
};

