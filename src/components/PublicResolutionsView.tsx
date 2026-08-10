import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Clock, UserCheck, Calendar } from 'lucide-react';
import { MeetingResolution } from '../types';
import { DataAccessLayer } from '../services/dal';
import { toPersianDigits } from '../utils/jalali';

interface PublicResolutionsViewProps {
  onBack: () => void;
}

export const PublicResolutionsView: React.FC<PublicResolutionsViewProps> = ({ onBack }) => {
  const [resolutions, setResolutions] = useState<MeetingResolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicResolutions();
  }, []);

  const loadPublicResolutions = async () => {
    setLoading(true);
    const data = await DataAccessLayer.getPublicResolutions();
    setResolutions(data);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            مصوبات جلسات ایمنی بیمار
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-medium mt-1">
            مصوبات تصویب‌شده و قابل انتشار جلسات کمیته ایمنی بیمارستان جهت اطلاع کادر درمان
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
          <span>بازگشت به منوی اصلی</span>
        </button>
      </div>

      {/* Resolutions List */}
      {loading ? (
        <div className="py-20 text-center text-indigo-950 font-bold text-sm">در حال دریافت مصوبات...</div>
      ) : resolutions.length === 0 ? (
        <div className="py-20 text-center text-indigo-950 font-bold text-sm bg-white rounded-3xl border border-indigo-100 shadow-md">
          در حال حاضر مصوبه عمومی تصویب‌شده‌ای ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-5">
          {resolutions.map((res) => (
            <div
              key={res.id}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-indigo-100 shadow-lg hover:border-indigo-300 transition space-y-4 text-right"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    مصوبه عمومی
                  </span>
                  <span className="text-xs font-extrabold text-indigo-950">
                    موضوع جلسه: {res.meetingSubject || 'جلسه ایمنی'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-black ${
                      res.priority === 'high'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : res.priority === 'medium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    اولویت: {res.priority === 'high' ? 'بالا' : res.priority === 'medium' ? 'متوسط' : 'پایین'}
                  </span>
                  <span className="bg-slate-100 text-slate-800 font-bold px-3 py-0.5 rounded-full text-xs border border-slate-200">
                    وزن/اهمیت: {toPersianDigits(res.weight)} از ۵
                  </span>
                </div>
              </div>

              {/* Resolution Text */}
              <p className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                {res.text}
              </p>

              {/* Footer details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>مسئول پیگیری: <strong className="text-slate-900 font-bold">{res.responsiblePerson}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>مهلت اجرا: <strong className="text-slate-900 font-bold">{res.deadline}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
