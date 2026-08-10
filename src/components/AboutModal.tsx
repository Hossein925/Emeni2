import React from 'react';
import { X, ShieldCheck, Target, FileSpreadsheet, Award, HeartHandshake, Send, Sparkles, User, Calendar } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn text-right" dir="rtl">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-indigo-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-white custom-scrollbar">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer z-10 border border-white/10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4 border-b border-indigo-500/30 pb-4 relative z-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-indigo-600 p-0.5 shadow-xl shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
            </div>
          </div>
          <div className="pl-8 sm:pl-10">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              درباره سامانه ایمنی بیمار
            </h3>
            <p className="text-[11px] sm:text-xs text-cyan-300 font-bold mt-0.5">
              نرم‌افزار جامع مدیریت، پایش و ارتقای استاندارد‌های ایمنی بیمارستان
            </p>
          </div>
        </div>

        {/* Services Overview */}
        <div className="space-y-3 text-xs text-slate-200 font-medium leading-relaxed relative z-10">
          <p className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-justify text-slate-200 leading-relaxed text-xs">
            سامانه <strong className="text-amber-300 font-black">«ایمنی بیمار»</strong> یک راهکار جامع و بومی جهت استقرار استانداردها، ثبت و پیگیری هوشمند خطاهای درمانی، تحلیل علل ریشه‌ای (RCA) و آنالیز حالات خطا (FMEA)، خودارزیابی سرپرستاران، مدیریت جلسات کمیته و سنجش دانش بالینی پرسنل در سطح بیمارستان می‌باشد.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 bg-indigo-900/40 rounded-2xl border border-indigo-400/30 flex items-start gap-2.5">
              <Target className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-white text-xs">شاخص‌های ایمنی بالینی</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">پایش ماهانه سقوط، زخم بستر، عوارض دارویی و تزریق خون به تفکیک بخش‌ها</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-900/40 rounded-2xl border border-emerald-400/30 flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-white text-xs">گزارش‌دهی عدم تنبیهی خطا</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">ثبت ناشناس گزارش خطاها، تعیین اقدامات اصلاحی و صدور مصوبات</p>
              </div>
            </div>

            <div className="p-3 bg-purple-900/40 rounded-2xl border border-purple-400/30 flex items-start gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-white text-xs">مدیریت تحلیل RCA و FMEA</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">ثبت جلسات کمیته ایمنی، بازدیدهای میدانی و خروجی استانداردهای Word و Excel</p>
              </div>
            </div>

            <div className="p-3 bg-amber-900/40 rounded-2xl border border-amber-400/30 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-white text-xs">آزمون و کارنامه علمی پرسنل</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">برگزاری خودکار آزمون‌های ایمنی و صدور کارنامه ارزیابی کادر درمان</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info: Authorship, Date, Telegram */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold relative z-10">
          <div className="space-y-1 text-center sm:text-right">
            <div className="flex items-center gap-2 text-amber-300 text-xs">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>تهیه و تنظیم: <strong className="text-white text-xs font-black">حسین نصاری</strong></span>
            </div>
            <div className="flex items-center gap-2 text-cyan-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>آخرین بروزرسانی: <strong className="text-white text-xs">مرداد ۱۴۰۵</strong></span>
            </div>
          </div>

          <a
            href="https://t.me/ho3in925"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-sky-500/25 transition cursor-pointer active:scale-95 border border-sky-300/40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ارتباط در تلگرام (ho3in925@)</span>
          </a>
        </div>

        <div className="mt-4 text-center relative z-10">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md active:scale-95"
          >
            بستن راهنما
          </button>
        </div>
      </div>
    </div>
  );
};

