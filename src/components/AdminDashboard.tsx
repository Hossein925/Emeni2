import React from 'react';
import {
  Building2,
  Activity,
  UserCheck,
  CalendarCheck,
  ClipboardList,
  AlertTriangle,
  BookOpenCheck,
  ShieldCheck,
  Crown,
  Megaphone,
} from 'lucide-react';
import { User } from '../types';

interface AdminDashboardProps {
  currentUser: User;
  onSelectAdminSection: (
    section:
      | 'dept_managers'
      | 'indicators'
      | 'evaluations'
      | 'meetings'
      | 'checklists'
      | 'error_reports'
      | 'education'
      | 'visits'
      | 'ticker'
  ) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onSelectAdminSection,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Top Welcome Title */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 border-2 border-indigo-200 shadow-xl flex items-center justify-between text-white relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 mb-1">
            <Crown className="w-4 h-4 text-amber-300" />
            <span>پنل ادمین کل سامانه</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            خوش آمدید، {currentUser?.name || 'مدیر کل'}
          </h2>
          <p className="text-xs text-cyan-100 font-bold mt-1">
            دسترسی کامل مدیریت بیمارستان جهت نظارت، ارزیابی، تعریف بخش‌ها، نوار متحرک و تحلیل شاخص‌ها
          </p>
        </div>
      </div>

      {/* Admin Tiles Grid - Strictly 2 per row, Square Aspect Ratio, Icon at Top-Right, Title Only */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mb-12">
        {/* Tile 1: معرفی مسئولین بخش‌ها */}
        <button
          onClick={() => onSelectAdminSection('dept_managers')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۱. معرفی مسئولین بخش‌ها
            </h3>
          </div>
        </button>

        {/* Tile 2: شاخص‌های ایمنی بیمار */}
        <button
          onClick={() => onSelectAdminSection('indicators')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-200 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۲. شاخص‌های ایمنی بیمار
            </h3>
          </div>
        </button>

        {/* Tile 3: ارزیابی پرسنل */}
        <button
          onClick={() => onSelectAdminSection('evaluations')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500/20 shadow-lg transition-all duration-300">
              <UserCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۳. ارزیابی پرسنل
            </h3>
          </div>
        </button>

        {/* Tile 4: جلسات و خودارزیابی */}
        <button
          onClick={() => onSelectAdminSection('meetings')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500/20 shadow-lg transition-all duration-300">
              <CalendarCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۴. جلسات و خودارزیابی
            </h3>
          </div>
        </button>

        {/* Tile 5: چک‌لیست‌ها */}
        <button
          onClick={() => onSelectAdminSection('checklists')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:bg-purple-500/20 shadow-lg transition-all duration-300">
              <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۵. چک‌لیست‌ها
            </h3>
          </div>
        </button>

        {/* Tile 6: گزارش خطا */}
        <button
          onClick={() => onSelectAdminSection('error_reports')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-rose-300 group-hover:scale-110 group-hover:bg-rose-500/20 shadow-lg transition-all duration-300">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۶. گزارش خطا
            </h3>
          </div>
        </button>

        {/* Tile 7: آموزش ایمنی بیمار */}
        <button
          onClick={() => onSelectAdminSection('education')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 shadow-lg transition-all duration-300">
              <BookOpenCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۷. آموزش ایمنی بیمار
            </h3>
          </div>
        </button>

        {/* Tile 8: بازدیدهای ایمنی */}
        <button
          onClick={() => onSelectAdminSection('visits')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-teal-300 group-hover:scale-110 group-hover:bg-teal-500/20 shadow-lg transition-all duration-300">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۸. بازدیدهای ایمنی
            </h3>
          </div>
        </button>

        {/* Tile 9: نوار اطلاع‌رسانی متحرک */}
        <button
          onClick={() => onSelectAdminSection('ticker')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 shadow-lg transition-all duration-300">
              <Megaphone className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۹. نوار اطلاع‌رسانی متحرک
            </h3>
          </div>
        </button>
      </div>
    </div>
  );
};
