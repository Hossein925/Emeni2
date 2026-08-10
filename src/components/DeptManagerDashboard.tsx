import React, { useState, useEffect } from 'react';
import {
  Activity,
  ClipboardList,
  Save,
  CheckCircle2,
  Calendar,
  Building2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
  CheckSquare,
  AlertTriangle,
  Printer,
  FileSpreadsheet,
  BrainCircuit,
  Info,
  ChevronLeft,
  Grid,
  List,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  User,
  SafetyIndicatorDefinition,
  Checklist,
  ChecklistResponse,
  ErrorReport,
} from '../types';
import { DataAccessLayer } from '../services/dal';
import { getCurrentJalaliYear, getCurrentJalaliMonth, JALALI_MONTHS, toPersianDigits } from '../utils/jalali';
import { MedicalAiAnalyzerModal } from './MedicalAiAnalyzerModal';
import { StaffManagementView } from './StaffManagementView';
import { DeptStaffEvaluationView } from './DeptStaffEvaluationView';
import {
  CLINICAL_DEPARTMENTS,
  ClinicalDeptType,
  ClinicalIndicatorItem,
  CLINICAL_INDICATORS_MATRIX,
  normalizeDepartmentName,
} from '../data/indicators';

export { CLINICAL_DEPARTMENTS, CLINICAL_INDICATORS_MATRIX, normalizeDepartmentName };
export type { ClinicalDeptType, ClinicalIndicatorItem };

interface DeptManagerDashboardProps {
  user?: User;
  currentUser?: User;
  onLogout?: () => void;
  onReturnToAdminPanel?: () => void;
}

export const DeptManagerDashboard: React.FC<DeptManagerDashboardProps> = (props) => {
  const user = props.currentUser || props.user;
  const userName = user?.name || 'مسئول بخش';
  const rawDepartmentName = user?.departmentName || 'بخش مراقبت‌های ویژه (ICU)';
  const departmentId = user?.departmentId || 'dept-1';

  // Tile Selection State
  const [activeTile, setActiveTile] = useState<'tiles' | 'indicators' | 'checklists' | 'staff_eval' | 'staff'>('tiles');

  // Selected Department for Indicators Form (defaults to user's normalized department)
  const [selectedDept, setSelectedDept] = useState<ClinicalDeptType>(() => normalizeDepartmentName(rawDepartmentName));

  // Date Filters
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentJalaliMonth());
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentJalaliYear());

  // Indicator values state
  const [indicatorValues, setIndicatorValues] = useState<Record<string, number>>({});
  const [indicatorNotes, setIndicatorNotes] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'table'>('categories');

  // Checklists State
  const [headNurseChecklists, setHeadNurseChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, any>>({});
  const [checklistSaved, setChecklistSaved] = useState(false);

  // Quick Error Report State
  const [errorDesc, setErrorDesc] = useState('');
  const [errorReporterName, setErrorReporterName] = useState(userName);
  const [errorSubmitted, setErrorSubmitted] = useState(false);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState<any>(null);
  const [aiModalTitle, setAiModalTitle] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedMonth, selectedYear]);

  const loadData = async () => {
    // Load records for selected clinical dept & month
    const records = await DataAccessLayer.getIndicatorRecords();
    const valuesMap: Record<string, number> = {};
    const notesMap: Record<string, string> = {};

    records.forEach((r) => {
      if (r.departmentName === selectedDept && r.month === selectedMonth && r.year === selectedYear) {
        valuesMap[r.indicatorId] = r.value;
        notesMap[r.indicatorId] = r.notes || '';
      }
    });

    setIndicatorValues(valuesMap);
    setIndicatorNotes(notesMap);

    // Load head nurse checklists
    const chks = await DataAccessLayer.getChecklists('head_nurse');
    setHeadNurseChecklists(chks);
    if (chks.length > 0 && !selectedChecklist) {
      setSelectedChecklist(chks[0]);
    }
  };

  const handleSaveIndicators = async () => {
    for (const item of CLINICAL_INDICATORS_MATRIX) {
      const isAllowed = item.allowedDepts.includes(selectedDept);
      if (!isAllowed) continue; // Skip non-applicable fields

      const val = indicatorValues[item.id] ?? 0;
      const note = indicatorNotes[item.id] || '';

      await DataAccessLayer.saveIndicatorRecord({
        departmentId: departmentId,
        departmentName: selectedDept,
        indicatorId: item.id,
        indicatorTitle: item.title,
        value: Number(val),
        year: selectedYear,
        month: selectedMonth,
        monthName: JALALI_MONTHS[selectedMonth - 1],
        notes: note,
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleSaveChecklistResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChecklist) return;

    await DataAccessLayer.saveChecklistResponse({
      checklistId: selectedChecklist.id,
      checklistTitle: selectedChecklist.title,
      departmentId: departmentId,
      departmentName: rawDepartmentName,
      submittedBy: userName,
      answers: checklistAnswers,
    });

    setChecklistSaved(true);
    setTimeout(() => {
      setChecklistSaved(false);
      setChecklistAnswers({});
    }, 3000);
  };

  const handleQuickErrorReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorDesc.trim()) return;

    await DataAccessLayer.saveErrorReport({
      reporterName: errorReporterName || 'ناشناس',
      departmentId: departmentId,
      departmentName: selectedDept,
      reportDate: new Date().toLocaleDateString('fa-IR'),
      answers: {
        'شرح خطا': errorDesc,
        'بخش ثبت‌کننده': selectedDept,
        'ثبت توسط': userName,
      },
    });

    setErrorSubmitted(true);
    setErrorDesc('');
    setTimeout(() => setErrorSubmitted(false), 3500);
  };

  // Calculate statistics for currently selected department
  const totalIndicators = CLINICAL_INDICATORS_MATRIX.length;
  const allowedIndicators = CLINICAL_INDICATORS_MATRIX.filter((item) => item.allowedDepts.includes(selectedDept));
  const completedCount = allowedIndicators.filter((item) => indicatorValues[item.id] !== undefined && indicatorValues[item.id] !== null && indicatorValues[item.id] !== 0).length;
  const completionPercentage = Math.round((completedCount / (allowedIndicators.length || 1)) * 100);

  // Categories list
  const categories = Array.from(new Set(CLINICAL_INDICATORS_MATRIX.map((item) => item.category)));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right" dir="rtl">
      
      {/* Super Admin Impersonation Return Banner */}
      {props.onReturnToAdminPanel && (
        <div className="mb-6 bg-amber-500 text-slate-950 font-black p-4 sm:p-5 rounded-3xl border-2 border-amber-300 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-slate-950 animate-bounce shrink-0" />
            <div>
              <span className="text-sm sm:text-base font-black block">حالت مشاهده ادمین کل (ورود به پنل مسئول بخش)</span>
              <span className="text-xs font-bold opacity-90 block mt-0.5">
                شما به عنوان ادمین کل وارد پنل مسئول بخش «{rawDepartmentName}» شده‌اید.
              </span>
            </div>
          </div>
          <button
            onClick={props.onReturnToAdminPanel}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-amber-400/50 active:scale-95"
          >
            <ArrowRight className="w-4 h-4 text-amber-300" />
            <span>بازگشت به مدیریت مسئولین بخش (پنل ادمین)</span>
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border-2 border-indigo-400/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 mb-1">
            <Building2 className="w-4 h-4 text-amber-300" />
            <span>سامانه پایش ایمنی بیمار • پنل مسئولین و سرپرستاران بخش‌ها</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            خوش آمدید، {userName}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-200 font-bold mt-1.5 flex items-center gap-2">
            <span>بخش سازمانی: <strong className="text-white">{rawDepartmentName}</strong></span>
            <span className="text-slate-500">•</span>
            <span>بخش بالینی انتخابی: <strong className="text-amber-300">{selectedDept}</strong></span>
          </p>
        </div>

        {/* Back to Main Menu Navigation */}
        {activeTile !== 'tiles' && (
          <button
            onClick={() => setActiveTile('tiles')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl active:scale-95 transition cursor-pointer shrink-0 border border-amber-300/40"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به منوی اصلی مسئول بخش</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MAIN MENU CARDS GRID                                              */}
      {/* ========================================================================= */}
      {activeTile === 'tiles' && (
        <div className="space-y-6">
          <div className="text-slate-800 font-black text-lg flex items-center justify-between pb-2 border-b-2 border-slate-200">
            <span className="flex items-center gap-2 text-indigo-950">
              <Grid className="w-5 h-5 text-indigo-600" />
              منوی خدمات و ارزیابی‌های اختصاصی مسئول بخش
            </span>
            <span className="text-xs text-slate-700 font-bold">
              جهت ورود به بخش مورد نظر کلیک نمایید
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* CARD 1: SAFETY INDICATORS FORM */}
            <div
              onClick={() => setActiveTile('indicators')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border-2 border-indigo-400/30 hover:border-cyan-400/80 flex flex-col justify-between min-h-[190px] hover:-translate-y-1.5 hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer text-right backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition duration-500" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/35 transition duration-500" />
              
              <div className="flex items-center justify-between z-10 relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-400/30 shadow-lg transition-all duration-300">
                  <Activity className="w-6 h-6 text-cyan-300 group-hover:rotate-6 transition" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black text-[11px] shadow-sm backdrop-blur-sm">
                  {toPersianDigits(allowedIndicators.length)} شاخص فعال
                </span>
              </div>

              <div className="z-10 my-3 relative">
                <h3 className="text-base font-black text-white leading-snug group-hover:text-cyan-300 transition-colors mb-1">
                  شاخص‌های ایمنی بخش‌های بالینی
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                  ورود آمار ماهانه شاخص‌های ایمنی بیمار ویژه بخش {selectedDept}
                </p>
              </div>

              <div className="z-10 pt-2.5 border-t border-slate-800/90 flex items-center justify-between text-cyan-300 text-xs font-black group-hover:text-amber-300 relative">
                <span>ورود به فرم شاخص‌ها</span>
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition" />
              </div>
            </div>

            {/* CARD 2: HEAD NURSE CHECKLISTS */}
            <div
              onClick={() => setActiveTile('checklists')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border-2 border-indigo-400/30 hover:border-amber-400/80 flex flex-col justify-between min-h-[190px] hover:-translate-y-1.5 hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer text-right backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-amber-500/25 transition duration-500" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/35 transition duration-500" />
              
              <div className="flex items-center justify-between z-10 relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-400/30 shadow-lg transition-all duration-300">
                  <ClipboardList className="w-6 h-6 text-amber-300 group-hover:rotate-6 transition" />
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-black text-[11px] shadow-sm backdrop-blur-sm">
                  خودارزیابی بخش
                </span>
              </div>

              <div className="z-10 my-3 relative">
                <h3 className="text-base font-black text-white leading-snug group-hover:text-amber-300 transition-colors mb-1">
                  چک‌لیست‌های ارزیابی سرپرستاران
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                  پاسخگویی به چک‌لیست‌های کیفی و نظارت‌های بالینی
                </p>
              </div>

              <div className="z-10 pt-2.5 border-t border-slate-800/90 flex items-center justify-between text-amber-300 text-xs font-black group-hover:text-cyan-300 relative">
                <span>تکمیل چک‌لیست‌ها</span>
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition" />
              </div>
            </div>

            {/* CARD 3: DEPARTMENT STAFF EVALUATION */}
            <div
              onClick={() => setActiveTile('staff_eval')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border-2 border-indigo-400/30 hover:border-emerald-400/80 flex flex-col justify-between min-h-[190px] hover:-translate-y-1.5 hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer text-right backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition duration-500" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/35 transition duration-500" />
              
              <div className="flex items-center justify-between z-10 relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-400/30 shadow-lg transition-all duration-300">
                  <CheckSquare className="w-6 h-6 text-emerald-300 group-hover:rotate-6 transition" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-black text-[11px] shadow-sm backdrop-blur-sm">
                  ارزیابی سنجه‌ای
                </span>
              </div>

              <div className="z-10 my-3 relative">
                <h3 className="text-base font-black text-white leading-snug group-hover:text-emerald-300 transition-colors mb-1">
                  ارزیابی پرسنل بخش
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                  ارزیابی عملکرد و سنجه‌های ایمنی بیمار پرسنل با چک‌لیست‌های ادمین کل
                </p>
              </div>

              <div className="z-10 pt-2.5 border-t border-slate-800/90 flex items-center justify-between text-emerald-300 text-xs font-black group-hover:text-amber-300 relative">
                <span>ورود به ارزیابی پرسنل</span>
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition" />
              </div>
            </div>

            {/* CARD 4: DEPARTMENT STAFF MANAGEMENT */}
            <div
              onClick={() => setActiveTile('staff')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border-2 border-indigo-400/30 hover:border-purple-400/80 flex flex-col justify-between min-h-[190px] hover:-translate-y-1.5 hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer text-right backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl group-hover:bg-purple-500/25 transition duration-500" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/35 transition duration-500" />
              
              <div className="flex items-center justify-between z-10 relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:bg-purple-400/30 shadow-lg transition-all duration-300">
                  <Users className="w-6 h-6 text-purple-300 group-hover:rotate-6 transition" />
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/40 font-black text-[11px] shadow-sm backdrop-blur-sm">
                  شناسایی با کد ملی
                </span>
              </div>

              <div className="z-10 my-3 relative">
                <h3 className="text-base font-black text-white leading-snug group-hover:text-purple-300 transition-colors mb-1">
                  پرسنل و کادر بخش
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                  ثبت اسامی، کدملی و مشاهده کارنامه ارزیابی و آزمون‌های پرسنل {selectedDept}
                </p>
              </div>

              <div className="z-10 pt-2.5 border-t border-slate-800/90 flex items-center justify-between text-purple-300 text-xs font-black group-hover:text-amber-300 relative">
                <span>مدیریت پرسنل بخش</span>
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CLINICAL SAFETY INDICATORS FORM                                   */}
      {/* ========================================================================= */}
      {activeTile === 'indicators' && (
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-900">
          
          {/* Form Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b-2 border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-indigo-700 mb-1">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>فرم استاندارد شاخص‌های ایمنی بخش‌های بالینی</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                ورود و ثبت داده‌های شاخص ایمنی بیمار - بخش {selectedDept}
              </h3>
              <p className="text-xs text-slate-700 font-extrabold mt-1">
                نمایش منحصربه‌فرد شاخص‌های فعال و مرتبط با بخش انتخابی
              </p>
            </div>

            {/* Selectors Bar */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Department Selector Dropdown */}
              <div className="flex items-center gap-2 bg-indigo-50/90 p-2 rounded-2xl border-2 border-indigo-200">
                <Building2 className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="text-xs font-black text-slate-900">بخش بالینی:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as ClinicalDeptType)}
                  className="bg-white border-2 border-slate-300 text-slate-900 font-black rounded-xl px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CLINICAL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jalali Month & Year Selector */}
              <div className="flex items-center gap-2 bg-sky-50/90 p-2 rounded-2xl border-2 border-sky-200">
                <Calendar className="w-4 h-4 text-sky-700 shrink-0" />
                <span className="text-xs font-black text-slate-900">ماه:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-white border-2 border-slate-300 text-slate-900 font-black rounded-xl px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {JALALI_MONTHS.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-18 bg-white border-2 border-slate-300 text-slate-900 font-black rounded-xl px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* AI Button */}
              <button
                type="button"
                onClick={() => {
                  setAiModalData({ department: selectedDept, monthName: JALALI_MONTHS[selectedMonth - 1], year: selectedYear, values: indicatorValues });
                  setAiModalTitle(`تحلیل تخصصی شاخص‌های ایمنی بخش ${selectedDept}`);
                  setAiModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-black text-xs shadow-md transition cursor-pointer active:scale-95 border border-purple-300/40"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>تحلیل هوشمند با AI</span>
              </button>
            </div>
          </div>

          {/* Department Rule Notice Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/90 border-2 border-indigo-200 text-indigo-950 text-xs font-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-700 shrink-0" />
              <span>
                هم‌اکنون تعداد <strong>{toPersianDigits(allowedIndicators.length)} شاخص فعال</strong> و مرتبط با بخش <strong>{selectedDept}</strong> نمایش داده شده است. (قسمت‌های غیرفعال حذف شده‌اند)
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('categories')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  viewMode === 'categories' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                نمای کارت‌های دسته‌بندی
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                نمای جدول متمرکز
              </button>
            </div>
          </div>

          {/* Stats Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-100 border-2 border-slate-200 text-center">
              <span className="text-xs text-slate-800 font-black block">بخش بالینی انتخابی</span>
              <span className="text-base font-black text-indigo-900 mt-1 block">{selectedDept}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center">
              <span className="text-xs text-emerald-950 font-black block">شاخص‌های فعال بخش</span>
              <span className="text-xl font-black text-emerald-800 mt-1 block">{toPersianDigits(allowedIndicators.length)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-center">
              <span className="text-xs text-indigo-950 font-black block">شاخص‌های تکمیل‌شده</span>
              <span className="text-xl font-black text-indigo-800 mt-1 block">{toPersianDigits(completedCount)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center">
              <span className="text-xs text-amber-950 font-black block">درصد پیشرفت ثبت</span>
              <span className="text-xl font-black text-amber-800 mt-1 block">{toPersianDigits(completionPercentage)}٪</span>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>مقادیر شاخص‌های ایمنی بیمار برای بخش {selectedDept} در ماه {JALALI_MONTHS[selectedMonth - 1]} با موفقیت ذخیره شد.</span>
            </div>
          )}

          {/* ================= VIEW 2-A: CATEGORIZED GRID VIEW (ONLY ACTIVE INDICATORS) ================= */}
          {viewMode === 'categories' ? (
            <div className="space-y-8">
              {categories.map((catName) => {
                // Filter ONLY active indicators for the selected department
                const activeCatItems = CLINICAL_INDICATORS_MATRIX.filter(
                  (item) => item.category === catName && item.allowedDepts.includes(selectedDept)
                );

                if (activeCatItems.length === 0) return null; // Completely omit empty categories

                return (
                  <div key={catName} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-indigo-100">
                      <span className="w-3 h-3 rounded-full bg-indigo-600" />
                      <h4 className="text-base font-black text-indigo-950">{catName} ({toPersianDigits(activeCatItems.length)} شاخص فعال)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeCatItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-indigo-200 hover:border-indigo-400 shadow-sm transition relative flex flex-col justify-between gap-3 min-w-0"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="text-sm font-black text-slate-900 leading-snug">
                                {item.title}
                              </h5>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 text-[10px] font-black border border-emerald-300 shrink-0">
                                شاخص فعال
                              </span>
                            </div>

                            {item.description && (
                              <p className="text-xs text-slate-700 font-extrabold mb-2">{item.description}</p>
                            )}
                          </div>

                          {/* Inputs Control - Responsive Layout to Prevent Overflow on Mobile */}
                          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-black text-slate-900 shrink-0">مقدار:</span>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                placeholder="0"
                                value={indicatorValues[item.id] ?? ''}
                                onChange={(e) =>
                                  setIndicatorValues((prev) => ({
                                    ...prev,
                                    [item.id]: Number(e.target.value),
                                  }))
                                }
                                className="w-24 px-3 py-1.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <span className="text-xs font-black text-indigo-950 shrink-0">{item.unit}</span>
                            </div>

                            <div className="flex-1 w-full min-w-0">
                              <input
                                type="text"
                                placeholder="ملاحظات / توضیحات (اختیاری)"
                                value={indicatorNotes[item.id] || ''}
                                onChange={(e) =>
                                  setIndicatorNotes((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-1.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= VIEW 2-B: TABLE VIEW (ONLY ACTIVE INDICATORS) ================= */
            <div className="overflow-x-auto w-full border-2 border-slate-300 rounded-2xl">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white font-black border-b-2 border-slate-800">
                    <th className="p-3.5 text-center min-w-[50px]">ردیف</th>
                    <th className="p-3.5 min-w-[220px]">عنوان شاخص ایمنی بالینی</th>
                    <th className="p-3.5 text-center min-w-[120px]">دسته‌بندی</th>
                    <th className="p-3.5 text-center min-w-[140px]">مقدار عدد / تعداد</th>
                    <th className="p-3.5 min-w-[200px]">ملاحظات و توضیحات (اختیاری)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allowedIndicators.map((item, idx) => (
                    <tr key={item.id} className="bg-white hover:bg-sky-50/80 transition">
                      <td className="p-3 text-center font-black">{toPersianDigits(idx + 1)}</td>
                      <td className="p-3 font-black text-slate-900">
                        {item.title}
                        {item.description && (
                          <span className="block text-[11px] text-slate-700 font-extrabold mt-0.5">{item.description}</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-xs font-bold text-slate-800">{item.category}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={indicatorValues[item.id] ?? ''}
                            onChange={(e) =>
                              setIndicatorValues((prev) => ({
                                ...prev,
                                [item.id]: Number(e.target.value),
                              }))
                            }
                            className="w-20 px-2 py-1 bg-white border-2 border-slate-300 rounded-lg text-slate-900 font-black text-center text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-black text-slate-800">{item.unit}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="توضیحات..."
                          value={indicatorNotes[item.id] || ''}
                          onChange={(e) =>
                            setIndicatorNotes((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          className="w-full px-2.5 py-1 bg-white border-2 border-slate-300 rounded-lg text-slate-900 font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Save Action Buttons */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSaveIndicators}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 text-white font-black text-sm shadow-xl transition cursor-pointer active:scale-95 ring-2 ring-indigo-300/40"
            >
              <Save className="w-5 h-5" />
              <span>ثبت و ذخیره‌سازی داده‌های شاخص ایمنی بخش {selectedDept}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs border border-slate-300 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ / خروجی چاپی</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: HEAD NURSE CHECKLISTS                                             */}
      {/* ========================================================================= */}
      {activeTile === 'checklists' && (
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-900">
          <div className="pb-4 border-b-2 border-slate-200">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              تکمیل چک‌لیست سرپرستاری بخش {rawDepartmentName}
            </h3>
            <p className="text-xs text-slate-700 font-extrabold mt-1">
              چک‌لیست‌های اختصاصی تعریف‌شده توسط ادمین کل برای سرپرستاران و مسئولین بخش‌ها
            </p>
          </div>

          {headNurseChecklists.length === 0 ? (
            <div className="py-12 text-center text-slate-700 font-extrabold text-sm bg-slate-50 rounded-2xl border-2 border-slate-200">
              چک‌لیست سرپرستاری فعال توسط ادمین تعریف نشده است.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-2">
                  انتخاب چک‌لیست ارزیابی:
                </label>
                <select
                  value={selectedChecklist?.id || ''}
                  onChange={(e) => {
                    const found = headNurseChecklists.find((c) => c.id === e.target.value);
                    setSelectedChecklist(found || null);
                    setChecklistAnswers({});
                  }}
                  className="w-full sm:w-1/2 px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {headNurseChecklists.map((chk) => (
                    <option key={chk.id} value={chk.id}>
                      {chk.title}
                    </option>
                  ))}
                </select>
              </div>

              {checklistSaved && (
                <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>پاسخ‌های چک‌لیست سرپرستاری با موفقیت ثبت شد.</span>
                </div>
              )}

              {selectedChecklist && (
                <form onSubmit={handleSaveChecklistResponse} className="space-y-4 pt-2">
                  {selectedChecklist.fields.map((f, idx) => (
                    <div key={f.id} className="p-4 sm:p-5 bg-sky-50/80 rounded-2xl border-2 border-sky-200 space-y-3">
                      <label className="block text-sm sm:text-base font-black text-slate-900">
                        {idx + 1}. {f.label}
                      </label>

                      {f.type === 'yesno' && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setChecklistAnswers((prev) => ({ ...prev, [f.id]: 'بله' }))}
                            className={`px-6 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                              checklistAnswers[f.id] === 'بله'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                                : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            بله
                          </button>
                          <button
                            type="button"
                            onClick={() => setChecklistAnswers((prev) => ({ ...prev, [f.id]: 'خیر' }))}
                            className={`px-6 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                              checklistAnswers[f.id] === 'خیر'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105'
                                : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            خیر
                          </button>
                        </div>
                      )}

                      {f.type === 'mc' && (
                        <div className="flex flex-wrap gap-2">
                          {(f.options || []).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setChecklistAnswers((prev) => ({ ...prev, [f.id]: opt }))}
                              className={`px-4 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                                checklistAnswers[f.id] === opt
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                  : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {f.type === 'rating' && (
                        <input
                          type="number"
                          min="1"
                          max="5"
                          placeholder="امتیاز از ۱ تا ۵"
                          value={checklistAnswers[f.id] || ''}
                          onChange={(e) => setChecklistAnswers((prev) => ({ ...prev, [f.id]: Number(e.target.value) }))}
                          className="w-36 px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black text-xs text-center focus:ring-2 focus:ring-indigo-500"
                        />
                      )}

                      {f.type === 'text' && (
                        <textarea
                          rows={2}
                          value={checklistAnswers[f.id] || ''}
                          onChange={(e) => setChecklistAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))}
                          className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}

                  <div className="pt-4 text-left">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 text-white font-black text-sm shadow-xl transition cursor-pointer"
                    >
                      <Save className="w-5 h-5" />
                      <span>ثبت نهایی پاسخ‌های چک‌لیست</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: DEPARTMENT STAFF EVALUATION FORM & HISTORY                       */}
      {/* ========================================================================= */}
      {activeTile === 'staff_eval' && (
        <DeptStaffEvaluationView
          departmentName={selectedDept}
          departmentId={departmentId}
          userName={userName}
          onBack={() => setActiveTile('tiles')}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: DEPARTMENT STAFF MANAGEMENT                                       */}
      {/* ========================================================================= */}
      {activeTile === 'staff' && (
        <StaffManagementView
          departmentName={selectedDept}
          departmentId={departmentId}
          userName={userName}
          onBack={() => setActiveTile('tiles')}
        />
      )}

      {/* Medical AI Analyzer Modal */}
      <MedicalAiAnalyzerModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        contextType="GENERAL"
        title={aiModalTitle}
        data={aiModalData}
      />

    </div>
  );
};

