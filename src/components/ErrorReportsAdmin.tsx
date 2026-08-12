import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, Building2, Calendar, Eye, CheckCircle, Clock, X, Sparkles, Edit3, ListFilter } from 'lucide-react';
import { ErrorReport, Department } from '../types';
import { DataAccessLayer, subscribeToDALChanges } from '../services/dal';
import { MedicalAiAnalyzerModal } from './MedicalAiAnalyzerModal';
import { ErrorReportFormBuilder } from './ErrorReportFormBuilder';

interface ErrorReportsAdminProps {
  onBack: () => void;
}

export const ErrorReportsAdmin: React.FC<ErrorReportsAdminProps> = ({ onBack }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'reports_list' | 'form_builder'>('reports_list');
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState<any>(null);
  const [aiModalTitle, setAiModalTitle] = useState('');

  useEffect(() => {
    loadReports();
    const unsubscribe = subscribeToDALChanges(() => {
      loadReports(true);
    });
    return () => unsubscribe();
  }, []);

  const loadReports = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const depts = await DataAccessLayer.getDepartments();
    const data = await DataAccessLayer.getErrorReports();
    setDepartments(depts);
    setReports(data);
    setLoading(false);
  };

  const filteredReports = reports.filter((r) => {
    if (selectedDeptId !== 'all' && r.departmentId !== selectedDeptId) return false;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-indigo-200/60" dir="rtl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-slate-950" />
            <span>بازگشت</span>
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
              مدیریت، پایش و طراحی فرم گزارش خطا
            </h2>
            <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
              مشاهده گزارش‌های دریافتی، تحلیل RCA و ویرایش آنلاین سوالات فرم گزارش خطای بیمارستان
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-3 mb-8 bg-white p-2 rounded-2xl border-2 border-indigo-200 shadow-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveAdminTab('reports_list')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'reports_list'
              ? 'bg-gradient-to-r from-indigo-900 to-slate-900 text-amber-300 shadow-md ring-2 ring-indigo-400/50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ListFilter className="w-4 h-4 text-amber-400" />
          <span>گزارش‌های خطای ثبت‌شده پرسنل ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('form_builder')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'form_builder'
              ? 'bg-gradient-to-r from-indigo-900 to-slate-900 text-amber-300 shadow-md ring-2 ring-indigo-400/50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-4 h-4 text-amber-400" />
          <span>ویرایش و طراحی سوالات فرم گزارش خطا</span>
        </button>
      </div>

      {activeAdminTab === 'form_builder' ? (
        <ErrorReportFormBuilder onSaved={loadReports} />
      ) : (
        <>

      {/* Filter Bar */}
      <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 mb-8 shadow-xl flex items-center justify-between text-slate-900">
        <div className="flex items-center gap-3 text-xs">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-slate-900 font-black">فیلتر بخش:</span>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-white border-2 border-slate-300 text-slate-900 font-black rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">همه بخش‌ها</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-900 font-black">تعداد کل گزارش‌ها: {filteredReports.length}</span>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-20 text-center text-slate-900 font-black text-sm">در حال دریافت گزارش‌ها...</div>
      ) : filteredReports.length === 0 ? (
        <div className="py-20 text-center text-slate-800 font-black text-sm bg-white rounded-3xl border-2 border-indigo-200 shadow-md">
          هیچ گزارش خطایی ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((r) => (
            <div
              key={r.id}
              className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition text-slate-900"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                    گزارش خطا
                  </span>
                  <span className="text-sm font-black text-slate-900">بخش {r.departmentName}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-800 font-extrabold">
                  <span>گزارش‌دهنده: <strong className="text-slate-950 font-black">{r.reporterName}</strong></span>
                  <span>تاریخ ثبت: <strong className="text-slate-950 font-black">{r.reportDate}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setAiModalData(r);
                    setAiModalTitle(`تحلیل گزارش خطا: بخش ${r.departmentName} - مورخ ${r.reportDate}`);
                    setAiModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md border border-purple-300/40"
                  title="تحلیل خطای بالینی با منابع پزشکی هاریسون، پوترپری، برونرسودارث و اعتباربخشی"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>تحلیل با AI</span>
                </button>
                <button
                  onClick={() => setSelectedReport(r)}
                  className="px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-700 border-2 border-indigo-200 text-xs font-black hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>مشاهده جزئیات</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-none animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border-2 border-indigo-300 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b-2 border-slate-200 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              جزئیات گزارش خطای واصله
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-slate-900 font-extrabold">
              <div>بخش: <strong className="text-slate-950 font-black">{selectedReport.departmentName}</strong></div>
              <div>گزارش‌دهنده: <strong className="text-slate-950 font-black">{selectedReport.reporterName}</strong></div>
              <div>تاریخ ثبت: <strong className="text-slate-950 font-black">{selectedReport.reportDate}</strong></div>
              <div>وضعیت: <span className="text-amber-900 font-black">در حال بررسی RCA</span></div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900">پاسخ‌های ثبت‌شده در فرم:</h4>
              <div className="space-y-2">
                {Object.entries(selectedReport.answers || {}).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-xs space-y-1">
                    <span className="text-indigo-900 block font-black">{key}:</span>
                    <span className="text-slate-900 block font-extrabold">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution & Corrective Action Section */}
            <div className="p-4 bg-indigo-50/80 rounded-2xl border-2 border-indigo-200 space-y-4">
              <h4 className="text-xs font-black text-indigo-950 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                ثبت مصوبه و اقدام اصلاحی ادمین ایمنی
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">متن مصوبه / تصمیم کمیته درباره این خطا:</label>
                <textarea
                  rows={2}
                  value={selectedReport.resolution || ''}
                  onChange={(e) => setSelectedReport({ ...selectedReport, resolution: e.target.value })}
                  placeholder="مثلاً: بازبینی پروتکل تزریق دارو، برگزاری کارگاه تحویل ایمن و..."
                  className="w-full bg-white border-2 border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">اقدام اصلاحی و مسئول پیگیری:</label>
                <input
                  type="text"
                  value={selectedReport.correctiveAction || ''}
                  onChange={(e) => setSelectedReport({ ...selectedReport, correctiveAction: e.target.value })}
                  placeholder="مثلاً: مسئول سوپروایزر آموزشی - مهلت اجرا: ۱۰ روز"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Toggle Public Visibility */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-200">
                <span className="text-xs font-black text-slate-800">
                  نمایش این مصوبه در صفحه عمومی مصوبات ایمنی کادر درمان:
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedReport.isPublic}
                    onChange={(e) => setSelectedReport({ ...selectedReport, isPublic: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <button
                onClick={async () => {
                  if (!selectedReport) return;
                  await DataAccessLayer.saveErrorReport(selectedReport);
                  setReports((prev) => prev.map((r) => (r.id === selectedReport.id ? selectedReport : r)));
                  alert('مصوبه و تنظیمات انتشار با موفقیت ذخیره شد.');
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs transition cursor-pointer shadow-md"
              >
                ذخیره مصوبه و تنظیمات انتشار
              </button>
            </div>

            <div className="pt-4 border-t-2 border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setAiModalData(selectedReport);
                  setAiModalTitle(`تحلیل گزارش خطا: بخش ${selectedReport.departmentName} - مورخ ${selectedReport.reportDate}`);
                  setAiModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-xs transition cursor-pointer shadow-md ring-2 ring-purple-300/40"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>تحلیل تخصصی با هوش مصنوعی</span>
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-800 font-black text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Medical Analysis Modal */}
      <MedicalAiAnalyzerModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        contextType="ErrorReport"
        title={aiModalTitle}
        data={aiModalData}
      />
        </>
      )}
    </div>
  );
};
