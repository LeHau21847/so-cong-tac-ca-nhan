// src/App.tsx
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { WorkLogView } from './components/work-log/WorkLogView';
import { SchedulerView } from './components/scheduler/SchedulerView';
import { ReportView } from './components/reports/ReportView';
import { GalleryView } from './components/gallery/GalleryView';
import { QuickCaptureModal } from './components/quick-capture/QuickCaptureModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ImageLightbox } from './components/common/ImageLightbox';
import { Toast } from './components/common/Toast';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'work_log' && <WorkLogView />}
        {activeTab === 'scheduler' && <SchedulerView />}
        {activeTab === 'reports' && <ReportView />}
        {activeTab === 'gallery' && <GalleryView />}
      </div>
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
        {/* Top Header */}
        <Navbar />

        {/* Middle Section: Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* Global Modals & Notifications */}
        <QuickCaptureModal />
        <SettingsModal />
        <ImageLightbox />
        <Toast />
      </div>
    </AppProvider>
  );
}

export default App;
