import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Clock, UserCheck, Filter, ShieldAlert, Sparkles, Building2, Layers } from 'lucide-react';
import { DataAccessLayer } from '../services/dal';
import { toPersianDigits } from '../utils/jalali';

interface CombinedResolution {
  id: string;
  sourceType: 'meeting' | 'rca' | 'fmea' | 'visit' | 'error_report';
  sourceTitle: string;
  text: string;
  responsiblePerson: string;
  deadline: string;
  priority?: 'high' | 'medium' | 'low';
  weight?: number;
  dateStr?: string;
  departmentName?: string;
}

interface PublicResolutionsViewProps {
  onBack: () => void;
}

const ITEMS_PER_PAGE = 15;

export const PublicResolutionsView: React.FC<PublicResolutionsViewProps> = ({ onBack }) => {
  const [items, setItems] = useState<CombinedResolution[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPublicResolutions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  const loadAllPublicResolutions = async () => {
    setLoading(true);
    const combined: CombinedResolution[] = [];

    // 1. Committee Meetings Resolutions
    const meetingResolutions = await DataAccessLayer.getPublicResolutions();
    meetingResolutions.forEach((r) => {
      combined.push({
        id: `meeting-${r.id}`,
        sourceType: 'meeting',
        sourceTitle: `کمیته ایمنی بیمار: ${r.meetingSubject || 'جلسه ایمنی'}`,
        text: r.text,
        responsiblePerson: r.responsiblePerson || 'نامشخص',
        deadline: r.deadline || 'نامشخص',
        priority: r.priority,
        weight: r.weight,
      });
    });

    // 2. Safety Visits
    const visits = await DataAccessLayer.getSafetyVisits();
    visits.forEach((v) => {
      if (v.isPublic && v.resolutions) {
        combined.push({
          id: `visit-${v.id}`,
          sourceType: 'visit',
          sourceTitle: `بازدید میدانی ایمنی - بخش ${v.departmentName}`,
          text: v.resolutions,
          responsiblePerson: v.followUpPerson || 'سرپرستار بخش',
          deadline: v.visitDate,
          departmentName: v.departmentName,
          priority: 'high',
          weight: 4,
        });
      }
    });

    // 3. Error Reports
    const errorReports = await DataAccessLayer.getErrorReports();
    errorReports.forEach((e) => {
      if (e.isPublic && e.resolution) {
        combined.push({
          id: `err-${e.id}`,
          sourceType: 'error_report',
          sourceTitle: `گزارش خطای بالینی - بخش ${e.departmentName}`,
          text: e.resolution,
          responsiblePerson: e.correctiveAction || 'مسئول پیگیری ایمنی',
          deadline: e.reportDate,
          departmentName: e.departmentName,
          priority: 'high',
          weight: 5,
        });
      }
    });

    // 4. RCA Reports
    const rcaReports = await DataAccessLayer.getRcaReports();
    rcaReports.forEach((r) => {
      if (r.isPublic) {
        const actionsText = r.rootCausesAndActions?.map((item) => item.correctiveAction).filter(Boolean).join(' | ');
        if (actionsText || r.eventDescription) {
          combined.push({
            id: `rca-${r.id}`,
            sourceType: 'rca',
            sourceTitle: `تحلیل علل ریشه‌ای (RCA): ${r.title || r.eventDescription || 'رویداد ناخواسته'}`,
            text: actionsText || r.eventDescription || 'تحلیل RCA ثبت گردید.',
            responsiblePerson: r.teamMembers || 'تیم تحلیل RCA',
            deadline: r.eventDate || r.createdAt,
            priority: 'high',
            weight: 5,
          });
        }
      }
    });

    // 5. FMEA Reports
    const fmeaReports = await DataAccessLayer.getFmeaReports();
    fmeaReports.forEach((f) => {
      if (f.isPublic) {
        const actions = f.items.map((i) => i.recommendedActions).filter(Boolean).join(' | ');
        if (actions) {
          combined.push({
            id: `fmea-${f.id}`,
            sourceType: 'fmea',
            sourceTitle: `آنالیز حالات و آثار خطا (FMEA): ${f.title}`,
            text: actions,
            responsiblePerson: f.teamLeader || 'دبیر FMEA',
            deadline: f.assessmentDate,
            priority: 'medium',
            weight: 4,
          });
        }
      }
    });

    setItems(combined);
    setLoading(false);
  };

  const filteredItems = items.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.sourceType === selectedFilter;
  });

  const getSourceBadge = (type: CombinedResolution['sourceType']) => {
    switch (type) {
      case 'meeting':
        return { label: 'کمیته ایمنی بیمار', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'rca':
        return { label: 'تحلیل علل ریشه‌ای RCA', style: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'fmea':
        return { label: 'آنالیز FMEA', style: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'visit':
        return { label: 'بازدید میدانی', style: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
      case 'error_report':
        return { label: 'گزارش خطا', style: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
  };

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right" dir="rtl">
      {/* Header with Back Button on the Right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-indigo-200/60 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg active:scale-95 transition cursor-pointer shrink-0 border border-amber-300/40"
          >
            <ArrowRight className="w-4 h-4 text-slate-950" />
            <span>بازگشت</span>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-indigo-950 flex items-center gap-2">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              مصوبات و اقدامات اصلاحی ایمنی بیمار
            </h2>
            <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
              مجموعه کامل مصوبات عمومی کمیته، تحلیل‌های RCA، آنالیزهای FMEA، بازدیدها و گزارش‌های خطای بالینی
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-2 rounded-2xl border-2 border-indigo-100 shadow-md">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          همه مصوبات ({items.length})
        </button>
        <button
          onClick={() => setSelectedFilter('meeting')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            selectedFilter === 'meeting'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          کمیته ایمنی ({items.filter((i) => i.sourceType === 'meeting').length})
        </button>
        <button
          onClick={() => setSelectedFilter('rca')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            selectedFilter === 'rca'
              ? 'bg-rose-700 text-white shadow-md'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
          }`}
        >
          تحلیل RCA ({items.filter((i) => i.sourceType === 'rca').length})
        </button>
        <button
          onClick={() => setSelectedFilter('fmea')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            selectedFilter === 'fmea'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
          }`}
        >
          آنالیز FMEA ({items.filter((i) => i.sourceType === 'fmea').length})
        </button>
        <button
          onClick={() => setSelectedFilter('visit')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            selectedFilter === 'visit'
              ? 'bg-cyan-700 text-white shadow-md'
              : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
          }`}
        >
          بازدیدهای میدانی ({items.filter((i) => i.sourceType === 'visit').length})
        </button>
        <button
          onClick={() => setSelectedFilter('error_report')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            selectedFilter === 'error_report'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
          }`}
        >
          گزارش‌های خطا ({items.filter((i) => i.sourceType === 'error_report').length})
        </button>
      </div>

      {/* Resolutions List */}
      {loading ? (
        <div className="py-20 text-center text-indigo-950 font-black text-sm">در حال دریافت مصوبات...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center text-indigo-950 font-black text-sm bg-white rounded-3xl border-2 border-indigo-200 shadow-md">
          در این بخش هیچ مصوبه عمومی ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-5">
          {paginatedItems.map((res) => {
            const badge = getSourceBadge(res.sourceType);
            return (
              <div
                key={res.id}
                className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-indigo-200 shadow-lg hover:border-indigo-400 transition space-y-4 text-right"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${badge.style}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-black text-indigo-950">
                      {res.sourceTitle}
                    </span>
                  </div>

                  {res.weight !== undefined && (
                    <span className="bg-slate-100 text-slate-800 font-extrabold px-3 py-0.5 rounded-full text-xs border border-slate-200">
                      وزن/اهمیت: {toPersianDigits(res.weight)} از ۵
                    </span>
                  )}
                </div>

                {/* Resolution Text */}
                <p className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                  {res.text}
                </p>

                {/* Footer details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-extrabold">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>مسئول پیگیری / اقدام: <strong className="text-slate-950 font-black">{res.responsiblePerson}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>مهلت اجرا / تاریخ ثبت: <strong className="text-slate-950 font-black">{res.deadline}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls (15 items per page) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t-2 border-slate-200 bg-white p-4 rounded-3xl shadow-sm">
              <span className="text-xs font-extrabold text-slate-700">
                نمایش صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)} (مجموع {toPersianDigits(filteredItems.length)} مصوبه - هر صفحه ۱۵ مورد)
              </span>

              <div className="flex items-center gap-2 dir-rtl">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-indigo-200"
                >
                  صفحه قبل
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition cursor-pointer ${
                        currentPage === p
                          ? 'bg-indigo-900 text-white shadow-md scale-105'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {toPersianDigits(p)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-indigo-200"
                >
                  صفحه بعد
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

