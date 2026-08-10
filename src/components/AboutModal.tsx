import React from 'react';
import { X, ShieldCheck, Target, FileSpreadsheet, Award, HeartHandshake } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-200 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-300 text-indigo-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">درباره سامانه ایمنی بیمار</h3>
            <p className="text-xs text-indigo-900 font-bold">نرم‌افزار جامع مدیریت و ارتقای ایمنی بیمارستان</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-800 font-bold leading-relaxed text-right">
          <p>
            سامانه <strong className="text-indigo-950 font-black">«ایمنی بیمار»</strong> با هدف ارتقای فرهنگ ایمنی، کاهش حوادث ناخواسته دارویی و درمانی، ثبت خطاهای پزشکی بدون مچ‌گیری و یکپارچه‌سازی فرآیندهای ارزیابی در بیمارستان طراحی شده است.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-indigo-50/90 rounded-2xl border-2 border-indigo-200 flex items-start gap-2.5">
              <Target className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-indigo-950">کاهش خطاهای درمانی</h4>
                <p className="text-[11px] text-slate-700 font-extrabold mt-0.5">آموزش مستمر و سناریوهای کارگاهی</p>
              </div>
            </div>

            <div className="p-3 bg-sky-50/90 rounded-2xl border-2 border-sky-200 flex items-start gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-sky-950">گزارش‌گیری دقیق</h4>
                <p className="text-[11px] text-slate-700 font-extrabold mt-0.5">خروجی Word و Excel شاخص‌ها</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/90 rounded-2xl border-2 border-emerald-200 flex items-start gap-2.5">
              <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-emerald-950">کارنامه ایمنی پرسنل</h4>
                <p className="text-[11px] text-slate-700 font-extrabold mt-0.5">سنجش دانش و سطح آگاهی کادر درمان</p>
              </div>
            </div>

            <div className="p-3 bg-purple-50/90 rounded-2xl border-2 border-purple-200 flex items-start gap-2.5">
              <HeartHandshake className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-purple-950">فرهنگ عدم تنبیه</h4>
                <p className="text-[11px] text-slate-700 font-extrabold mt-0.5">ثبت گزارش خطای سازنده</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-slate-200 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs transition cursor-pointer shadow-md"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
