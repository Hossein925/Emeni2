import React from 'react';
import { ArrowRight, Bell, CheckCircle2, FileText, ChevronLeft, ShieldAlert } from 'lucide-react';

interface PublicSafetyAnnouncementsViewProps {
  onBack: () => void;
  onSelectOption: (option: 'resolutions' | 'scenarios') => void;
}

export const PublicSafetyAnnouncementsView: React.FC<PublicSafetyAnnouncementsViewProps> = ({
  onBack,
  onSelectOption,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right" dir="rtl">
      {/* Top Banner Header */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border-2 border-indigo-400/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bell className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                اعلان‌های ایمنی بیمار
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-1">
                دسترسی به آخرین مصوبات جلسات کمیته و سناریوهای تحلیل خطاها
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="relative z-10 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer flex items-center gap-2 ring-2 ring-amber-300/40 self-end sm:self-auto"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
          <span>بازگشت به منوی اصلی</span>
        </button>
      </div>

      {/* Grid of 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
        {/* Option 1: مصوبات ایمنی */}
        <div
          onClick={() => onSelectOption('resolutions')}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-2xl border-2 border-indigo-400/30 hover:border-emerald-400/80 flex flex-col justify-between min-h-[220px] hover:-translate-y-1.5 hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer text-right backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl group-hover:bg-emerald-500/25 transition duration-500" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/35 transition duration-500" />

          <div className="flex items-center justify-between z-10 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-400/30 shadow-lg transition-all duration-300">
              <CheckCircle2 className="w-7 h-7 text-emerald-300 group-hover:rotate-6 transition" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-black text-xs shadow-sm backdrop-blur-sm">
              کمیته ایمنی بیمار
            </span>
          </div>

          <div className="z-10 my-4 relative">
            <h3 className="text-xl font-black text-white leading-snug group-hover:text-emerald-300 transition-colors mb-2">
              مصوبات ایمنی
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              مشاهده مصوبات تصویب‌شده، تصمیمات کمیته و اقدامات اصلاحی تعیین‌شده در سطح بیمارستان
            </p>
          </div>

          <div className="z-10 pt-3 border-t border-slate-800/90 flex items-center justify-between text-emerald-300 text-xs sm:text-sm font-black group-hover:text-amber-300 relative">
            <span>مشاهده مصوبات ایمنی</span>
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition" />
          </div>
        </div>

        {/* Option 2: سناریوهای ایمنی */}
        <div
          onClick={() => onSelectOption('scenarios')}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-2xl border-2 border-indigo-400/30 hover:border-amber-400/80 flex flex-col justify-between min-h-[220px] hover:-translate-y-1.5 hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer text-right backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl group-hover:bg-amber-500/25 transition duration-500" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/35 transition duration-500" />

          <div className="flex items-center justify-between z-10 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-400/30 shadow-lg transition-all duration-300">
              <FileText className="w-7 h-7 text-amber-300 group-hover:rotate-6 transition" />
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black text-xs shadow-sm backdrop-blur-sm">
              تحلیل خطاهای بالینی
            </span>
          </div>

          <div className="z-10 my-4 relative">
            <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors mb-2">
              سناریوهای ایمنی
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              بررسی پرونده‌های واقعی، سناریوهای بالینی و راهکارهای پیشگیری از خطاهای پزشکی
            </p>
          </div>

          <div className="z-10 pt-3 border-t border-slate-800/90 flex items-center justify-between text-amber-300 text-xs sm:text-sm font-black group-hover:text-cyan-300 relative">
            <span>مشاهده سناریوهای ایمنی</span>
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition" />
          </div>
        </div>
      </div>
    </div>
  );
};
