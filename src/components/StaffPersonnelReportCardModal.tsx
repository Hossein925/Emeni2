import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Award,
  GraduationCap,
  ClipboardCheck,
  Printer,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Percent,
  Hash,
  Download,
} from 'lucide-react';
import { StaffMember, QuizSubmission, StaffEvaluation } from '../types';
import { DataAccessLayer } from '../services/dal';
import { toPersianDigits } from '../utils/jalali';
import { downloadStaffSafetyReportCardDocx } from '../utils/exportUtils';

interface StaffPersonnelReportCardModalProps {
  staff: StaffMember;
  onClose: () => void;
}

export const StaffPersonnelReportCardModal: React.FC<StaffPersonnelReportCardModalProps> = ({
  staff,
  onClose,
}) => {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [evaluations, setEvaluations] = useState<StaffEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, [staff.nationalId]);

  const loadStaffData = async () => {
    setLoading(true);
    const allSubmissions = await DataAccessLayer.getQuizSubmissions();
    const allEvaluations = await DataAccessLayer.getEvaluations();

    const staffNationalId = staff.nationalId.trim();

    // Filter submissions and evaluations matching this staff member's national ID or full name
    const staffSubs = allSubmissions.filter(
      (sub) => sub.nationalId?.trim() === staffNationalId || sub.staffName?.trim() === staff.fullName.trim()
    );
    const staffEvals = allEvaluations.filter(
      (ev) => ev.nationalId?.trim() === staffNationalId || ev.staffName?.trim() === staff.fullName.trim()
    );

    setSubmissions(staffSubs);
    setEvaluations(staffEvals);
    setLoading(false);
  };

  // Calculations
  const avgQuizScore =
    submissions.length > 0
      ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
      : 0;

  const avgEvalScore =
    evaluations.length > 0
      ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / evaluations.length)
      : 0;

  const passedQuizzesCount = submissions.filter((s) => (s.percentage || 0) >= 60).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = () => {
    downloadStaffSafetyReportCardDocx(
      {
        id: staff.id,
        staffName: staff.fullName,
        nationalId: staff.nationalId,
        departmentId: staff.departmentId,
        departmentName: staff.departmentName,
        checklistId: 'all',
        checklistTitle: 'کارنامه جامع پرسنلی',
        totalScore: avgEvalScore,
        maxScore: 100,
        percentage: avgEvalScore,
        year: 1403,
        month: 1,
        monthName: 'جامع',
        correctiveAction: 'ثبت در کارنامه عملکردی پرسنل',
        createdAt: new Date().toLocaleDateString('fa-IR'),
        evaluatedBy: 'سرپرستار / مسئول بخش',
        answers: {},
      },
      submissions
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn text-right"
      dir="rtl"
    >
      <div className="bg-slate-900 border-2 border-indigo-500/40 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden relative print:bg-white print:text-black print:p-0 print:border-none print:shadow-none print:max-w-none">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-4 border-b border-indigo-500/30 flex items-center justify-between shrink-0 print:bg-white print:border-b-2 print:border-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Award className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white print:text-black">
                  کارنامه پرسنلی و ارزیابی عملکردی
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full print:border-black print:text-black">
                  مستند به کد ملی
                </span>
              </div>
              <p className="text-xs text-cyan-200/90 font-medium mt-0.5 print:text-slate-700">
                گزارش عملکرد، آزمون‌های گذرانده‌شده و چک‌لیست‌های ارزیابی کیفی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportDocx}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 border border-indigo-400/40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>خروجی Word</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ کارنامه</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar print:overflow-visible">
          
          {/* Profile Card Info Box */}
          <div className="bg-slate-800/80 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg print:bg-slate-100 print:border-slate-300 print:text-black">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-cyan-300 font-black text-xl shrink-0 print:bg-slate-200 print:text-black">
                {staff.firstName.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-black text-white print:text-black">
                  {staff.fullName}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-300 print:text-slate-800 font-medium">
                  <span className="flex items-center gap-1 text-amber-300 font-bold print:text-black">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    کد ملی: {toPersianDigits(staff.nationalId)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    بخش: {staff.departmentName}
                  </span>
                  {staff.position && (
                    <span className="bg-slate-700/80 px-2 py-0.5 rounded-md text-slate-200 border border-slate-600 print:bg-slate-300 print:text-black">
                      سمت: {staff.position}
                    </span>
                  )}
                  {staff.personnelCode && (
                    <span className="text-slate-400 print:text-slate-700">
                      کد پرسنلی: {toPersianDigits(staff.personnelCode)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black print:border-black print:text-black">
                وضعیت: فعال در سامانه
              </span>
            </div>
          </div>

          {/* Stats KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-center print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 font-bold block mb-1 print:text-slate-700">میانگین آزمون‌ها</span>
              <span className="text-xl font-black text-cyan-300 print:text-black">% {toPersianDigits(avgQuizScore)}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-center print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 font-bold block mb-1 print:text-slate-700">میانگین ارزیابی سرپرستار</span>
              <span className="text-xl font-black text-amber-300 print:text-black">% {toPersianDigits(avgEvalScore)}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-center print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 font-bold block mb-1 print:text-slate-700">تعداد آزمون‌های گذرانده</span>
              <span className="text-xl font-black text-emerald-300 print:text-black">{toPersianDigits(submissions.length)} آزمون</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-center print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 font-bold block mb-1 print:text-slate-700">ارزیابی‌های کیفی ثبت‌شده</span>
              <span className="text-xl font-black text-indigo-300 print:text-black">{toPersianDigits(evaluations.length)} ارزیابی</span>
            </div>
          </div>

          {/* Section 1: Quiz Submissions History */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 print:bg-white print:border-slate-300">
            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2 border-b border-slate-800 pb-2.5 print:text-black print:border-slate-300">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              سوابق آزمون‌های آنلاین و بازآموزی پرسنل
            </h4>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">در حال بارگذاری سوابق آزمون...</div>
            ) : submissions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800/80 print:bg-slate-50">
                تاکنون آزمونی توسط این پرسنل ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => {
                  const isPassed = (sub.percentage || 0) >= 60;
                  return (
                    <div
                      key={sub.id}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:bg-slate-50 print:border-slate-300 print:text-black"
                    >
                      <div>
                        <span className="text-xs font-black text-slate-100 block print:text-black">
                          {sub.examTitle}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 print:text-slate-700">
                          تاریخ شرکت: {toPersianDigits(sub.submittedAt)} • بخش: {sub.departmentName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-bold text-slate-300 print:text-black">
                          نمره: {toPersianDigits(sub.score)} از {toPersianDigits(sub.maxScore)} (%{toPersianDigits(sub.percentage)})
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-black border ${
                            isPassed
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 print:text-emerald-800'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30 print:text-rose-800'
                          }`}
                        >
                          {isPassed ? 'قبول' : 'نیازمند بازآموزی'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Staff Evaluation Checklists History */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 print:bg-white print:border-slate-300">
            <h4 className="text-sm font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-2.5 print:text-black print:border-slate-300">
              <ClipboardCheck className="w-4 h-4 text-amber-400" />
              سوابق چک‌لیست‌های ارزیابی عملکردی سرپرستار / مسئول ایمنی
            </h4>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">در حال بارگذاری چک‌لیست‌ها...</div>
            ) : evaluations.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800/80 print:bg-slate-50">
                تاکنون چک‌لیست ارزیابی برای این پرسنل ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:bg-slate-50 print:border-slate-300 print:text-black"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-100 block print:text-black">
                        {ev.checklistTitle}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 print:text-slate-700">
                        تاریخ ارزیابی: {toPersianDigits(ev.year)}/{toPersianDigits(ev.month)} ({ev.monthName}) • ارزیاب: {ev.evaluatedBy}
                      </span>
                      {ev.correctiveAction && ev.correctiveAction !== 'عدم نیاز به اقدام اصلاحی' && (
                        <span className="text-[11px] text-amber-300 font-semibold block mt-1 print:text-amber-800">
                          اقدام اصلاحی: {ev.correctiveAction}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-xs font-bold text-slate-300 print:text-black">
                        نمره: {toPersianDigits(ev.totalScore)} از {toPersianDigits(ev.maxScore)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black print:text-black">
                        %{toPersianDigits(ev.percentage)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 print:hidden">
          <span>کد ملی شاخص منحصر‌به‌فرد تفکیک و تشکیل پرونده پرسنلی در تمامی بخش‌هاست.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition border border-slate-700 cursor-pointer"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
