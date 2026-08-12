import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  GraduationCap,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Building2,
  Award,
  Sparkles,
  RefreshCw,
  Shuffle,
  Send,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { QuizExam, QuizQuestion, Department, QuizSubmission, StaffMember } from '../types';
import { DataAccessLayer, subscribeToDALChanges } from '../services/dal';
import { toPersianDigits } from '../utils/jalali';

interface PublicQuizViewProps {
  onBack: () => void;
}

export const PublicQuizView: React.FC<PublicQuizViewProps> = ({ onBack }) => {
  const [exams, setExams] = useState<QuizExam[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Flow State: 'list' | 'info_modal' | 'taking' | 'result'
  const [flowState, setFlowState] = useState<'list' | 'info_modal' | 'taking' | 'result'>('list');
  const [selectedExam, setSelectedExam] = useState<QuizExam | null>(null);

  // Candidate Registration Form
  const [staffName, setStaffName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [identifiedStaff, setIdentifiedStaff] = useState<StaffMember | null>(null);

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
    const dept = departments.find(
      (d) => d.id === staff.departmentId || d.name === staff.departmentName
    );
    if (dept) setSelectedDeptId(dept.id);
  };

  // Active Exam Session Data
  const [activeQuestions, setActiveQuestions] = useState<
    {
      originalQuestion: QuizQuestion;
      shuffledOptions?: string[];
      // map from shuffled index -> original index
      optionIndexMap?: number[];
    }[]
  >([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({}); // questionId -> selectedShuffledIndex or string text
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(null);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDALChanges(() => {
      loadData(true);
    });
    return () => unsubscribe();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (flowState !== 'taking' || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flowState, timeLeftSeconds]);

  const loadData = async () => {
    setLoading(true);
    const allExams = await DataAccessLayer.getQuizExams();
    const depts = await DataAccessLayer.getDepartments();
    setExams(allExams.filter((e) => e.isActive));
    setDepartments(depts);
    if (depts.length > 0) setSelectedDeptId(depts[0].id);
    setLoading(false);
  };

  const handleOpenInfoModal = (exam: QuizExam) => {
    setSelectedExam(exam);
    setFlowState('info_modal');
  };

  const handleStartExam = () => {
    if (!staffName.trim() || !nationalId.trim() || !selectedDeptId) {
      alert('لطفاً نام و نام خانوادگی، کد ملی و بخش محل خدمت خود را به صورت کامل وارد نمایید.');
      return;
    }

    if (!selectedExam) return;

    // Pick random N questions from pool
    const pool = [...selectedExam.questions];
    // Fisher-Yates shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const countToPick = Math.min(selectedExam.displayQuestionCount || pool.length, pool.length);
    const chosenQuestions = pool.slice(0, countToPick);

    // Process questions: shuffle options if required
    const preparedQuestions = chosenQuestions.map((q) => {
      if (
        q.shuffleOptions &&
        q.options &&
        q.options.length > 0 &&
        (q.type === 'multiple_choice' || q.type === 'true_false')
      ) {
        // Create indexed pairs [originalIndex, optionText]
        const indexedOptions = q.options.map((opt, idx) => ({ originalIndex: idx, text: opt }));
        for (let i = indexedOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
        }
        return {
          originalQuestion: q,
          shuffledOptions: indexedOptions.map((o) => o.text),
          optionIndexMap: indexedOptions.map((o) => o.originalIndex),
        };
      } else {
        return {
          originalQuestion: q,
          shuffledOptions: q.options,
          optionIndexMap: q.options ? q.options.map((_, idx) => idx) : undefined,
        };
      }
    });

    setActiveQuestions(preparedQuestions);
    setUserAnswers({});
    setTimeLeftSeconds((selectedExam.durationMinutes || 15) * 60);
    setFlowState('taking');
  };

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleFinalSubmit = async () => {
    if (!selectedExam) return;

    const dept = departments.find((d) => d.id === selectedDeptId);

    // Calculate score
    let totalScore = 0;
    let maxPossibleScore = 0;

    activeQuestions.forEach((item) => {
      const q = item.originalQuestion;
      const pts = q.points || 2;
      maxPossibleScore += pts;

      const userAns = userAnswers[q.id];

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        if (userAns !== undefined && item.optionIndexMap) {
          const originalSelectedIdx = item.optionIndexMap[userAns];
          if (originalSelectedIdx === q.correctOptionIndex) {
            totalScore += pts;
          }
        }
      } else if (q.type === 'descriptive') {
        // Descriptive question given base point for answering
        if (typeof userAns === 'string' && userAns.trim().length > 5) {
          totalScore += pts; // Award full points for descriptive submission
        }
      }
    });

    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 100;

    const submissionData = await DataAccessLayer.saveQuizSubmission({
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      staffName: staffName.trim(),
      nationalId: nationalId.trim(),
      departmentId: selectedDeptId,
      departmentName: dept?.name || 'نامشخص',
      answers: userAnswers,
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: percentage,
    });

    setSubmissionResult(submissionData);
    setFlowState('result');
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${toPersianDigits(m)}:${s < 10 ? '0' : ''}${toPersianDigits(s)}`;
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center text-slate-700 font-bold">
        در حال بارگذاری سامانه آزمون‌های ایمنی بیمار...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-cyan-600" />
            سامانه آزمون‌ها و سنجش آنلاین ایمنی بیمار
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
            شرکت در آزمون‌های ارزیابی آگاهی کادر درمان و دریافت گواهی قبولی ایمنی بیمار
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
          <span>بازگشت به صفحه اصلی</span>
        </button>
      </div>

      {/* STATE 1: List of Available Active Exams */}
      {flowState === 'list' && (
        <div>
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/30 mb-8">
            <h3 className="text-xl font-black text-amber-300 flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              لیست آزمون‌های فعال ایمنی بیمار
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 font-bold">
              جهت شرکت در ارزیابی، آزمون مربوط به رده شغلی یا بخش خود را انتخاب کنید. سوالات هر آزمون به صورت تصادفی و غیرتکراری برای هر فرد نمایش داده می‌شود.
            </p>
          </div>

          {exams.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-300 shadow-sm">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h4 className="text-lg font-black text-slate-800">هیچ آزمون فعالی ثبت نشده است</h4>
              <p className="text-xs text-slate-700 font-bold mt-1">
                در حال حاضر آزمون جدیدی توسط مسئول ایمنی بیمار تعریف نشده است.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-3xl p-6 shadow-xl border-2 border-slate-200/80 hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                        آزمون فعال
                      </span>
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        گروه هدف: {exam.targetGroup}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-indigo-950 leading-snug mb-2">{exam.title}</h4>
                    {exam.description && (
                      <p className="text-xs text-slate-700 font-bold mb-4 line-clamp-2">{exam.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                        <HelpCircle className="w-4 h-4 text-cyan-600" />
                        <span>تعداد سوالات: {toPersianDigits(exam.displayQuestionCount)} سوال</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>زمان پاسخگویی: {toPersianDigits(exam.durationMinutes || 15)} دقیقه</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenInfoModal(exam)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white font-black text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span>ورود به مرحله آزمون</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STATE 2: Candidate Info Registration Form Modal/View */}
      {flowState === 'info_modal' && selectedExam && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-indigo-200 max-w-2xl mx-auto">
          <div className="text-center pb-6 border-b border-slate-200 mb-6">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black">
              ثبت مشخصات شرکت‌کننده
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">{selectedExam.title}</h3>
            <p className="text-xs text-slate-700 font-bold mt-1">
              لطفاً جهت ثبت نمره و صدور کارنامه، مشخصات خود را دقیق وارد نمایید.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {/* National ID Field & Search Button */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 space-y-3">
              <label className="block text-xs font-black text-slate-800 mb-1">
                کد ملی پرسنل را وارد کرده و دکمه جستجوی پرسنل را بزنید: <span className="text-rose-500">*</span>
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
                  className="flex-1 px-4 py-3 rounded-2xl bg-white border-2 border-indigo-300 font-black text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 text-center tracking-widest"
                />
                <button
                  type="button"
                  onClick={handleSearchStaff}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
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
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  نام و نام خانوادگی کادر درمان <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="مثال: مریم محمدی"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  بخش محل خدمت <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFlowState('list')}
              className="flex-1 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-sm transition"
            >
              انصراف
            </button>
            <button
              onClick={handleStartExam}
              className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>شروع آزمون</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: Taking Test Session */}
      {flowState === 'taking' && selectedExam && (
        <div className="space-y-6">
          {/* Active Exam Sticky Header Bar */}
          <div className="sticky top-4 z-20 bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-cyan-500/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-cyan-300">در حال برگزاری آزمون</span>
              <h3 className="text-lg font-black text-white">{selectedExam.title}</h3>
              <p className="text-xs text-slate-300 font-bold">
                شرکت‌کننده: {staffName} | بخش: {departments.find((d) => d.id === selectedDeptId)?.name}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-bold">زمان باقیمانده</span>
                <span className="text-lg font-black text-amber-300 tracking-wider">
                  {formatTimer(timeLeftSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {activeQuestions.map((item, qIdx) => {
              const q = item.originalQuestion;
              const isAnswered = userAnswers[q.id] !== undefined;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 transition-all ${
                    isAnswered ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                    <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black">
                      سوال {toPersianDigits(qIdx + 1)} از {toPersianDigits(activeQuestions.length)}
                    </span>
                    <span className="text-xs font-extrabold text-slate-500">
                      بارم: {toPersianDigits(q.points || 2)} نمره
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-slate-900 mb-6 leading-relaxed">
                    {q.questionText}
                  </h4>

                  {/* Options for MCQ / True-False */}
                  {(q.type === 'multiple_choice' || q.type === 'true_false') && item.shuffledOptions && (
                    <div className="space-y-3">
                      {item.shuffledOptions.map((optText, optIdx) => {
                        const isSelected = userAnswers[q.id] === optIdx;
                        return (
                          <label
                            key={optIdx}
                            onClick={() => handleOptionSelect(q.id, optIdx)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-100/60 font-black text-emerald-950 shadow-md'
                                : 'border-slate-200 hover:border-indigo-300 bg-slate-50 text-slate-800 font-bold'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={isSelected}
                              onChange={() => handleOptionSelect(q.id, optIdx)}
                              className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm">{optText}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Descriptive Text Answer */}
                  {q.type === 'descriptive' && (
                    <div>
                      <textarea
                        rows={3}
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                        placeholder="پاسخ تشریحی خود را دقیق وارد کنید..."
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      ></textarea>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Submit Button */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-slate-200 text-center">
            <p className="text-xs text-slate-600 font-bold mb-4">
              تعداد سوالات پاسخ داده شده: {toPersianDigits(Object.keys(userAnswers).length)} از{' '}
              {toPersianDigits(activeQuestions.length)}
            </p>

            <button
              onClick={handleFinalSubmit}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base shadow-xl shadow-emerald-600/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-3 mx-auto"
            >
              <Send className="w-5 h-5" />
              <span>ثبت و ارسال نهایی پاسخ‌نامه آزمون</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: Final Result & Score Report Card */}
      {flowState === 'result' && submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-indigo-200 max-w-3xl mx-auto text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-4 border-emerald-300 shadow-lg">
            <Award className="w-10 h-10" />
          </div>

          <span className="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black">
            نتایج آزمون ایمنی بیمار
          </span>

          <h3 className="text-2xl font-black text-slate-900 mt-2">{submissionResult.examTitle}</h3>
          <p className="text-xs text-slate-700 font-bold mt-1">
            کارنامه ارزیابی آنلاین برای {submissionResult.staffName} ({submissionResult.departmentName})
          </p>

          {/* Score Badge Card */}
          <div className="my-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white shadow-xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] text-indigo-300 font-bold block">نمره کسب‌شده</span>
                <span className="text-2xl font-black text-amber-300">
                  {toPersianDigits(submissionResult.score)} از {toPersianDigits(submissionResult.maxScore)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 font-bold block">درصد آگاهی</span>
                <span className="text-2xl font-black text-cyan-300">
                  ٪{toPersianDigits(submissionResult.percentage)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 font-bold block">وضعیت قبولی</span>
                <span
                  className={`text-lg font-black ${
                    submissionResult.percentage >= 70 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {submissionResult.percentage >= 70 ? 'قبول (مطلوب)' : 'نیازمند بازآموزی'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-700 font-bold mb-8">
            اطلاعات آزمون شما با موفقیت در بانک اطلاعاتی ایمنی بیمار بیمارستان ثبت شد و در کارنامه ارزیابی دوره ای درج خواهد گردید.
          </p>

          <button
            onClick={() => {
              setFlowState('list');
              setSelectedExam(null);
            }}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            بازگشت به لیست آزمون‌ها
          </button>
        </div>
      )}
    </div>
  );
};
