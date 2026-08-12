import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  UserCheck,
  PlusCircle,
  BarChart3,
  Building2,
  Download,
  Calendar,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  CheckSquare,
  HelpCircle,
  Shuffle,
  Clock,
  Sparkles,
  Eye,
  FileText,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Department, Checklist, StaffEvaluation, QuizExam, QuizQuestion, QuizSubmission, StaffMember } from '../types';
import { DataAccessLayer } from '../services/dal';
import { JALALI_MONTHS, toPersianDigits, getCurrentJalaliYear, getCurrentJalaliMonth } from '../utils/jalali';
import { downloadStaffSafetyReportCardDocx } from '../utils/exportUtils';
import { ConfirmModal } from './ConfirmModal';
import { StaffPersonnelReportCardModal } from './StaffPersonnelReportCardModal';

interface StaffEvaluationAdminProps {
  onBack: () => void;
}

export const StaffEvaluationAdmin: React.FC<StaffEvaluationAdminProps> = ({ onBack }) => {
  // Main Navigation: null | 'checklist' | 'quiz_menu' | 'quiz_designer' | 'quiz_results' | 'results'
  const [selectedTile, setSelectedTile] = useState<
    'checklist' | 'quiz_menu' | 'quiz_designer' | 'quiz_results' | 'results' | null
  >(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [evalChecklists, setEvalChecklists] = useState<Checklist[]>([]);
  const [evaluations, setEvaluations] = useState<StaffEvaluation[]>([]);
  const [exams, setExams] = useState<QuizExam[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= TILE 1: CHECKLIST EVALUATION FORM STATE =================
  const [staffName, setStaffName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedChecklistId, setSelectedChecklistId] = useState('');
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, any>>({});
  const [score, setScore] = useState<number>(18);
  const [maxScore, setMaxScore] = useState<number>(20);
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentJalaliMonth());
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentJalaliYear());
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [identifiedStaff, setIdentifiedStaff] = useState<StaffMember | null>(null);
  const [reportCardStaff, setReportCardStaff] = useState<StaffMember | null>(null);

  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchResultStaff, setSearchResultStaff] = useState<StaffMember | null>(null);

  const handleSearchStaff = async () => {
    const cleaned = nationalId.trim();
    if (!cleaned) {
      alert('لطفاً کد ملی را وارد نمایید.');
      return;
    }
    setSearchAttempted(true);
    const staff = await DataAccessLayer.getStaffMemberByNationalId(cleaned);
    if (staff) {
      setSearchResultStaff(staff);
    } else {
      setSearchResultStaff(null);
    }
  };

  const handleSelectSearchResult = (staff: StaffMember) => {
    setIdentifiedStaff(staff);
    setStaffName(staff.fullName);
    const dept = departments.find((d) => d.id === staff.departmentId || d.name === staff.departmentName);
    if (dept) setSelectedDeptId(dept.id);
  };

  // ================= TILE 2: EXAM MANAGEMENT STATE =================
  const [quizSubTab, setQuizSubTab] = useState<'manage_exams' | 'submissions'>('manage_exams');
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Exam Form
  const [examTitle, setExamTitle] = useState('');
  const [examTargetGroup, setExamTargetGroup] = useState('کادر پرستاری و مامایی');
  const [examDescription, setExamDescription] = useState('');
  const [examDurationMinutes, setExamDurationMinutes] = useState(15);
  const [examDisplayQuestionCount, setExamDisplayQuestionCount] = useState(10);
  const [examIsActive, setExamIsActive] = useState(true);
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);

  // Question Form State (within modal)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'multiple_choice' | 'true_false' | 'descriptive'>('multiple_choice');
  const [qOptions, setQOptions] = useState<string[]>(['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴']);
  const [qCorrectOptionIndex, setQCorrectOptionIndex] = useState(0);
  const [qShuffleOptions, setQShuffleOptions] = useState(true);
  const [qPoints, setQPoints] = useState(2);

  // ================= TILE 3: RESULTS STATE =================
  const [filterDeptId, setFilterDeptId] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const depts = await DataAccessLayer.getDepartments();
    const chks = await DataAccessLayer.getChecklists('staff_eval');
    const evals = await DataAccessLayer.getEvaluations();
    const exms = await DataAccessLayer.getQuizExams();
    const subs = await DataAccessLayer.getQuizSubmissions();

    setDepartments(depts);
    setEvalChecklists(chks);
    setEvaluations(evals);
    setExams(exms);
    setQuizSubmissions(subs);

    if (depts.length > 0) setSelectedDeptId(depts[0].id);
    if (chks.length > 0) setSelectedChecklistId(chks[0].id);
    setLoading(false);
  };

  // Checklist Selection Effect to calculate max score based on fields
  useEffect(() => {
    const selectedChk = evalChecklists.find((c) => c.id === selectedChecklistId);
    if (selectedChk && selectedChk.fields && selectedChk.fields.length > 0) {
      const fieldCount = selectedChk.fields.length;
      setMaxScore(fieldCount * 2);
      setScore(fieldCount * 2);
    }
  }, [selectedChecklistId, evalChecklists]);

  // ================= HANDLERS FOR TILE 1: CHECKLIST EVALUATION =================
  const handleSubmitChecklistEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !nationalId.trim() || !selectedDeptId || !selectedChecklistId) {
      alert('لطفاً اطلاعات نام و نام خانوادگی، کد ملی، بخش و چک‌لیست را کامل کنید.');
      return;
    }

    const dept = departments.find((d) => d.id === selectedDeptId);
    const chk = evalChecklists.find((c) => c.id === selectedChecklistId);
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;

    await DataAccessLayer.saveEvaluation({
      staffName: staffName.trim(),
      nationalId: nationalId.trim(),
      departmentId: selectedDeptId,
      departmentName: dept?.name || 'نامشخص',
      checklistId: selectedChecklistId,
      checklistTitle: chk?.title || 'چک‌لیست ارزیابی پرسنل',
      totalScore: Number(score),
      maxScore: Number(maxScore),
      percentage: pct,
      year: selectedYear,
      month: selectedMonth,
      monthName: JALALI_MONTHS[selectedMonth - 1],
      correctiveAction: correctiveAction.trim() || 'عدم نیاز به اقدام اصلاحی',
      evaluatedBy: 'مسئول ایمنی بیمار',
      answers: checklistAnswers,
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setStaffName('');
      setNationalId('');
      setCorrectiveAction('');
      setChecklistAnswers({});
    }, 2500);

    const evals = await DataAccessLayer.getEvaluations();
    setEvaluations(evals);
  };

  // ================= HANDLERS FOR TILE 2: EXAM MANAGEMENT =================
  const handleOpenCreateExamModal = () => {
    setEditingExamId(null);
    setExamTitle('');
    setExamTargetGroup('کادر پرستاری و مامایی');
    setExamDescription('');
    setExamDurationMinutes(15);
    setExamDisplayQuestionCount(10);
    setExamIsActive(true);
    setExamQuestions([]);

    resetQuestionForm();
    setIsExamModalOpen(true);
  };

  const handleEditExam = (exam: QuizExam) => {
    setEditingExamId(exam.id);
    setExamTitle(exam.title);
    setExamTargetGroup(exam.targetGroup);
    setExamDescription(exam.description || '');
    setExamDurationMinutes(exam.durationMinutes || 15);
    setExamDisplayQuestionCount(exam.displayQuestionCount || 10);
    setExamIsActive(exam.isActive);
    setExamQuestions(exam.questions || []);

    resetQuestionForm();
    setIsExamModalOpen(true);
  };

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  const handleDeleteExam = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف آزمون',
      message: 'آیا از حذف این آزمون و سوالات آن اطمینان دارید؟',
      onConfirm: async () => {
        await DataAccessLayer.deleteQuizExam(id);
        const updated = await DataAccessLayer.getQuizExams();
        setExams(updated);
      },
    });
  };

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQText('');
    setQType('multiple_choice');
    setQOptions(['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴']);
    setQCorrectOptionIndex(0);
    setQShuffleOptions(true);
    setQPoints(2);
  };

  const handleAddOrUpdateQuestion = () => {
    if (!qText.trim()) {
      alert('صورت سوال را وارد نمایید.');
      return;
    }

    if (editingQuestionId) {
      setExamQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestionId
            ? {
                ...q,
                questionText: qText.trim(),
                type: qType,
                options: qType === 'descriptive' ? undefined : qOptions,
                correctOptionIndex: qType === 'descriptive' ? undefined : qCorrectOptionIndex,
                shuffleOptions: qShuffleOptions,
                points: qPoints,
              }
            : q
        )
      );
    } else {
      const newQ: QuizQuestion = {
        id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        questionText: qText.trim(),
        type: qType,
        options: qType === 'descriptive' ? undefined : qOptions,
        correctOptionIndex: qType === 'descriptive' ? undefined : qCorrectOptionIndex,
        shuffleOptions: qShuffleOptions,
        points: qPoints,
      };
      setExamQuestions((prev) => [...prev, newQ]);
    }

    resetQuestionForm();
  };

  const handleEditQuestionInModal = (q: QuizQuestion) => {
    setEditingQuestionId(q.id);
    setQText(q.questionText);
    setQType(q.type);
    setQOptions(q.options || ['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴']);
    setQCorrectOptionIndex(q.correctOptionIndex || 0);
    setQShuffleOptions(q.shuffleOptions !== undefined ? q.shuffleOptions : true);
    setQPoints(q.points || 2);
  };

  const handleDeleteQuestionInModal = (qId: string) => {
    setExamQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      alert('عنوان آزمون الزامی است.');
      return;
    }

    if (examQuestions.length === 0) {
      alert('حداقل ۱ سوال باید برای این آزمون طراحی کنید.');
      return;
    }

    await DataAccessLayer.saveQuizExam({
      id: editingExamId || undefined,
      title: examTitle.trim(),
      targetGroup: examTargetGroup.trim(),
      description: examDescription.trim(),
      durationMinutes: Number(examDurationMinutes),
      displayQuestionCount: Number(examDisplayQuestionCount),
      isActive: examIsActive,
      questions: examQuestions,
    });

    setIsExamModalOpen(false);
    const updated = await DataAccessLayer.getQuizExams();
    setExams(updated);
  };

  // Group Evaluations by Staff (National ID) for Report Card generation
  const staffReportCardsMap: Record<
    string,
    { staffName: string; nationalId: string; departmentName: string; items: StaffEvaluation[] }
  > = {};
  evaluations.forEach((ev) => {
    if (!staffReportCardsMap[ev.nationalId]) {
      staffReportCardsMap[ev.nationalId] = {
        staffName: ev.staffName,
        nationalId: ev.nationalId,
        departmentName: ev.departmentName,
        items: [],
      };
    }
    staffReportCardsMap[ev.nationalId].items.push(ev);
  });

  // Chart data per Jalali month awareness %
  const monthlyAwarenessChartData = JALALI_MONTHS.map((mName, idx) => {
    const monthEvs = evaluations.filter((e) => {
      const matchDept = filterDeptId === 'all' || e.departmentId === filterDeptId;
      return e.month === idx + 1 && matchDept;
    });
    const avgPct =
      monthEvs.length > 0
        ? Math.round(monthEvs.reduce((acc, curr) => acc + curr.percentage, 0) / monthEvs.length)
        : 0;
    return {
      monthName: mName,
      percentage: avgPct,
    };
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-indigo-200/60 gap-4" dir="rtl">
        <div className="flex items-center gap-3">
          {selectedTile ? (
            <button
              onClick={() => {
                if (selectedTile === 'quiz_designer' || selectedTile === 'quiz_results') {
                  setSelectedTile('quiz_menu');
                } else {
                  setSelectedTile(null);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              <span>
                {selectedTile === 'quiz_designer' || selectedTile === 'quiz_results'
                  ? 'بازگشت'
                  : 'بازگشت'}
              </span>
            </button>
          ) : (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40 shrink-0"
            >
              <ArrowRight className="w-4 h-4 text-slate-950" />
              <span>بازگشت</span>
            </button>
          )}

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
              <UserCheck className="w-8 h-8 text-cyan-600" />
              {selectedTile === 'checklist' && 'ارزیابی پرسنل بر اساس چک‌لیست'}
              {selectedTile === 'quiz_menu' && 'ارزیابی دانش پرسنل با آزمون آنلاین'}
              {selectedTile === 'quiz_designer' && 'طراحی و ویرایش آزمون‌های ثبت‌شده'}
              {selectedTile === 'quiz_results' && 'نتایج و کارنامه‌های آزمون‌های پرسنل'}
              {selectedTile === 'results' && 'سوابق، کارنامه‌ها و نمودارهای ارزیابی پرسنل'}
              {!selectedTile && 'ارزیابی دانش و عملکرد ایمنی بیمار پرسنل'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
              {selectedTile === 'checklist' && 'تکمیل بنود چک‌لیست ارزیابی دانش ایمنی برای کادر درمان و محاسبه نمره'}
              {selectedTile === 'quiz_menu' && 'لطفاً یکی از گزینه‌های زیر را جهت طراحی آزمون یا مشاهده نتایج انتخاب کنید'}
              {selectedTile === 'quiz_designer' && 'تعریف بانک سوالات ۴ گزینه‌ای و تشریحی، تنظیم زمان و فعال‌سازی آزمون'}
              {selectedTile === 'quiz_results' && 'مشاهده نمرات و پاسخ‌های ثبت‌شده پرسنل در آزمون‌های آنلاین'}
              {selectedTile === 'results' && 'مشاهده سوابق ارزیابی، پایش نمودار ماهانه و خروجی Word کارنامه ایمنی بیمار'}
              {!selectedTile && 'لطفاً یکی از بخش‌های ارزیابی زیر را انتخاب کنید'}
            </p>
          </div>
        </div>
      </div>

      {/* ================= TILE SELECTION SCREEN ================= */}
      {!selectedTile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          {/* Tile 1: ارزیابی بر اساس چک لیست */}
          <button
            onClick={() => setSelectedTile('checklist')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 shadow-lg transition-all duration-300">
                <FileCheck2 className="w-9 h-9 text-amber-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black">
                بخش شماره ۱
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۱. ارزیابی بر اساس چک‌لیست
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                ورود مشخصات پرسنل، انتخاب چک‌لیست ایمنی بیمار و تکمیل ارزیابی حضوری
              </p>
            </div>
          </button>

          {/* Tile 2: ارزیابی با آزمون */}
          <button
            onClick={() => setSelectedTile('quiz_menu')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
                <GraduationCap className="w-9 h-9 text-cyan-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-black">
                بخش شماره ۲
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۲. ارزیابی با آزمون (سامانه آزمون)
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                طراحی آزمون‌های آنلاین، بانک سوالات، جابجایی گزینه‌ها و مشاهده نتایج پرسنل
              </p>
            </div>
          </button>

          {/* Tile 3: سوابق، کارنامه‌ها و نتایج */}
          <button
            onClick={() => setSelectedTile('results')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500/20 shadow-lg transition-all duration-300">
                <BarChart3 className="w-9 h-9 text-emerald-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                بخش شماره ۳
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۳. سوابق و کارنامه ارزیابی
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                پایش نمودار ماهانه آگاهی، سوابق ارزیابی و دانلود کارنامه رسمی در قالب Word
              </p>
            </div>
          </button>
        </div>
      )}

      {/* ================= SUB-SELECTION: QUIZ SUB-MENU ================= */}
      {selectedTile === 'quiz_menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 animate-fadeIn">
          {/* Sub Option 1: طراحی و ویرایش آزمون‌ها */}
          <button
            onClick={() => setSelectedTile('quiz_designer')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-2xl border-2 border-cyan-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[240px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-cyan-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-cyan-200/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
                <GraduationCap className="w-9 h-9 text-cyan-300" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-black">
                گزینه شماره ۱
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۱. طراحی و ویرایش آزمون‌های ثبت‌شده
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                طراحی آزمون جدید، تعریف سوالات ۴ گزینه‌ای و تشریحی، تنظیم مدت زمان، جابجایی گزینه‌ها و فعال‌سازی
              </p>
            </div>
          </button>

          {/* Sub Option 2: نتایج آزمون‌های پرسنل */}
          <button
            onClick={() => setSelectedTile('quiz_results')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-2xl border-2 border-emerald-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[240px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-emerald-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-emerald-200/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500/20 shadow-lg transition-all duration-300">
                <FileText className="w-9 h-9 text-emerald-300" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                گزینه شماره ۲
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۲. نتایج آزمون‌های پرسنل
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                مشاهده پاسخ‌های ثبت‌شده، لیست شرکت‌کنندگان، درصد و نمره کسب‌شده در آزمون‌های آنلاین
              </p>
            </div>
          </button>
        </div>
      )}

      {/* ================= TILE 1 CONTENT: CHECKLIST EVALUATION ================= */}
      {selectedTile === 'checklist' && (
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-900 animate-fadeIn">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-indigo-600" />
              <span>ارزیابی پرسنل بر اساس چک‌لیست</span>
            </h3>
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              مرحله ۱: انتخاب مشخصات فردی و چک‌لیست
            </span>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>ارزیابی چک‌لیستی پرسنل با موفقیت ثبت شد و در کارنامه درج گردید.</span>
            </div>
          )}

          <form onSubmit={handleSubmitChecklistEvaluation} className="space-y-6">
            {/* Step 1 Inputs: Staff Info */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-600" />
                اطلاعات فردی کادر درمان
              </h4>

              {/* National ID Search Section */}
              <div className="bg-white p-4 rounded-2xl border-2 border-indigo-200 space-y-3">
                <label className="block text-xs font-black text-slate-900 mb-1">
                  کد ملی پرسنل را وارد کرده و دکمه جستجو را بزنید: <span className="text-rose-600">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={nationalId}
                    onChange={(e) => {
                      setNationalId(e.target.value);
                      setSearchAttempted(false);
                      setSearchResultStaff(null);
                    }}
                    placeholder="مثال: ۰۰۱۲۳۴۵۶۷۸"
                    className="flex-1 px-4 py-2.5 bg-white border-2 border-indigo-300 rounded-2xl text-slate-900 font-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleSearchStaff}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
                  >
                    <Search className="w-4 h-4 text-amber-300" />
                    <span>جستجوی پرسنل</span>
                  </button>
                </div>

                {/* Search Result Box */}
                {searchAttempted && (
                  <div>
                    {searchResultStaff ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-slate-900 text-xs font-black flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-950 block">
                              نام پرسنل: {searchResultStaff.fullName}
                            </span>
                            <span className="text-xs text-emerald-800 font-bold block mt-0.5">
                              بخش {searchResultStaff.departmentName} • {searchResultStaff.position || 'کادر درمان'} (کد ملی: {searchResultStaff.nationalId})
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectSearchResult(searchResultStaff)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>انتخاب و تایید پرسنل</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs font-black flex items-center gap-2 animate-fadeIn">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>
                          پرسنلی با کد ملی «{nationalId}» یافت نشد. می‌توانید مشخصات را دستی وارد کنید.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Identified Banner */}
                {identifiedStaff && (
                  <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-black flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>پرسنل انتخاب‌شده: <strong>{identifiedStaff.fullName}</strong> (بخش {identifiedStaff.departmentName})</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    نام و نام خانوادگی پرسنل <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: دکتر علی رضایی / پرستار مریم محمدی"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    بخش محل خدمت <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2 Checklist Selection & Questions */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                انتخاب و پاسخ به بنود چک‌لیست ارزیابی
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    عنوان چک‌لیست ارزیابی <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={selectedChecklistId}
                    onChange={(e) => setSelectedChecklistId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    required
                  >
                    {evalChecklists.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    نمره ارزیابی دستی / محاسبه‌شده
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-slate-900 font-black">از کل</span>
                    <input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Render Selected Checklist Items */}
              {selectedChecklistId && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-black text-slate-700 block mb-2">
                    آیتم‌های چک‌لیست انتخابی:
                  </span>

                  {evalChecklists
                    .find((c) => c.id === selectedChecklistId)
                    ?.fields?.map((field, fIdx) => (
                      <div
                        key={field.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-extrabold text-slate-900">
                          {toPersianDigits(fIdx + 1)}. {field.label}
                        </span>

                        <div className="flex items-center gap-2">
                          {field.type === 'mc' || field.type === 'yesno' ? (
                            <select
                              value={checklistAnswers[field.id] || 'بلی'}
                              onChange={(e) =>
                                setChecklistAnswers((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              className="px-3 py-1 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                            >
                              <option value="بلی">بلی (رعایت کامل - ۲ نمره)</option>
                              <option value="تاحدودی">تاحدودی (۱ نمره)</option>
                              <option value="خیر">خیر (عدم رعایت - ۰)</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="توضیحات..."
                              value={checklistAnswers[field.id] || ''}
                              onChange={(e) =>
                                setChecklistAnswers((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              className="px-3 py-1 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Action and Submit */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                اقدام اصلاحی پیشنهاد شده (در صورت لزوم)
              </label>
              <textarea
                rows={2}
                placeholder="اقدامات آموزش مجدد، لزوم ارتقای تجهیزات یا تذکر شفاهی..."
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white font-black text-base shadow-xl shadow-indigo-600/30 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>ثبت ارزیابی چک‌لیست پرسنل</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= QUIZ OPTION 1: EXAM DESIGNER ================= */}
      {selectedTile === 'quiz_designer' && (
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-900 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <span>طراحی و مدیریت آزمون‌های آنلاین</span>
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                تعداد آزمون‌های طراحی‌شده: {toPersianDigits(exams.length)} آزمون
              </p>
            </div>

            <button
              onClick={handleOpenCreateExamModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>طراحی آزمون جدید</span>
            </button>
          </div>

          <div className="space-y-4">
            {exams.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
                <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-black text-slate-700">هیچ آزمونی هنوز طراحی نشده است.</p>
                <button
                  onClick={handleOpenCreateExamModal}
                  className="mt-4 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  اولین آزمون را طراحی کنید
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-5 bg-slate-50 rounded-3xl border-2 border-slate-200 hover:border-indigo-400 transition space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black ${
                            exam.isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {exam.isActive ? 'فعال (قابل شرکت)' : 'غیرفعال'}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          گروه هدف: {exam.targetGroup}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 mb-2">{exam.title}</h4>
                      <p className="text-xs font-bold text-slate-600 line-clamp-2 mb-3">
                        {exam.description || 'بدون توضیح'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs font-extrabold text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 mb-3">
                        <div>کل بانک سوالات: {toPersianDigits(exam.questions?.length || 0)} سوال</div>
                        <div>نمایش برای پرسنل: {toPersianDigits(exam.displayQuestionCount)} سوال</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-[10px] text-slate-500 font-bold">
                        تاریخ ساخت: {toPersianDigits(exam.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditExam(exam)}
                          className="p-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>ویرایش و سوالات</span>
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= QUIZ OPTION 2: SUBMISSIONS RESULTS ================= */}
      {selectedTile === 'quiz_results' && (
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-900 animate-fadeIn">
          <div className="pb-4 border-b-2 border-slate-200">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" />
              <span>نتایج و نمرات آزمون‌های پرسنل</span>
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-1">
              کل پاسخ‌های ثبت‌شده: {toPersianDigits(quizSubmissions.length)} مورد
            </p>
          </div>

          <div className="space-y-4">
            {quizSubmissions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
                <p className="text-sm font-black text-slate-700">هنوز پاسخی در آزمون‌ها ثبت نشده است.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-md">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white font-black">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">نام و نام خانوادگی</th>
                      <th className="p-3">کد ملی</th>
                      <th className="p-3">بخش</th>
                      <th className="p-3">عنوان آزمون</th>
                      <th className="p-3">نمره (درصد)</th>
                      <th className="p-3">تاریخ شرکت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-bold text-slate-900 bg-white">
                    {quizSubmissions.map((sub, sIdx) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="p-3">{toPersianDigits(sIdx + 1)}</td>
                        <td className="p-3 font-black text-indigo-950">{sub.staffName}</td>
                        <td className="p-3">{toPersianDigits(sub.nationalId)}</td>
                        <td className="p-3">{sub.departmentName}</td>
                        <td className="p-3">{sub.examTitle}</td>
                        <td className="p-3 font-black">
                          {toPersianDigits(sub.score)} از {toPersianDigits(sub.maxScore)} (٪
                          {toPersianDigits(sub.percentage)})
                        </td>
                        <td className="p-3">{toPersianDigits(sub.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TILE 3 CONTENT: EVALUATION RESULTS & REPORT CARDS ================= */}
      {selectedTile === 'results' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Monthly Awareness Chart */}
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  <span>نمودار میانگین درصد آگاهی ایمنی بیمار (به تفکیک ماه)</span>
                </h3>
                <p className="text-xs text-indigo-900/80 font-bold mt-1">
                  پایش روند رشد سطح آگاهی کادر درمان بر اساس ارزیابی‌های صورت‌گرفته
                </p>
              </div>

              {/* Filter by Dept */}
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <select
                  value={filterDeptId}
                  onChange={(e) => setFilterDeptId(e.target.value)}
                  className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-2xl text-xs font-black text-slate-900 cursor-pointer"
                >
                  <option value="all">تمامی بخش‌ها</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-64 sm:h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAwarenessChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip
                    formatter={(val: any) => [`٪${toPersianDigits(val)}`, 'درصد آگاهی']}
                    labelStyle={{ fontFamily: 'Vazirmatn, sans-serif' }}
                  />
                  <Bar dataKey="percentage" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual Report Cards Table & Docx Download */}
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-200">
              <Download className="w-6 h-6 text-emerald-600" />
              <span>صدور و دانلود کارنامه ایمنی بیمار کادر درمان</span>
            </h3>

            {Object.keys(staffReportCardsMap).length === 0 ? (
              <p className="text-xs font-bold text-slate-600 text-center py-6">
                هنوز کارنامه‌ای صادر نشده است. ابتدا از بخش اول (ارزیابی بر اساس چک‌لیست) نسبت به ثبت ارزیابی اقدام فرمایید.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(staffReportCardsMap).map((card) => {
                  const totalPctSum = card.items.reduce((acc, curr) => acc + curr.percentage, 0);
                  const avgPct = Math.round(totalPctSum / card.items.length);

                  return (
                    <div
                      key={card.nationalId}
                      className="p-5 bg-slate-50 rounded-3xl border-2 border-slate-200 hover:border-indigo-400 transition flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-base font-black text-slate-900">{card.staffName}</h4>
                        <span className="text-xs font-bold text-slate-600 block mt-0.5">
                          کد ملی: {toPersianDigits(card.nationalId)} | بخش: {card.departmentName}
                        </span>
                        <span className="text-xs font-black text-indigo-700 block mt-1">
                          میانگین آگاهی ایمنی: ٪{toPersianDigits(avgPct)} ({toPersianDigits(card.items.length)}{' '}
                          نوبت ارزیابی)
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          downloadStaffSafetyReportCardDocx(
                            card.staffName,
                            card.nationalId,
                            card.departmentName,
                            card.items
                          )
                        }
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md flex items-center gap-2 shrink-0 transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>دانلود کارنامه (Word)</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CREATE/EDIT EXAM MODAL ================= */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-indigo-300 text-right space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <span>{editingExamId ? 'ویرایش آزمون و بانک سوالات' : 'طراحی آزمون ارزیابی جدید'}</span>
              </h3>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-6">
              {/* Exam General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    عنوان آزمون <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: آزمون جامع استانداردهای الزامی ایمنی بیمار"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl font-black text-sm text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">گروه هدف آزمون</label>
                  <input
                    type="text"
                    placeholder="مثلاً: کادر پرستاری، مامایی و بهیاران"
                    value={examTargetGroup}
                    onChange={(e) => setExamTargetGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl font-black text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    زمان پاسخگویی (به دقیقه)
                  </label>
                  <input
                    type="number"
                    value={examDurationMinutes}
                    onChange={(e) => setExamDurationMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl font-black text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    تعداد سوالات قابل نمایش برای پرسنل (رندوم از کل بانک)
                  </label>
                  <input
                    type="number"
                    value={examDisplayQuestionCount}
                    onChange={(e) => setExamDisplayQuestionCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl font-black text-sm text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="examActiveToggle"
                    checked={examIsActive}
                    onChange={(e) => setExamIsActive(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="examActiveToggle" className="text-xs font-black text-slate-900 cursor-pointer">
                    آزمون فعال باشد (در صفحه اصلی برای پرسنل قابل مشاهده و شرکت باشد)
                  </label>
                </div>
              </div>

              {/* Question Designer Section */}
              <div className="bg-indigo-50/60 p-5 rounded-3xl border-2 border-indigo-200 space-y-4">
                <h4 className="text-sm font-black text-indigo-950 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    طراحی و افزودن سوالات به این آزمون (تعداد طراحی‌شده: {toPersianDigits(examQuestions.length)})
                  </span>
                  {editingQuestionId && (
                    <button
                      type="button"
                      onClick={resetQuestionForm}
                      className="text-xs text-rose-600 font-bold underline"
                    >
                      انصراف از ویرایش سوال
                    </button>
                  )}
                </h4>

                <div className="space-y-3 bg-white p-4 rounded-2xl border border-indigo-200">
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">صورت سوال</label>
                    <textarea
                      rows={2}
                      placeholder="متن سوال را وارد نمایید..."
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">نوع پاسخ سوال</label>
                      <select
                        value={qType}
                        onChange={(e) => setQType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900"
                      >
                        <option value="multiple_choice">چندگزینه‌ای (تست ۴ گزینه‌ای)</option>
                        <option value="true_false">بلی / خیر (صحیح و غلط)</option>
                        <option value="descriptive">تشریحی</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">بارم/نمره سوال</label>
                      <input
                        type="number"
                        value={qPoints}
                        onChange={(e) => setQPoints(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Options Input for Multiple Choice */}
                  {qType === 'multiple_choice' && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-900">گزینه‌ها و انتخاب پاسخ درست:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id="shuffleCheck"
                            checked={qShuffleOptions}
                            onChange={(e) => setQShuffleOptions(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <label htmlFor="shuffleCheck" className="text-[11px] font-black text-indigo-900 cursor-pointer flex items-center gap-1">
                            <Shuffle className="w-3 h-3 text-indigo-600" />
                            تیک جابجایی گزینه‌ها در آزمون فعال باشد
                          </label>
                        </div>
                      </div>

                      {qOptions.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={qCorrectOptionIndex === oIdx}
                            onChange={() => setQCorrectOptionIndex(oIdx)}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...qOptions];
                              newOpts[oIdx] = e.target.value;
                              setQOptions(newOpts);
                            }}
                            placeholder={`گزینه ${toPersianDigits(oIdx + 1)}`}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* True False */}
                  {qType === 'true_false' && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-xs font-black text-slate-900 block">انتخاب پاسخ درست:</label>
                      <div className="flex items-center gap-4 text-xs font-bold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="tfOpt"
                            checked={qCorrectOptionIndex === 0}
                            onChange={() => setQCorrectOptionIndex(0)}
                          />
                          <span>صحیح / بلی</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="tfOpt"
                            checked={qCorrectOptionIndex === 1}
                            onChange={() => setQCorrectOptionIndex(1)}
                          />
                          <span>غلط / خیر</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddOrUpdateQuestion}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingQuestionId ? 'به‌روزرسانی این سوال' : 'افزودن این سوال به آزمون'}</span>
                  </button>
                </div>

                {/* Question List in Modal */}
                {examQuestions.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {examQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold gap-2"
                      >
                        <div className="truncate flex-1">
                          <span className="text-indigo-700 font-black ml-1">
                            سوال {toPersianDigits(idx + 1)}:
                          </span>
                          <span>{q.questionText}</span>
                          <span className="text-[10px] text-slate-500 block">
                            نوع: {q.type === 'multiple_choice' ? 'تستی' : q.type === 'true_false' ? 'بلی/خیر' : 'تشریحی'} |
                            جابجایی گزینه‌ها: {q.shuffleOptions ? 'فعال' : 'غیرفعال'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditQuestionInModal(q)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-indigo-700"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestionInModal(q.id)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Modal Button */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  ذخیره و ثبت آزمون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
