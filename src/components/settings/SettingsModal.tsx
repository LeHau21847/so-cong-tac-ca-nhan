// src/components/settings/SettingsModal.tsx
import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { testGasConnection, exportToJsonString, importFromJsonString } from '../../services/storage';
import {
  Settings,
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  User,
  Loader2,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    settings,
    updateSettings,
    syncNow,
    syncStatus,
    resetData,
    showToast,
  } = useApp();

  const [gasUrl, setGasUrl] = useState(settings.gasApiUrl || '');
  const [userName, setUserName] = useState(settings.userName || '');
  const [userRole, setUserRole] = useState(settings.userRole || '');
  const [unitName, setUnitName] = useState(settings.unitName || '');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSettingsOpen) return null;

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập URL Google Apps Script Web App trước khi kiểm tra.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testGasConnection(gasUrl.trim());
    setIsTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: 'Kết nối thành công! Google Sheets & Google Drive đã sẵn sàng nhận dữ liệu.',
      });
      // Save valid url
      updateSettings({ gasApiUrl: gasUrl.trim() });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Kết nối thất bại. Hãy kiểm tra lại quyền triển khai "Anyone".',
      });
    }
  };

  const handleSaveAllSettings = () => {
    updateSettings({
      gasApiUrl: gasUrl.trim(),
      userName: userName.trim(),
      userRole: userRole.trim(),
      unitName: unitName.trim(),
    });
    closeSettings();
  };

  const handleExportBackup = () => {
    const json = exportToJsonString();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_So_Cong_Tac_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải tệp sao lưu JSON về máy!', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFromJsonString(content);
      if (res.success) {
        showToast(`Đã khôi phục thành công ${res.count} công việc từ tệp sao lưu!`, 'success');
        window.location.reload();
      } else {
        showToast('Lỗi nhập dữ liệu: ' + res.error, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Cài Đặt & Kết Nối Đám Mây
              </h3>
              <p className="text-xs text-slate-500">
                Google Sheets, Google Drive 5TB & Hồ sơ báo cáo
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* 1. KẾT NỐI GOOGLE APPS SCRIPT WEB APP */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-blue-500" />
                1. Kết Nối Google Apps Script (0đ / 5TB Cloud)
              </h4>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  settings.gasApiUrl
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {settings.gasApiUrl ? 'Đã cài đặt URL' : 'Chế độ Demo / Offline'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                URL Ứng dụng web (Google Apps Script Web App URL)
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Để trống nếu bạn muốn chạy hoàn toàn Offline trên máy (dữ liệu lưu trên bộ nhớ trình duyệt).
              </p>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="py-1.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Kiểm tra kết nối</span>
                  </>
                )}
              </button>

              {settings.gasApiUrl && (
                <button
                  type="button"
                  onClick={syncNow}
                  disabled={syncStatus === 'syncing'}
                  className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-500" />
                  <span>Đồng bộ ngay</span>
                </button>
              )}
            </div>

            {/* Test Result Alert */}
            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* 2. THÔNG TIN CÁN BỘ LẬP BÁO CÁO */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-500" />
              2. Thông Tin Cán Bộ (Tự động điền vào Báo Cáo)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Chức vụ / Nhiệm vụ
                </label>
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  placeholder="VD: Bí thư Đoàn xã / Tổ viên ANTT cơ sở"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Đơn vị công tác
                </label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="VD: UBND Xã Tân Triều, Huyện Thanh Trì, Hà Nội"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 3. SAO LƯU & DỮ LIỆU MẪU */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-500" />
              3. Quản Lý Dữ Liệu & Sao Lưu
            </h4>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Sao lưu JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-purple-500" />
                <span>Khôi phục JSON</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa tất cả công việc và đưa về trạng thái trống ban đầu?')) {
                    resetData();
                    closeSettings();
                  }
                }}
                className="col-span-2 sm:col-span-1 py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Làm mới (Xóa hết)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeSettings}
            className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSaveAllSettings}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};
