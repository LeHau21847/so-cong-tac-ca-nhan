// src/components/reports/ReportView.tsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { isDateInFilter, getFilterPeriodLabel, formatVNDate } from '../../utils/dateHelpers';
import { CATEGORIES } from '../../utils/constants';
import {
  Copy,
  Download,
  Printer,
  Check,
  Award,
} from 'lucide-react';

export const ReportView: React.FC = () => {
  const { items, filter, settings, showToast, openLightbox } = useApp();

  const [copied, setCopied] = useState(false);

  // Filter completed items in period
  const completedItems = items
    .filter((item) => {
      if (item.type !== 'completed_log') return false;
      if (filter.category !== 'all' && item.category !== filter.category) return false;
      if (filter.onlyHighlighted && !item.isHighlighted) return false;
      return isDateInFilter(item.date, filter);
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const dtnItems = completedItems.filter((i) => i.category === 'doan_thanh_nien');
  const anttItems = completedItems.filter((i) => i.category === 'antt_co_so');
  const otherItems = completedItems.filter((i) => i.category === 'cong_viec_khac');
  const highlightedItems = completedItems.filter((i) => i.isHighlighted);

  const periodLabel = getFilterPeriodLabel(filter);

  // Generate plain-text Administrative Report for Copying into Word/Zalo
  const generateReportText = () => {
    let text = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n-------------------------\n\n`;
    text += `BÁO CÁO KẾT QUẢ CÔNG TÁC CÁ NHÂN\n`;
    text += `Kỳ báo cáo: ${periodLabel}\n`;
    text += `Họ và tên: ${settings.userName || 'Cán bộ phụ trách'}\n`;
    text += `Chức vụ: ${settings.userRole || 'Bí thư Đoàn / Phụ trách ANTT Cơ sở'}\n`;
    text += `Đơn vị: ${settings.unitName || 'UBND Xã/Phường'}\n\n`;
    text += `═══════════════════════════════════════════\n`;

    // Section 1: Đoàn Thanh Niên
    text += `I. CÔNG TÁC ĐOÀN THANH NIÊN (${dtnItems.length} nhiệm vụ)\n`;
    if (dtnItems.length === 0) {
      text += `  (Không có phát sinh hoạt động trong kỳ)\n\n`;
    } else {
      dtnItems.forEach((it, idx) => {
        text += `  ${idx + 1}. [${formatVNDate(it.date)}] ${it.title}${it.isHighlighted ? ' [⭐ TIÊU BIỂU]' : ''}\n`;
        if (it.location) text += `     - Địa điểm: ${it.location}\n`;
        if (it.description) text += `     - Nội dung / Kết quả: ${it.description}\n`;
        if (it.images && it.images.length > 0) {
          text += `     - Minh chứng ảnh: ${it.images.length} ảnh (${it.images.map(img => img.url).join(', ')})\n`;
        }
      });
      text += `\n`;
    }

    // Section 2: ANTT Cơ Sở
    text += `II. CÔNG TÁC AN NINH TRẬT TỰ CƠ SỞ (${anttItems.length} nhiệm vụ)\n`;
    if (anttItems.length === 0) {
      text += `  (Không có phát sinh hoạt động trong kỳ)\n\n`;
    } else {
      anttItems.forEach((it, idx) => {
        text += `  ${idx + 1}. [${formatVNDate(it.date)}] ${it.title}${it.isHighlighted ? ' [⭐ TIÊU BIỂU]' : ''}\n`;
        if (it.location) text += `     - Địa điểm: ${it.location}\n`;
        if (it.description) text += `     - Nội dung / Kết quả: ${it.description}\n`;
        if (it.images && it.images.length > 0) {
          text += `     - Minh chứng ảnh: ${it.images.length} ảnh (${it.images.map(img => img.url).join(', ')})\n`;
        }
      });
      text += `\n`;
    }

    // Section 3: Công Việc Khác
    text += `III. CÁC CÔNG TÁC KHÁC (${otherItems.length} nhiệm vụ)\n`;
    if (otherItems.length === 0) {
      text += `  (Không có phát sinh hoạt động trong kỳ)\n\n`;
    } else {
      otherItems.forEach((it, idx) => {
        text += `  ${idx + 1}. [${formatVNDate(it.date)}] ${it.title}${it.isHighlighted ? ' [⭐ TIÊU BIỂU]' : ''}\n`;
        if (it.location) text += `     - Địa điểm: ${it.location}\n`;
        if (it.description) text += `     - Nội dung / Kết quả: ${it.description}\n`;
      });
      text += `\n`;
    }

    // Section 4: Đề nghị khen thưởng
    text += `IV. DANH MỤC CÔNG VIỆC TIÊU BIỂU ĐỀ NGHỊ KHEN THƯỞNG (${highlightedItems.length} việc)\n`;
    if (highlightedItems.length === 0) {
      text += `  (Chưa có đề xuất việc tiêu biểu)\n\n`;
    } else {
      highlightedItems.forEach((it, idx) => {
        text += `  ${idx + 1}. ⭐ ${it.title} (${CATEGORIES[it.category].shortLabel} - Ngày ${formatVNDate(it.date)})\n`;
        text += `     Thành tích / Hiệu quả: ${it.description || 'Đạt yêu cầu xuất sắc'}\n`;
      });
      text += `\n`;
    }

    text += `═══════════════════════════════════════════\n`;
    text += `Tổng hợp tự động từ Sổ Công Tác Cá Nhân • ${new Date().toLocaleDateString('vi-VN')}`;
    return text;
  };

  // Copy to clipboard
  const handleCopyText = async () => {
    const text = generateReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Đã sao chép toàn bộ văn bản báo cáo vào Clipboard! Sẵn sàng dán vào Word/Zalo.', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast('Không thể sao chép tự động', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Mảng Công Tác', 'Tên Công Việc', 'Ngày', 'Giờ', 'Địa Điểm', 'Nội Dung / Kết Quả', 'Tiêu Biểu Khen Thưởng', 'Số Lượng Ảnh Minh Chứng', 'Link Ảnh'];
    const rows = completedItems.map((it, idx) => [
      idx + 1,
      CATEGORIES[it.category].label,
      `"${it.title.replace(/"/g, '""')}"`,
      it.date,
      it.time || '',
      `"${(it.location || '').replace(/"/g, '""')}"`,
      `"${(it.description || '').replace(/"/g, '""')}"`,
      it.isHighlighted ? 'CÓ (TIÊU BIỂU)' : 'KHÔNG',
      it.images?.length || 0,
      `"${(it.images || []).map((img) => img.url).join(' ; ')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Cong_Tac_${filter.cycle}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất tệp bảng tính CSV thành công!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Tổng Hợp Báo Cáo & Xét Khen Thưởng</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tự động xuất văn bản hành chính theo Ngày, Tuần, Tháng, Quý, Năm
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyText}
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép văn bản'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
            title="Xuất bảng Excel CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất CSV/Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
            title="In hoặc lưu PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">In / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100">
          <span className="text-[11px] font-bold uppercase">Đoàn Thanh Niên</span>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{dtnItems.length} việc</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-900 text-red-900 dark:text-red-100">
          <span className="text-[11px] font-bold uppercase">ANTT Cơ Sở</span>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">{anttItems.length} việc</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-100">
          <span className="text-[11px] font-bold uppercase">Công Việc Khác</span>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{otherItems.length} việc</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100">
          <span className="text-[11px] font-bold uppercase">Đề Nghị Khen Thưởng</span>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">⭐ {highlightedItems.length} việc</p>
        </div>
      </div>

      {/* Administrative Document Preview (Paper Layout) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 text-slate-800 dark:text-slate-100 font-serif leading-relaxed max-w-4xl mx-auto space-y-6">
        {/* Document Header */}
        <div className="text-center space-y-1">
          <p className="font-bold text-xs sm:text-sm uppercase tracking-wide">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="text-xs sm:text-sm font-bold underline underline-offset-4">
            Độc lập - Tự do - Hạnh phúc
          </p>
          <div className="pt-4">
            <h1 className="text-base sm:text-xl font-extrabold uppercase font-sans text-slate-900 dark:text-white">
              BÁO CÁO KẾT QUẢ CÔNG TÁC CÁ NHÂN
            </h1>
            <p className="text-xs sm:text-sm font-sans text-blue-600 font-semibold mt-1">
              Kỳ báo cáo: {periodLabel}
            </p>
          </div>
        </div>

        {/* Officer Information */}
        <div className="font-sans text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800">
          <p>
            <strong>Họ và tên cán bộ:</strong> {settings.userName || 'Cán bộ phụ trách'}
          </p>
          <p>
            <strong>Chức vụ / Nhiệm vụ:</strong> {settings.userRole || 'Bí thư Đoàn / Phụ trách ANTT Cơ sở'}
          </p>
          <p>
            <strong>Đơn vị công tác:</strong> {settings.unitName || 'UBND Xã/Phường'}
          </p>
        </div>

        {/* Content Section I: Đoàn Thanh Niên */}
        <div className="font-sans space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 uppercase border-b-2 border-blue-500 pb-1 flex items-center justify-between">
            <span>I. CÔNG TÁC ĐOÀN THANH NIÊN</span>
            <span className="text-xs font-normal text-slate-500">({dtnItems.length} nhiệm vụ)</span>
          </h2>
          {dtnItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Không có nhiệm vụ phát sinh trong kỳ.</p>
          ) : (
            <div className="space-y-3">
              {dtnItems.map((it, idx) => (
                <div key={it.id} className="text-xs sm:text-sm space-y-1 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {it.title}
                    </span>
                    {it.isHighlighted && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        ⭐ Tiêu biểu
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Thời gian: {formatVNDate(it.date)} {it.time ? `(${it.time})` : ''} • Địa điểm: {it.location || 'Tại cơ sở'}
                  </p>
                  {it.description && (
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      - Kết quả: {it.description}
                    </p>
                  )}
                  {it.images && it.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[11px] text-slate-400">Minh chứng:</span>
                      {it.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => openLightbox({ url: img.url, caption: img.caption, title: it.title })}
                          className="text-[11px] text-blue-600 underline hover:text-blue-800"
                        >
                          [Ảnh {i + 1}]
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Section II: ANTT Cơ Sở */}
        <div className="font-sans space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-red-700 dark:text-red-400 uppercase border-b-2 border-red-500 pb-1 flex items-center justify-between">
            <span>II. CÔNG TÁC AN NINH TRẬT TỰ CƠ SỞ</span>
            <span className="text-xs font-normal text-slate-500">({anttItems.length} nhiệm vụ)</span>
          </h2>
          {anttItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Không có nhiệm vụ phát sinh trong kỳ.</p>
          ) : (
            <div className="space-y-3">
              {anttItems.map((it, idx) => (
                <div key={it.id} className="text-xs sm:text-sm space-y-1 pl-2 border-l-2 border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {it.title}
                    </span>
                    {it.isHighlighted && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        ⭐ Tiêu biểu
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Thời gian: {formatVNDate(it.date)} {it.time ? `(${it.time})` : ''} • Địa điểm: {it.location || 'Tại cơ sở'}
                  </p>
                  {it.description && (
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      - Kết quả: {it.description}
                    </p>
                  )}
                  {it.images && it.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[11px] text-slate-400">Minh chứng:</span>
                      {it.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => openLightbox({ url: img.url, caption: img.caption, title: it.title })}
                          className="text-[11px] text-red-600 underline hover:text-red-800"
                        >
                          [Ảnh {i + 1}]
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Section III: Công Việc Khác */}
        <div className="font-sans space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-400 uppercase border-b-2 border-purple-500 pb-1 flex items-center justify-between">
            <span>III. CÁC CÔNG TÁC KHÁC</span>
            <span className="text-xs font-normal text-slate-500">({otherItems.length} nhiệm vụ)</span>
          </h2>
          {otherItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Không có công việc phát sinh trong kỳ.</p>
          ) : (
            <div className="space-y-3">
              {otherItems.map((it, idx) => (
                <div key={it.id} className="text-xs sm:text-sm space-y-1 pl-2 border-l-2 border-purple-200 dark:border-purple-800">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {idx + 1}. {it.title}
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Thời gian: {formatVNDate(it.date)} • Địa điểm: {it.location || 'Cơ quan'}
                  </p>
                  {it.description && (
                    <p className="text-slate-700 dark:text-slate-300">
                      - Nội dung: {it.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Section IV: Khen Thưởng */}
        <div className="font-sans space-y-3 bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900">
          <h2 className="text-sm sm:text-base font-bold text-amber-800 dark:text-amber-300 uppercase flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>IV. CÔNG VIỆC TIÊU BIỂU ĐỀ NGHỊ KHEN THƯỞNG ({highlightedItems.length})</span>
          </h2>
          {highlightedItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Chưa đánh dấu công việc tiêu biểu nào trong kỳ này.</p>
          ) : (
            <div className="space-y-2.5">
              {highlightedItems.map((it, idx) => (
                <div key={it.id} className="text-xs sm:text-sm">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {idx + 1}. ⭐ {it.title} ({CATEGORIES[it.category].shortLabel})
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                    Thành tích: {it.description || 'Hoàn thành xuất sắc nhiệm vụ được giao.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Signatures */}
        <div className="pt-8 flex justify-between text-center font-sans text-xs sm:text-sm">
          <div className="space-y-12">
            <p className="font-bold">XÁC NHẬN CỦA ĐƠN VỊ</p>
            <p className="text-slate-400">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="space-y-12">
            <div>
              <p className="italic text-slate-500">..., ngày ... tháng ... năm 2026</p>
              <p className="font-bold uppercase mt-1">NGƯỜI LẬP BÁO CÁO</p>
            </div>
            <p className="font-bold text-slate-900 dark:text-white">
              {settings.userName || 'Cán bộ phụ trách'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
