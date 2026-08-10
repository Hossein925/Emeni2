import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  PlusCircle,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  Save,
  Award,
  BarChart3,
  Building2,
  ListFilter,
  Users,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  PieChart as PieChartIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { QuarterlySelfAssessment } from '../types';
import { DataAccessLayer } from '../services/dal';
import { QUARTERLY_STANDARDS } from '../data/quarterlyStandards';
import { downloadQuarterlySelfAssessmentDocx } from '../utils/exportUtils';
import { toPersianDigits, getCurrentJalaliYear } from '../utils/jalali';

export const QuarterlySelfAssessmentAdmin: React.FC = () => {
  const [assessments, setAssessments] = useState<QuarterlySelfAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedAssessment, setSavedAssessment] = useState<QuarterlySelfAssessment | null>(null);

  // View mode: 'list' | 'analytics'
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  // Year filter for Analytics
  const [selectedAnalyticsYear, setSelectedAnalyticsYear] = useState<number>(getCurrentJalaliYear());

  // Form State
  const [hospitalName, setHospitalName] = useState('امام رضا (ع)');
  const [year, setYear] = useState<number>(getCurrentJalaliYear());
  const [season, setSeason] = useState<string>('بهار');
  const [approvedBeds, setApprovedBeds] = useState('');
  const [activeBeds, setActiveBeds] = useState('');
  const [bedOccupancyRate, setBedOccupancyRate] = useState('');
  const [avgDailyInpatients, setAvgDailyInpatients] = useState('');
  const [annualOutpatientVisits, setAnnualOutpatientVisits] = useState('');
  const [annualEmergencyL13, setAnnualEmergencyL13] = useState('');
  const [annualEmergencyL45, setAnnualEmergencyL45] = useState('');

  // Scores state: code -> 0 | 0.5 | 1
  const [scores, setScores] = useState<Record<string, number>>({});

  // Signatories
  const [safetyOfficerAndPresident, setSafetyOfficerAndPresident] = useState('');
  const [internalManager, setInternalManager] = useState('هاشم دیلمی کیا');
  const [metron, setMetron] = useState('زینب چرغان');
  const [qualityManager, setQualityManager] = useState('فاطمه فرحی');
  const [safetyCoordinator, setSafetyCoordinator] = useState('مهلا عریضی');

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    const data = await DataAccessLayer.getQuarterlySelfAssessments();
    setAssessments(data);
    setLoading(false);
  };

  const handleOpenNewForm = () => {
    setEditingId(null);
    setSavedSuccess(false);
    setSavedAssessment(null);
    setHospitalName('امام رضا (ع)');
    setYear(getCurrentJalaliYear());
    setSeason('بهار');
    setApprovedBeds('');
    setActiveBeds('');
    setBedOccupancyRate('');
    setAvgDailyInpatients('');
    setAnnualOutpatientVisits('');
    setAnnualEmergencyL13('');
    setAnnualEmergencyL45('');

    // Initialize default scores to 1
    const initScores: Record<string, number> = {};
    QUARTERLY_STANDARDS.forEach((std) => {
      initScores[std.code] = 1;
    });
    setScores(initScores);

    setSafetyOfficerAndPresident('');
    setInternalManager('هاشم دیلمی کیا');
    setMetron('زینب چرغان');
    setQualityManager('فاطمه فرحی');
    setSafetyCoordinator('مهلا عریضی');

    setIsFormOpen(true);
  };

  const handleEditAssessment = (item: QuarterlySelfAssessment) => {
    setEditingId(item.id);
    setSavedSuccess(false);
    setSavedAssessment(null);
    setHospitalName(item.hospitalName || 'امام رضا (ع)');
    setYear(item.year || getCurrentJalaliYear());
    setSeason(item.season || 'بهار');
    setApprovedBeds(item.approvedBeds || '');
    setActiveBeds(item.activeBeds || '');
    setBedOccupancyRate(item.bedOccupancyRate || '');
    setAvgDailyInpatients(item.avgDailyInpatients || '');
    setAnnualOutpatientVisits(item.annualOutpatientVisits || '');
    setAnnualEmergencyL13(item.annualEmergencyL13 || '');
    setAnnualEmergencyL45(item.annualEmergencyL45 || '');

    setScores(item.scores || {});

    const ev = item.evaluatorNames || {};
    setSafetyOfficerAndPresident(ev.safetyOfficerAndPresident || '');
    setInternalManager(ev.internalManager || 'هاشم دیلمی کیا');
    setMetron(ev.metron || 'زینب چرغان');
    setQualityManager(ev.qualityManager || 'فاطمه فرحی');
    setSafetyCoordinator(ev.safetyCoordinator || 'مهلا عریضی');

    setIsFormOpen(true);
  };

  const handleDeleteAssessment = async (id: string) => {
    if (window.confirm('آیا از حذف این خودارزیابی فصلی اطمینان دارید؟')) {
      await DataAccessLayer.deleteQuarterlySelfAssessment(id);
      loadAssessments();
    }
  };

  const handleScoreChange = (code: string, val: number) => {
    setScores((prev) => ({ ...prev, [code]: val }));
  };

  const handleSetAllScores = (val: number) => {
    const updated: Record<string, number> = {};
    QUARTERLY_STANDARDS.forEach((std) => {
      updated[std.code] = val;
    });
    setScores(updated);
  };

  // Calculate Total Score & Percentage
  const totalScore = QUARTERLY_STANDARDS.reduce((acc, std) => acc + (scores[std.code] ?? 0), 0);
  const maxScore = QUARTERLY_STANDARDS.length; // 25
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = `خودارزیابی فصلی ایمنی بیمار - ${season} ${toPersianDigits(year)}`;

    const assessmentData: Partial<QuarterlySelfAssessment> & { id?: string } = {
      ...(editingId ? { id: editingId } : {}),
      title,
      year,
      season,
      hospitalName,
      approvedBeds,
      activeBeds,
      bedOccupancyRate,
      avgDailyInpatients,
      annualOutpatientVisits,
      annualEmergencyL13,
      annualEmergencyL45,
      scores,
      totalScore,
      maxScore,
      percentage,
      evaluationTeam: 'تیم بهبود کیفیت و ایمنی بیمار',
      evaluatorNames: {
        safetyOfficerAndPresident,
        internalManager,
        metron,
        qualityManager,
        safetyCoordinator,
      },
    };

    const saved = await DataAccessLayer.saveQuarterlySelfAssessment(assessmentData);

    setSavedAssessment(saved);
    setSavedSuccess(true);

    loadAssessments();
  };

  // Group standards by domain for the form
  const domains = Array.from(new Set(QUARTERLY_STANDARDS.map((s) => s.domainCode))).map((code) => {
    const std = QUARTERLY_STANDARDS.find((s) => s.domainCode === code)!;
    return {
      code,
      name: std.domainName,
      standards: QUARTERLY_STANDARDS.filter((s) => s.domainCode === code),
    };
  });

  // Analytics Computations
  const seasonsOrder = ['بهار', 'تابستان', 'پاییز', 'زمستان'];
  const filteredYearAssessments = assessments.filter((a) => a.year === selectedAnalyticsYear);

  // Build 4-seasons chart data
  const chartData = seasonsOrder.map((sName) => {
    const match = filteredYearAssessments.find((a) => a.season === sName);
    return {
      season: sName,
      score: match ? match.totalScore : 0,
      percentage: match ? match.percentage : 0,
      hasData: !!match,
    };
  });

  // KPI Calculations
  const assessedSeasonsCount = chartData.filter((d) => d.hasData).length;
  const totalYearScoreSum = chartData.reduce((acc, curr) => acc + curr.score, 0);
  const avgYearScore = assessedSeasonsCount > 0 ? totalYearScoreSum / assessedSeasonsCount : 0;
  const avgYearPercentage = assessedSeasonsCount > 0 ? (avgYearScore / 25) * 100 : 0;

  // Best & Weakest Season
  const activeSeasonData = chartData.filter((d) => d.hasData);
  const bestSeasonObj = activeSeasonData.length > 0 ? [...activeSeasonData].sort((a, b) => b.score - a.score)[0] : null;

  // Quarter over Quarter Trend
  let qoqTrendText = '---';
  let qoqDiff = 0;
  if (activeSeasonData.length >= 2) {
    const lastTwo = activeSeasonData.slice(-2);
    qoqDiff = lastTwo[1].percentage - lastTwo[0].percentage;
    qoqTrendText = `${qoqDiff >= 0 ? '+' : ''}${toPersianDigits(qoqDiff.toFixed(1))}%`;
  }

  // Domain Breakdown Calculations
  const domainBreakdown = domains.map((dom) => {
    let totalObtained = 0;
    let totalPossible = 0;

    filteredYearAssessments.forEach((ast) => {
      dom.standards.forEach((std) => {
        totalObtained += ast.scores[std.code] ?? 0;
        totalPossible += 1;
      });
    });

    const domPercentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
    return {
      code: dom.code,
      name: dom.name,
      obtained: totalObtained,
      possible: totalPossible,
      percentage: domPercentage,
    };
  });

  // Weak/Deficient Standards Across Year
  const weakStandardsMap: Record<string, { std: typeof QUARTERLY_STANDARDS[0]; lowScoreCount: number }> = {};

  filteredYearAssessments.forEach((ast) => {
    QUARTERLY_STANDARDS.forEach((std) => {
      const sc = ast.scores[std.code] ?? 0;
      if (sc < 1) {
        if (!weakStandardsMap[std.code]) {
          weakStandardsMap[std.code] = { std, lowScoreCount: 0 };
        }
        weakStandardsMap[std.code].lowScoreCount += 1;
      }
    });
  });

  const weakStandardsList = Object.values(weakStandardsMap).sort((a, b) => b.lowScoreCount - a.lowScoreCount);

  // Available Years for filter
  const availableYears: number[] = Array.from(new Set(assessments.map((a) => Number(a.year) || getCurrentJalaliYear())));
  if (!availableYears.includes(getCurrentJalaliYear())) {
    availableYears.push(getCurrentJalaliYear());
  }
  availableYears.sort((a: number, b: number) => b - a);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 via-blue-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 shadow-xl text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/40 text-cyan-300">
            <FileCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">خودارزیابی فصلی ایمنی بیمار</h3>
            <p className="text-xs text-cyan-200/80 font-bold mt-1">
              ثبت ارزیابی دوره‌ای ۲۵ استاندارد الزامی، تحلیل روند ۴ فصل و دانلود اختیاری فایل رسمی Word
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isFormOpen && (
            <button
              onClick={handleOpenNewForm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>ثبت خودارزیابی جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs (Only when form is closed) */}
      {!isFormOpen && (
        <div className="flex items-center gap-3 border-b border-indigo-200/60 pb-3">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-indigo-900 to-blue-900 text-white shadow-md'
                : 'bg-white text-indigo-900 hover:bg-indigo-50 border border-indigo-100'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>فهرست خودارزیابی‌ها ({toPersianDigits(assessments.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-indigo-900 to-blue-900 text-white shadow-md'
                : 'bg-white text-indigo-900 hover:bg-indigo-50 border border-indigo-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>نمودار و تحلیل ۴ فصل سال</span>
          </button>
        </div>
      )}

      {/* ================= LIST OF ASSESSMENTS ================= */}
      {!isFormOpen && activeTab === 'list' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-indigo-950 font-bold text-sm">در حال بارگذاری اطلاعات خودارزیابی...</div>
          ) : assessments.length === 0 ? (
            <div className="p-10 text-center bg-white/80 backdrop-blur rounded-3xl border border-indigo-100 shadow-md space-y-3">
              <Award className="w-12 h-12 text-indigo-400 mx-auto" />
              <p className="text-indigo-950 font-black text-base">هنوز هیچ فرم خودارزیابی فصلی ثبت نشده است.</p>
              <p className="text-xs text-indigo-700 font-bold">
                جهت تکمیل اولین چک‌لیست خودارزیابی فصلی بر روی دکمه «ثبت خودارزیابی جدید» کلیک کنید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 shadow-xl space-y-4 text-white hover:border-cyan-400/60 transition"
                >
                  <div className="flex items-center justify-between border-b border-cyan-400/20 pb-3">
                    <div>
                      <h4 className="text-base font-black text-white">{item.title}</h4>
                      <span className="text-xs text-cyan-300 font-bold">بیمارستان: {item.hospitalName}</span>
                    </div>
                    <span className="text-xs text-cyan-100 bg-cyan-950 px-3 py-1 rounded-xl border border-cyan-400/20 font-bold">
                      تاریخ ثبت: {toPersianDigits(item.createdAt)}
                    </span>
                  </div>

                  {/* Summary Metric */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#06182e] p-3 rounded-2xl border border-cyan-500/20 text-xs">
                    <div>
                      <span className="text-cyan-300 block text-[11px] font-bold">امتیاز کل:</span>
                      <span className="text-sm font-black text-white">
                        {toPersianDigits(item.totalScore)} از {toPersianDigits(item.maxScore)}
                      </span>
                    </div>
                    <div>
                      <span className="text-cyan-300 block text-[11px] font-bold">درصد موفقیت:</span>
                      <span
                        className={`text-sm font-black ${
                          item.percentage >= 85
                            ? 'text-emerald-400'
                            : item.percentage >= 70
                            ? 'text-amber-300'
                            : 'text-rose-400'
                        }`}
                      >
                        %{toPersianDigits(item.percentage.toFixed(1))}
                      </span>
                    </div>
                    <div>
                      <span className="text-cyan-300 block text-[11px] font-bold">تخت‌های فعال:</span>
                      <span className="text-sm font-bold text-slate-200">
                        {toPersianDigits(item.activeBeds || '---')}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-cyan-400/20">
                    <button
                      onClick={() => downloadQuarterlySelfAssessmentDocx(item)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-xs font-bold hover:bg-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>دانلود فایل Word</span>
                    </button>
                    <button
                      onClick={() => handleEditAssessment(item)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold hover:bg-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAssessment(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold hover:bg-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= ANALYTICS & QUARTERLY CHART DASHBOARD ================= */}
      {!isFormOpen && activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">داشبورد مقایسه‌ای خودارزیابی ۴ فصل سال</h4>
                <p className="text-xs text-cyan-200/80 font-bold mt-0.5">
                  تحلیل روند نمرات ایمنی بیمار، درصد موفقیت فصل به فصل و تفکیک ۵ حیطه استانداردهای الزامی
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#06182e] p-2 rounded-2xl border border-cyan-500/30">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-200">انتخاب سال:</span>
              <select
                value={selectedAnalyticsYear}
                onChange={(e) => setSelectedAnalyticsYear(Number(e.target.value))}
                className="bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs font-black focus:ring-2 focus:ring-cyan-400 cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    سال {toPersianDigits(yr)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0c2a4a] border border-cyan-400/30 p-5 rounded-3xl shadow-lg space-y-2 text-white">
              <span className="text-xs text-cyan-300 font-bold block">میانگین امتیاز سال {toPersianDigits(selectedAnalyticsYear)}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{toPersianDigits(avgYearScore.toFixed(1))}</span>
                <span className="text-xs text-cyan-200">از ۲۵</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 block">
                میانگین رعایت: %{toPersianDigits(avgYearPercentage.toFixed(1))}
              </span>
            </div>

            <div className="bg-[#0c2a4a] border border-cyan-400/30 p-5 rounded-3xl shadow-lg space-y-2 text-white">
              <span className="text-xs text-cyan-300 font-bold block">بهترین عملکرد فصلی</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-amber-300">
                  {bestSeasonObj ? bestSeasonObj.season : '---'}
                </span>
                {bestSeasonObj && (
                  <span className="text-xs text-cyan-200">
                    (%{toPersianDigits(bestSeasonObj.percentage.toFixed(1))})
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-cyan-300 block">
                {bestSeasonObj ? `${toPersianDigits(bestSeasonObj.score)} امتیاز کسب‌شده` : 'اطلاعاتی ثبت نشده'}
              </span>
            </div>

            <div className="bg-[#0c2a4a] border border-cyan-400/30 p-5 rounded-3xl shadow-lg space-y-2 text-white">
              <span className="text-xs text-cyan-300 font-bold block">تغییرات نسبت به فصل قبل (QoQ)</span>
              <div className="flex items-center gap-2">
                {qoqDiff >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-rose-400" />
                )}
                <span className={`text-xl font-black ${qoqDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {qoqTrendText}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-300 block">
                {activeSeasonData.length >= 2 ? 'مقایسه دو فصل اخیر' : 'نیازمند حداقل ۲ فصل ثبت‌شده'}
              </span>
            </div>

            <div className="bg-[#0c2a4a] border border-cyan-400/30 p-5 rounded-3xl shadow-lg space-y-2 text-white">
              <span className="text-xs text-cyan-300 font-bold block">فصل‌های ارزیابی‌شده</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{toPersianDigits(assessedSeasonsCount)}</span>
                <span className="text-xs text-cyan-200">از ۴ فصل</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-300 block">
                {assessedSeasonsCount === 4 ? 'تکمیل کامل ۴ فصل سال' : `باقیمانده: ${toPersianDigits(4 - assessedSeasonsCount)} فصل`}
              </span>
            </div>
          </div>

          {/* Season Trend Composed Chart */}
          <div className="bg-[#0c2a4a] border border-cyan-400/30 p-6 rounded-3xl shadow-xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-cyan-400/20 pb-3">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span>نمودار مقایسه‌ای امتیاز و درصد موفقیت در ۴ فصل (بهار، تابستان، پاییز، زمستان)</span>
              </h4>
              <span className="text-xs text-cyan-200 font-bold bg-cyan-950 px-3 py-1 rounded-xl border border-cyan-400/20">
                سال {toPersianDigits(selectedAnalyticsYear)}
              </span>
            </div>

            <div className="h-72 w-full pt-4 dir-ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                  <XAxis dataKey="season" stroke="#a5f3fc" tick={{ fill: '#a5f3fc', fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis yAxisId="left" domain={[0, 25]} stroke="#38bdf8" tick={{ fill: '#38bdf8', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#34d399" tick={{ fill: '#34d399', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#06182e', borderColor: '#38bdf8', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any, name: any) => {
                      const numVal = Number(value) || 0;
                      if (String(name) === 'امتیاز کل') return [`${toPersianDigits(numVal)} از ۲۵`, name];
                      if (String(name) === 'درصد موفقیت') return [`%${toPersianDigits(numVal.toFixed(1))}`, name];
                      return [String(value), String(name)];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="score" name="امتیاز کل" fill="#0284c7" radius={[8, 8, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.hasData ? '#0284c7' : '#334155'} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="percentage" name="درصد موفقیت" stroke="#34d399" strokeWidth={3} dot={{ r: 6, fill: '#34d399' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Domain Breakdown Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0c2a4a] border border-cyan-400/30 p-6 rounded-3xl shadow-xl space-y-4 text-white">
              <h4 className="text-base font-black text-white flex items-center gap-2 border-b border-cyan-400/20 pb-3">
                <PieChartIcon className="w-5 h-5 text-amber-400" />
                <span>تحلیل شاخص رعایت به تفکیک ۵ حیطه ایمنی بیمار</span>
              </h4>

              <div className="space-y-3.5">
                {domainBreakdown.map((dom) => (
                  <div key={dom.code} className="bg-[#06182e] p-3.5 rounded-2xl border border-cyan-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-100 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-black border border-amber-400/30">
                          {dom.code}
                        </span>
                        <span>{dom.name}</span>
                      </span>
                      <span className="text-cyan-300 font-black">
                        %{toPersianDigits(dom.percentage.toFixed(1))}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          dom.percentage >= 85
                            ? 'bg-emerald-400'
                            : dom.percentage >= 70
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${Math.min(dom.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vulnerable/Deficient Standards list */}
            <div className="bg-[#0c2a4a] border border-cyan-400/30 p-6 rounded-3xl shadow-xl space-y-4 text-white">
              <h4 className="text-base font-black text-white flex items-center gap-2 border-b border-cyan-400/20 pb-3">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>استانداردهای دارای عدم انطباق یا رعایت نسبی (نیاز به مداخله)</span>
              </h4>

              {weakStandardsList.length === 0 ? (
                <div className="p-8 text-center bg-[#06182e] rounded-2xl border border-emerald-500/30 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-emerald-300 font-black text-sm">تمام ۲۵ استاندارد الزامی انطباق ۱۰۰٪ دارند!</p>
                  <p className="text-xs text-slate-300">هیچ کسر امتیازی در خودارزیابی‌های ثبت‌شده مشاهده نشد.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {weakStandardsList.map(({ std, lowScoreCount }) => (
                    <div
                      key={std.code}
                      className="p-3 bg-[#06182e] rounded-2xl border border-rose-500/30 text-xs flex items-start gap-3"
                    >
                      <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-black text-[11px] whitespace-nowrap border border-rose-400/30">
                        {std.code}
                      </span>
                      <div className="space-y-1 flex-1">
                        <p className="font-bold text-slate-100 leading-relaxed">{std.title}</p>
                        <span className="text-[11px] text-amber-300 font-bold block">
                          تعداد کسر امتیاز در سال: {toPersianDigits(lowScoreCount)} نوبت
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Executive AI Strategic Insights Card */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border-2 border-cyan-400/40 shadow-xl text-white space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 rounded-2xl text-cyan-300 border border-cyan-400/30">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-white">توصیه‌های مدیریتی و تحلیل عملکرد خودارزیابی ایمنی بیمار</h4>
            </div>

            <div className="text-xs text-slate-200 font-bold leading-relaxed space-y-2 bg-[#06182e]/80 p-4 rounded-2xl border border-cyan-500/20">
              <p>
                • <strong className="text-cyan-300">وضعیت کلی انطباق:</strong> بیمارستان با میانگین نمره{' '}
                <span className="text-emerald-400 font-black">{toPersianDigits(avgYearScore.toFixed(1))}</span> از ۲۵ (
                <span className="text-emerald-400 font-black">%{toPersianDigits(avgYearPercentage.toFixed(1))}</span>) در سطح{' '}
                {avgYearPercentage >= 85 ? (
                  <span className="text-emerald-400 font-black">عالی (سبز)</span>
                ) : avgYearPercentage >= 70 ? (
                  <span className="text-amber-300 font-black">قابل قبول و نیازمند ارتقاء (زرد)</span>
                ) : (
                  <span className="text-rose-400 font-black">نیازمند مداخله فوری (قرمز)</span>
                )}{' '}
                قرار دارد.
              </p>

              <p>
                • <strong className="text-cyan-300">ارزیابی حیطه حیاتی:</strong> بیشترین تمرکز اقدامات اصلاحی باید بر روی{' '}
                {domainBreakdown.length > 0 ? (
                  <span className="text-amber-300 font-black">
                    {domainBreakdown.sort((a, b) => a.percentage - b.percentage)[0].name}
                  </span>
                ) : (
                  'استانداردهای بالینی'
                )}{' '}
                متمرکز گردد تا ثبات ایمنی خدمات تضمین شود.
              </p>

              <p>
                • <strong className="text-cyan-300">اقدام بعدی:</strong> نتایج این تحلیل در جلسه بعدی کمیته ایمنی مطرح و مصوبات متناظر جهت رفع نقاط ضعف تعیین گردد.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= ASSESSMENT FORM ================= */}
      {isFormOpen && (
        <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-white">
          <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-cyan-400" />
              <span>{editingId ? 'ویرایش خودارزیابی فصلی ایمنی بیمار' : 'فرم جدید خودارزیابی فصلی ایمنی بیمار'}</span>
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-200 text-xs font-black transition cursor-pointer"
            >
              انصراف و بازگشت
            </button>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>ارزیابی با موفقیت ثبت گردید. شما می‌توانید در صورت تمایل فایل Word آن را دریافت کنید.</span>
              </div>
              {savedAssessment && (
                <button
                  onClick={() => downloadQuarterlySelfAssessmentDocx(savedAssessment)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل Word</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Hospital Specifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>۱. مشخصات کلی بیمارستان و دوره ارزیابی</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">نام بیمارستان</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">سال ارزیابی (شمسی)</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-black text-sm focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">فصل ارزیابی</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="بهار">بهار</option>
                    <option value="تابستان">تابستان</option>
                    <option value="پاییز">پاییز</option>
                    <option value="زمستان">زمستان</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">تعداد تخت مصوب</label>
                  <input
                    type="text"
                    placeholder="مثلاً: 120"
                    value={approvedBeds}
                    onChange={(e) => setApprovedBeds(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">تعداد تخت فعال</label>
                  <input
                    type="text"
                    placeholder="مثلاً: 95"
                    value={activeBeds}
                    onChange={(e) => setActiveBeds(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">ضریب اشغال تخت (%)</label>
                  <input
                    type="text"
                    placeholder="مثلاً: 78"
                    value={bedOccupancyRate}
                    onChange={(e) => setBedOccupancyRate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">متوسط بستری روزانه</label>
                  <input
                    type="text"
                    placeholder="مثلاً: 85"
                    value={avgDailyInpatients}
                    onChange={(e) => setAvgDailyInpatients(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">تعداد ویزیت سرپایی سالیانه درمانگاه</label>
                  <input
                    type="text"
                    placeholder="مثلاً: 45000"
                    value={annualOutpatientVisits}
                    onChange={(e) => setAnnualOutpatientVisits(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">متوسط پذیرش سالیانه اورژانس (سطح ۱-۳)</label>
                  <input
                    type="text"
                    placeholder="مثلاً: 12000"
                    value={annualEmergencyL13}
                    onChange={(e) => setAnnualEmergencyL13(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">پذیرش سالیانه اورژانس (سطح ۴-۵)</label>
                  <input
                    type="text"
                    placeholder="مثلاً: 28000"
                    value={annualEmergencyL45}
                    onChange={(e) => setAnnualEmergencyL45(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Score calculation summary stick header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border-2 border-cyan-400/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-300 border border-cyan-400/30">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-cyan-200 font-bold block">مجموع امتیاز و نمره خودارزیابی:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white">
                      {toPersianDigits(totalScore)} از {toPersianDigits(maxScore)}
                    </span>
                    <span
                      className={`text-sm font-black px-3 py-0.5 rounded-full ${
                        percentage >= 85
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : percentage >= 70
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      %{toPersianDigits(percentage.toFixed(1))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetAllScores(1)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  نمره کامل (۱) برای همه
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllScores(0.5)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
                >
                  نمره (۰٫۵) برای همه
                </button>
              </div>
            </div>

            {/* 2. Standards scoring table grouped by domain */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <ListFilter className="w-4 h-4" />
                <span>۲. چک‌لیست نمره‌دهی ۲۵ استاندارد الزامی (امتیاز ۰ ، ۰٫۵ یا ۱)</span>
              </h4>

              {domains.map((dom) => (
                <div key={dom.code} className="p-5 bg-[#06182e] rounded-3xl border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                    <h5 className="text-sm font-black text-amber-300 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xs font-black">
                        {dom.code}
                      </span>
                      <span>{dom.name}</span>
                    </h5>
                    <span className="text-xs text-cyan-200 font-bold">
                      {toPersianDigits(dom.standards.length)} استاندارد الزامی
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dom.standards.map((std) => {
                      const currentScore = scores[std.code] ?? 0;
                      return (
                        <div
                          key={std.code}
                          className="p-3.5 bg-[#09223e] rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-400/30 text-cyan-300 font-black rounded-lg text-[11px] whitespace-nowrap">
                              {std.code}
                            </span>
                            <p className="text-slate-100 font-bold leading-relaxed">{std.title}</p>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center bg-[#030e1d] p-1 rounded-xl border border-slate-700">
                            {[
                              { label: 'کامل (۱)', val: 1, activeBg: 'bg-emerald-600 text-white' },
                              { label: 'نسبی (۰٫۵)', val: 0.5, activeBg: 'bg-amber-600 text-white' },
                              { label: 'عدم انطباق (۰)', val: 0, activeBg: 'bg-rose-600 text-white' },
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => handleScoreChange(std.code, opt.val)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                                  currentScore === opt.val ? opt.activeBg : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Signatories */}
            <div className="space-y-4 pt-4 border-t border-cyan-400/20">
              <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>۳. اعضای تیم ارزیابی و امضا کنندگان</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-cyan-100 mb-1">مسئول ایمنی بیمار و ریاست بیمارستان</label>
                  <input
                    type="text"
                    placeholder="نام و نام خانوادگی"
                    value={safetyOfficerAndPresident}
                    onChange={(e) => setSafetyOfficerAndPresident(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-cyan-100 mb-1">مدیر داخلی بیمارستان</label>
                  <input
                    type="text"
                    placeholder="هاشم دیلمی کیا"
                    value={internalManager}
                    onChange={(e) => setInternalManager(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-cyan-100 mb-1">مترون بیمارستان</label>
                  <input
                    type="text"
                    placeholder="زینب چرغان"
                    value={metron}
                    onChange={(e) => setMetron(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-cyan-100 mb-1">مسئول بهبود کیفیت</label>
                  <input
                    type="text"
                    placeholder="فاطمه فرحی"
                    value={qualityManager}
                    onChange={(e) => setQualityManager(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-cyan-100 mb-1">کارشناس هماهنگ‌کننده ایمنی بیمار</label>
                  <input
                    type="text"
                    placeholder="مهلا عریضی"
                    value={safetyCoordinator}
                    onChange={(e) => setSafetyCoordinator(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="pt-6 border-t border-cyan-400/20 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-cyan-100 font-bold text-xs transition cursor-pointer"
              >
                انصراف و بازگشت
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 transition cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>ذخیره فرم خودارزیابی فصلی</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
