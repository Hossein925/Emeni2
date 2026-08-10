import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, Building2, Calendar, Eye, CheckCircle, Clock, X, Sparkles } from 'lucide-react';
import { ErrorReport, Department } from '../types';
import { DataAccessLayer } from '../services/dal';
import { MedicalAiAnalyzerModal } from './MedicalAiAnalyzerModal';

interface ErrorReportsAdminProps {
  onBack: () => void;
}

export const ErrorReportsAdmin: React.FC<ErrorReportsAdminProps> = ({ onBack }) => {
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
  }, []);

  const loadReports = async () => {
    setLoading(true);
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
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
            گزارش‌های خطای ثبت‌شده پرسنل
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
            پایش و تحلیل گزارش‌های واصله از بخش‌ها جهت تحلیل علل ریشه‌ای (RCA) و ارتقای ایمنی
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
          <span>بازگشت به پنل ادمین</span>
        </button>
      </div>

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
    </div>
  );
};
