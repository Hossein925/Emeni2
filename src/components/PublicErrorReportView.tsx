import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, Send, CheckCircle2, ShieldCheck, Smile, Frown, Meh, CheckSquare, Calendar } from 'lucide-react';
import { Department, Checklist, ChecklistField } from '../types';
import { DataAccessLayer } from '../services/dal';

interface PublicErrorReportViewProps {
  onBack: () => void;
}

export const PublicErrorReportView: React.FC<PublicErrorReportViewProps> = ({ onBack }) => {
  const [reporterName, setReporterName] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [errorChecklist, setErrorChecklist] = useState<Checklist | null>(null);
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    const depts = await DataAccessLayer.getDepartments();
    setDepartments(depts);
    if (depts.length > 0) {
      setSelectedDeptId(depts[0].id);
    }

    // Get active Error Report Checklist defined by admin
    const chklists = await DataAccessLayer.getChecklists('error_report');
    if (chklists.length > 0) {
      setErrorChecklist(chklists[0]);
    }
  };

  const handleAnswerChange = (fieldId: string, val: any) => {
    setFormAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedDeptId) {
      setErrorMsg('لطفاً بخش مربوطه را انتخاب کنید.');
      return;
    }

    // Validate required fields if errorChecklist exists
    if (errorChecklist && errorChecklist.fields) {
      for (const field of errorChecklist.fields) {
        if (field.required) {
          const ans = formAnswers[field.id];
          if (ans === undefined || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
            setErrorMsg(`پاسخ به سوال «${field.label}» اجباری است.`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const selectedDept = departments.find((d) => d.id === selectedDeptId);
      await DataAccessLayer.saveErrorReport({
        reporterName: reporterName.trim() || 'ناشناس (محرمانه)',
        departmentId: selectedDeptId,
        departmentName: selectedDept?.name || 'نامشخص',
        reportDate: new Date().toLocaleDateString('fa-IR'),
        answers: formAnswers,
      });

      setSubmittedSuccess(true);
    } catch (err) {
      setErrorMsg('خطایی در ثبت گزارش خطا رخ داد.');
    } finally {
      setSubmitting(false);
    }
  };

  // Group fields by section if errorChecklist exists
  const groupedSections = errorChecklist?.fields
    ? errorChecklist.fields.reduce<Record<string, { field: ChecklistField; originalIndex: number }[]>>(
        (acc, field, idx) => {
          const sec = field.section || 'اطلاعات عمومی گزارش خطا';
          if (!acc[sec]) acc[sec] = [];
          acc[sec].push({ field, originalIndex: idx });
          return acc;
        },
        {}
      )
    : {};

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
            {errorChecklist?.title || 'ثبت گزارش خطای پزشکی و ایمنی'}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-medium mt-1">
            {errorChecklist?.description || 'ارسال محرمانه و بدون تنبیه خطاهای درمانی، دارویی و تجهیزاتی جهت ارتقاء ایمنی بیمارستان'}
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

      {submittedSuccess ? (
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl text-slate-900">
          <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">گزارش شما با موفقیت ثبت گردید</h3>
          <p className="text-sm text-slate-700 font-bold max-w-md mx-auto leading-relaxed">
            از همکاری و مسئولیت‌پذیری شما در راستای ارتقای ایمنی بیماران صمیمانه سپاسگزاریم. گزارش شما جهت تحلیل علل ریشه‌ای (RCA) به دفتر ایمنی بیمار ارسال شد.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setFormAnswers({});
                setReporterName('');
              }}
              className="px-6 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-xs sm:text-sm transition border-2 border-indigo-200 cursor-pointer"
            >
              ثبت گزارش جدید
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-md"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-900">
          {/* Non-punitive Assurance Notice */}
          {errorChecklist?.showNonPunitiveNotice !== false && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-950 leading-relaxed font-semibold">
                <strong className="block text-sm font-black text-rose-900 mb-0.5">اصول ایمنی: سیستم ثبت گزارش غیرتنبیهی (Non-Punitive)</strong>
                {errorChecklist?.nonPunitiveNoticeText || 'هدف از این گزارش، ریشه‌یابی سیستماتیک خطاها و جلوگیری از تکرار مجدد آن است. اختیاری بودن درج نام گزارش‌دهنده کاملاً محرمانه باقی می‌ماند.'}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-100 border-2 border-rose-300 text-rose-950 text-xs font-black">
              {errorMsg}
            </div>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                نام و نام خانوادگی گزارش‌دهنده (اختیاری)
              </label>
              <input
                type="text"
                placeholder="در صورت تمایل وارد کنید یا خالی بگذارید..."
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                بخش محل وقوع حادثه <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="text-slate-900 font-bold">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Questions from Error Report Checklist */}
          {errorChecklist && errorChecklist.fields.length > 0 ? (
            <div className="space-y-6 pt-4 border-t-2 border-slate-200">
              {(Object.entries(groupedSections) as [string, { field: ChecklistField; originalIndex: number }[]][]).map(([secName, items]) => (
                <div key={secName} className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-black text-indigo-950 bg-sky-50 px-3.5 py-2 rounded-xl border border-sky-200 inline-block">
                    {secName}
                  </h3>

                  <div className="space-y-4">
                    {items.map(({ field, originalIndex: idx }) => (
                      <div key={field.id} className="p-5 bg-sky-50/80 rounded-2xl border-2 border-sky-200 space-y-3">
                        <label className="block text-xs sm:text-sm font-black text-slate-900">
                          {idx + 1}. {field.label} {field.required && <span className="text-rose-600">*</span>}
                        </label>

                        {field.helpText && (
                          <p className="text-[11px] text-slate-600 font-bold">{field.helpText}</p>
                        )}

                        {/* Field Types */}
                        {field.type === 'mc' && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(field.options || ['دارویی', 'سقوط', 'شناسایی بیمار']).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleAnswerChange(field.id, opt)}
                                className={`p-2.5 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                                  formAnswers[field.id] === opt
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-102'
                                    : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}

                        {field.type === 'checkbox_group' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(field.options || []).map((opt) => {
                              const selectedOpts: string[] = Array.isArray(formAnswers[field.id]) ? (formAnswers[field.id] as string[]) : [];
                              const isSelected = selectedOpts.includes(opt);
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    const updated = isSelected
                                      ? selectedOpts.filter((o) => o !== opt)
                                      : [...selectedOpts, opt];
                                    handleAnswerChange(field.id, updated);
                                  }}
                                  className={`p-2.5 rounded-xl border-2 text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                      : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  <CheckSquare className="w-4 h-4" />
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {field.type === 'select' && (
                          <select
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-extrabold text-xs"
                          >
                            <option value="">انتخاب کنید...</option>
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === 'yesno' && (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleAnswerChange(field.id, 'بله')}
                              className={`px-6 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                                formAnswers[field.id] === 'بله'
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-102'
                                  : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              بله
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAnswerChange(field.id, 'خیر')}
                              className={`px-6 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                                formAnswers[field.id] === 'خیر'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                                  : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              خیر
                            </button>
                          </div>
                        )}

                        {field.type === 'rating' && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleAnswerChange(field.id, lvl)}
                                className={`px-3.5 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                                  formAnswers[field.id] === lvl
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                                    : 'bg-white text-slate-900 border-slate-300'
                                }`}
                              >
                                <span>درجه {lvl}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {field.type === 'text' && (
                          <input
                            type="text"
                            placeholder={field.placeholder || 'پاسخ کوتاه را وارد کنید...'}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                          />
                        )}

                        {field.type === 'textarea' && (
                          <textarea
                            rows={3}
                            placeholder={field.placeholder || 'توضیحات کامل را وارد کنید...'}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                          />
                        )}

                        {field.type === 'date' && (
                          <input
                            type="text"
                            placeholder={field.placeholder || 'مثلاً ۱۴۰۳/۰۵/۱۵'}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback Textarea if no dynamic checklist is created yet */
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-black text-slate-900">
                شرح حادثه یا خطای مشاهدات <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="توضیحات کامل درباره تاریخ، نحوه‌ وقوع و اقدامات انجام‌شده..."
                value={formAnswers['description'] || ''}
                onChange={(e) => handleAnswerChange('description', e.target.value)}
                className="w-full p-3.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-bold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          <div className="pt-4 text-left">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm shadow-lg shadow-rose-600/25 active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'در حال ارسال...' : 'ثبت نهایی گزارش خطا'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
