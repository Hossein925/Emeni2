import React from 'react';
import { BookOpenCheck, Bell, AlertTriangle, GraduationCap } from 'lucide-react';
import { TickerBanner } from './TickerBanner';
import { User } from '../types';

interface HomeMetroGridProps {
  onSelectTile: (tileId: 'education' | 'announcements' | 'resolutions' | 'scenarios' | 'error_report' | 'quizzes') => void;
  currentUser?: User | null;
  onEditTicker?: () => void;
}

export const HomeMetroGrid: React.FC<HomeMetroGridProps> = ({
  onSelectTile,
  currentUser,
  onEditTicker,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Moving Ticker Banner */}
      <TickerBanner currentUser={currentUser} onEditTicker={onEditTicker} />

      {/* Main Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 max-w-5xl mx-auto">
        {/* Item 1: آموزش ایمنی بیمار */}
        <button
          onClick={() => onSelectTile('education')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-4 sm:p-5 lg:p-6 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          {/* Subtle decorative background glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>

          {/* Icon placed at TOP-RIGHT corner */}
          <div className="flex justify-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
              <BookOpenCheck className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-300" />
            </div>
          </div>

          {/* Clean Main Title centered in bottom area */}
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base lg:text-lg font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              آموزش ایمنی بیمار
            </h3>
          </div>
        </button>

        {/* Item 2: آزمون‌های ایمنی بیمار */}
        <button
          onClick={() => onSelectTile('quizzes')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-4 sm:p-5 lg:p-6 text-white shadow-2xl border-2 border-cyan-400/50 hover:border-amber-400/80 flex flex-col justify-between aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right ring-2 ring-cyan-400/20"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all"></div>

          <div className="flex justify-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-2xl bg-white/10 border border-cyan-200/40 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-purple-500/20 shadow-lg transition-all duration-300">
              <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7 text-amber-300" />
            </div>
          </div>

          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base lg:text-lg font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              آزمون‌های ایمنی بیمار
            </h3>
          </div>
        </button>

        {/* Item 3: اعلان‌های ایمنی (Merged Item for Resolutions & Scenarios) */}
        <button
          onClick={() => onSelectTile('announcements')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-4 sm:p-5 lg:p-6 text-white shadow-2xl border-2 border-amber-400/50 hover:border-amber-300 flex flex-col justify-between aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right ring-2 ring-amber-400/20"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all"></div>

          <div className="flex justify-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-2xl bg-white/10 border border-amber-200/40 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 shadow-lg transition-all duration-300">
              <Bell className="w-5 h-5 sm:w-7 sm:h-7 text-amber-300 animate-pulse" />
            </div>
          </div>

          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base lg:text-lg font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              اعلان‌های ایمنی
            </h3>
          </div>
        </button>

        {/* Item 4: ثبت گزارش خطا */}
        <button
          onClick={() => onSelectTile('error_report')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-4 sm:p-5 lg:p-6 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>

          <div className="flex justify-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-rose-300 group-hover:scale-110 group-hover:bg-rose-500/20 shadow-lg transition-all duration-300">
              <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-rose-300" />
            </div>
          </div>

          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base lg:text-lg font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ثبت گزارش خطا
            </h3>
          </div>
        </button>
      </div>
    </div>
  );
};
