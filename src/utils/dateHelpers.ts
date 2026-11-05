// src/utils/dateHelpers.ts
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  isWithinInterval,
  isToday,
  isTomorrow,
  isPast,
  isValid,
} from 'date-fns';
import { FilterState } from '../types';

/**
 * Returns ISO date string (YYYY-MM-DD) for today
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns current time string (HH:mm)
 */
export function getCurrentTimeString(): string {
  return format(new Date(), 'HH:mm');
}

/**
 * Format ISO date string into Vietnamese friendly date
 * e.g., "15/10/2026" or "Thứ Tư, 15/10/2026"
 */
export function formatVNDate(isoDateString: string, withWeekday: boolean = false): string {
  if (!isoDateString) return '';
  const date = parseISO(isoDateString);
  if (!isValid(date)) return isoDateString;

  if (isToday(date)) {
    return 'Hôm nay (' + format(date, 'dd/MM/yyyy') + ')';
  }
  if (isTomorrow(date)) {
    return 'Ngày mai (' + format(date, 'dd/MM/yyyy') + ')';
  }

  const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const weekdayName = weekdays[date.getDay()];

  if (withWeekday) {
    return `${weekdayName}, ${format(date, 'dd/MM/yyyy')}`;
  }
  return format(date, 'dd/MM/yyyy');
}

/**
 * Get Date interval based on filter state
 */
export function getDateRangeForFilter(filter: FilterState): { start: Date; end: Date } | null {
  const now = new Date();
  const year = filter.selectedYear || now.getFullYear();

  switch (filter.cycle) {
    case 'day': {
      const targetDate = filter.selectedDate ? parseISO(filter.selectedDate) : now;
      const d = isValid(targetDate) ? targetDate : now;
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    case 'week': {
      // If selectedDate is provided, use its week; otherwise current week
      const baseDate = filter.selectedDate ? parseISO(filter.selectedDate) : now;
      const validBase = isValid(baseDate) ? baseDate : now;
      const start = startOfWeek(validBase, { weekStartsOn: 1 }); // Monday
      const end = endOfWeek(validBase, { weekStartsOn: 1 }); // Sunday
      return { start, end };
    }

    case 'month': {
      const monthIndex = (filter.selectedMonth || (now.getMonth() + 1)) - 1;
      const targetDate = new Date(year, monthIndex, 1);
      return {
        start: startOfMonth(targetDate),
        end: endOfMonth(targetDate),
      };
    }

    case 'quarter': {
      const q = filter.selectedQuarter || Math.floor(now.getMonth() / 3) + 1;
      const firstMonthOfQuarter = (q - 1) * 3;
      const targetDate = new Date(year, firstMonthOfQuarter, 1);
      return {
        start: startOfQuarter(targetDate),
        end: endOfQuarter(targetDate),
      };
    }

    case 'year': {
      const targetDate = new Date(year, 0, 1);
      return {
        start: startOfYear(targetDate),
        end: endOfYear(targetDate),
      };
    }

    case 'custom': {
      if (filter.dateRange.from && filter.dateRange.to) {
        const start = parseISO(filter.dateRange.from);
        const end = parseISO(filter.dateRange.to);
        if (isValid(start) && isValid(end)) {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
      }
      return null;
    }

    case 'all':
    default:
      return null;
  }
}

/**
 * Check if a date string falls within filter
 */
export function isDateInFilter(dateString: string, filter: FilterState): boolean {
  if (filter.cycle === 'all') return true;
  const range = getDateRangeForFilter(filter);
  if (!range) return true;

  const date = parseISO(dateString);
  if (!isValid(date)) return false;

  return isWithinInterval(date, { start: range.start, end: range.end });
}

/**
 * Human description of the currently selected filter cycle
 */
export function getFilterPeriodLabel(filter: FilterState): string {
  const now = new Date();
  const year = filter.selectedYear || now.getFullYear();

  switch (filter.cycle) {
    case 'day': {
      const targetDate = filter.selectedDate ? parseISO(filter.selectedDate) : now;
      return `Ngày ${format(isValid(targetDate) ? targetDate : now, 'dd/MM/yyyy')}`;
    }
    case 'week': {
      const baseDate = filter.selectedDate ? parseISO(filter.selectedDate) : now;
      const validBase = isValid(baseDate) ? baseDate : now;
      const start = startOfWeek(validBase, { weekStartsOn: 1 });
      const end = endOfWeek(validBase, { weekStartsOn: 1 });
      return `Tuần từ ${format(start, 'dd/MM')} đến ${format(end, 'dd/MM/yyyy')}`;
    }
    case 'month':
      return `Tháng ${filter.selectedMonth}/${year}`;
    case 'quarter':
      return `Quý ${filter.selectedQuarter}/${year}`;
    case 'year':
      return `Năm ${year}`;
    case 'custom':
      if (filter.dateRange.from && filter.dateRange.to) {
        return `Từ ${formatVNDate(filter.dateRange.from)} đến ${formatVNDate(filter.dateRange.to)}`;
      }
      return 'Khoảng thời gian tùy chọn';
    case 'all':
    default:
      return 'Toàn bộ thời gian';
  }
}

export function isDatePast(dateString: string): boolean {
  const date = parseISO(dateString);
  return isValid(date) ? isPast(date) && !isToday(date) : false;
}

