import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Activity,
  FileSpreadsheet,
  Calendar,
  Building2,
  TrendingUp,
  Search,
  CheckCircle2,
  Filter,
  Layers,
  BarChart3,
  Printer,
  Edit,
  Plus,
  Save,
  Trash2,
  Settings2,
  Award,
  GraduationCap,
  UserCheck,
  Eye,
  ClipboardCheck,
  Users,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Department,
  SafetyIndicatorDefinition,
  SafetyIndicatorRecord,
  StaffMember,
  StaffEvaluation,
  QuizSubmission,
} from '../types';
import { DataAccessLayer, subscribeToDALChanges } from '../services/dal';
import { JALALI_MONTHS, toPersianDigits, getCurrentJalaliYear, getCurrentJalaliMonth } from '../utils/jalali';
import { exportToExcel } from '../utils/exportUtils';
import { CLINICAL_INDICATORS_MATRIX, CLINICAL_DEPARTMENTS, ClinicalIndicatorItem } from '../data/indicators';
import { StaffPersonnelReportCardModal } from './StaffPersonnelReportCardModal';

interface SafetyIndicatorsAdminProps {
  onBack: () => void;
}

export const SafetyIndicatorsAdmin: React.FC<SafetyIndicatorsAdminProps> = ({ onBack }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'monitoring' | 'customize' | 'report_cards'>('monitoring');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [indicatorDefs, setIndicatorDefs] = useState<SafetyIndicatorDefinition[]>([]);
  const [records, setRecords] = useState<SafetyIndicatorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Personnel Report Card State
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<StaffEvaluation[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<QuizSubmission[]>([]);
  const [selectedCardDept, setSelectedCardDept] = useState<string>('all');
  const [staffSearchTerm, setStaffSearchTerm] = useState<string>('');
  const [reportCardStaff, setReportCardStaff] = useState<StaffMember | null>(null);
  const [currentPageStaff, setCurrentPageStaff] = useState<number>(1);
  const STAFF_PER_PAGE = 15;

  // Indicators customization state
  const [customIndicators, setCustomIndicators] = useState<ClinicalIndicatorItem[]>(CLINICAL_INDICATORS_MATRIX);
  const [editingItem, setEditingItem] = useState<ClinicalIndicatorItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<ClinicalIndicatorItem>({
    id: `ind-${Date.now()}`,
    title: '',
    unit: 'مورد',
    category: 'عمومی و اختصاصی بخش',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی', 'اتاق عمل'],
    description: '',
    targetValue: 0,
  });

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = all months
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentJalaliYear());
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDALChanges(() => {
      loadData(true);
    });
    return () => unsubscribe();
  }, []);

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const depts = await DataAccessLayer.getDepartments();
    const defs = await DataAccessLayer.getIndicatorDefinitions();
    const recs = await DataAccessLayer.getIndicatorRecords();
    const staff = await DataAccessLayer.getStaffMembers();
    const evals = await DataAccessLayer.getEvaluations();
    const subs = await DataAccessLayer.getQuizSubmissions();
    
    setDepartments(depts);
    setIndicatorDefs(defs);
    setRecords(recs);
    setStaffList(staff);
    setAllEvaluations(evals);
    setAllSubmissions(subs);
    setLoading(false);
  };

  // Categories list
  const categories = Array.from(
    new Set([
      ...CLINICAL_INDICATORS_MATRIX.map((c) => c.category),
      ...indicatorDefs.map((d) => (d as any).category).filter(Boolean),
    ])
  );

  // Departments list combined (system departments + clinical standard depts)
  const deptList = Array.from(
    new Set([
      ...departments.map((d) => d.name),
      ...CLINICAL_DEPARTMENTS.map((d) => `بخش ${d}`),
      ...records.map((r) => r.departmentName),
    ])
  );

  // Filtered Records
  const filteredRecords = records.filter((r) => {
    // Dept match
    let matchDept = true;
    if (selectedDept !== 'all') {
      matchDept =
        r.departmentId === selectedDept ||
        r.departmentName === selectedDept ||
        r.departmentName.includes(selectedDept) ||
        selectedDept.includes(r.departmentName);
    }

    // Category match
    let matchCat = true;
    if (selectedCategory !== 'all') {
      const indInfo = CLINICAL_INDICATORS_MATRIX.find(
        (c) => c.id === r.indicatorId || c.title === r.indicatorTitle
      );
      if (indInfo) {
        matchCat = indInfo.category === selectedCategory;
      }
    }

    // Month & Year match
    const matchMonth = selectedMonth === 0 || r.month === selectedMonth;
    const matchYear = r.year === selectedYear;

    // Search match
    let matchSearch = true;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      matchSearch =
        r.indicatorTitle.toLowerCase().includes(q) ||
        r.departmentName.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q));
    }

    return matchDept && matchCat && matchMonth && matchYear && matchSearch;
  });

  // KPI Calculations
  const totalSubmissions = filteredRecords.length;
  const activeDepartmentsCount = new Set(filteredRecords.map((r) => r.departmentName)).size;
  const monitoredIndicatorsCount = new Set(filteredRecords.map((r) => r.indicatorTitle)).size;
  const overallSum = filteredRecords.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const overallAvg = totalSubmissions > 0 ? (overallSum / totalSubmissions).toFixed(1) : '0';

  // Chart Data preparation (grouping by indicator or category)
  const indicatorGroups: string[] = Array.from(
    new Set(filteredRecords.map((r) => r.indicatorTitle))
  );

  const chartData = indicatorGroups.slice(0, 15).map((title) => {
    const itemRecords = filteredRecords.filter((r) => r.indicatorTitle === title);
    const sumVal = itemRecords.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
    const avgVal = itemRecords.length > 0 ? Number((sumVal / itemRecords.length).toFixed(1)) : 0;
    const unit = itemRecords[0]?.indicatorTitle ? (CLINICAL_INDICATORS_MATRIX.find(c => c.title === title)?.unit || 'مورد') : 'مورد';
    
    return {
      name: title.length > 22 ? title.substring(0, 22) + '...' : title,
      fullTitle: title,
      value: avgVal,
      count: itemRecords.length,
      unit,
    };
  });

  const handleExportExcel = () => {
    const exportData = filteredRecords.map((r) => ({
      'نام بخش': r.departmentName,
      'عنوان شاخص': r.indicatorTitle,
      'مقدار ثبت شده': r.value,
      'واحد': CLINICAL_INDICATORS_MATRIX.find((c) => c.id === r.indicatorId || c.title === r.indicatorTitle)?.unit || 'مورد',
      'ماه (شمسی)': r.monthName,
      'سال': r.year,
      'توضیحات/اقدام اصلاحی': r.notes || '---',
      'تاریخ ثبت': r.createdAt,
    }));
    exportToExcel(exportData, `شاخص_های_ایمنی_بیمارستان_${selectedYear}_${selectedMonth || 'کامل'}`, 'شاخص‌های_بیمارستان');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-indigo-200/60 gap-4" dir="rtl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-slate-950" />
            <span>بازگشت</span>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-indigo-950 flex items-center gap-2">
              <Activity className="w-7 h-7 text-cyan-600" />
              شاخص‌های ایمنی بیمار بیمارستان (پنل نظارت مدیریت)
            </h2>
            <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
              تجمیع، پایش و تحلیل خودکار داده‌ها و آمار شاخص‌های ایمنی ثبت‌شده توسط مسئولین بخش‌ها
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-2 rounded-2xl border-2 border-indigo-200 shadow-lg">
        <button
          onClick={() => setActiveAdminTab('monitoring')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
            activeAdminTab === 'monitoring'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>پایش و گزارش‌های دریافتی از بخش‌ها</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('customize')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
            activeAdminTab === 'customize'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Settings2 className="w-4 h-4 text-amber-400" />
          <span>مدیریت و ویرایش سوالات / عناوین شاخص‌های بخش‌ها</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('report_cards')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
            activeAdminTab === 'report_cards'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>کارنامه پرسنلی پرسنل به تفکیک بخش‌ها</span>
        </button>
      </div>

      {activeAdminTab === 'report_cards' ? (
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
            <div>
              <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-600" />
                کارنامه عملکرد و سنجش دانش پرسنل بخش‌ها
              </h3>
              <p className="text-xs text-slate-700 font-bold mt-1">
                مشاهده نمرات آزمون‌ها، ارزیابی چک‌لیست‌های ایمنی و دریافت کارنامه جامع پرسنل بیمارستان
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">انتخاب بخش:</label>
              <select
                value={selectedCardDept}
                onChange={(e) => {
                  setSelectedCardDept(e.target.value);
                  setCurrentPageStaff(1);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">تمام بخش‌های بیمارستان</option>
                {CLINICAL_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    بخش {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">جستجوی پرسنل:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجوی نام یا کد پرسنلی..."
                  value={staffSearchTerm}
                  onChange={(e) => {
                    setStaffSearchTerm(e.target.value);
                    setCurrentPageStaff(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Staff Grid / Table */}
          {(() => {
            const filteredStaff = staffList.filter((s) => {
              const matchDept =
                selectedCardDept === 'all' ||
                s.departmentName === selectedCardDept ||
                s.departmentName.includes(selectedCardDept) ||
                selectedCardDept.includes(s.departmentName);
              const matchSearch =
                !staffSearchTerm.trim() ||
                s.fullName.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
                (s.personnelCode && s.personnelCode.includes(staffSearchTerm));
              return matchDept && matchSearch;
            });

            const totalStaffPages = Math.ceil(filteredStaff.length / STAFF_PER_PAGE);
            const paginatedStaff = filteredStaff.slice(
              (currentPageStaff - 1) * STAFF_PER_PAGE,
              currentPageStaff * STAFF_PER_PAGE
            );

            if (filteredStaff.length === 0) {
              return (
                <div className="py-12 text-center text-slate-500 font-bold text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  هیچ پرسنلی مطابق با فیلتر انتخابی یافت نشد.
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedStaff.map((staff) => {
                    const staffEvals = allEvaluations.filter((ev) => ev.staffId === staff.id);
                    const staffSubs = allSubmissions.filter((sub) => sub.staffId === staff.id);

                    const avgEval =
                      staffEvals.length > 0
                        ? Math.round(
                            staffEvals.reduce((a, c) => a + (c.scorePercentage || 0), 0) / staffEvals.length
                          )
                        : null;

                    const avgQuiz =
                      staffSubs.length > 0
                        ? Math.round(
                            staffSubs.reduce((a, c) => a + (c.scorePercentage || 0), 0) / staffSubs.length
                          )
                        : null;

                    return (
                      <div
                        key={staff.id}
                        className="bg-white border-2 border-slate-200 hover:border-indigo-400 p-4 rounded-2xl shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-100">
                            <span className="font-black text-sm text-slate-900">{staff.fullName}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-black">
                              بخش {staff.departmentName}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 font-bold space-y-1">
                            <div>کد پرسنلی: {toPersianDigits(staff.personnelCode || '---')}</div>
                            <div>سمت/نقش: {staff.role || 'کادر درمان'}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-extrabold text-center">
                            <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-emerald-900">
                              <div>میانگین چک‌لیست</div>
                              <div className="text-sm font-black text-emerald-700 mt-0.5">
                                {avgEval !== null ? `%${toPersianDigits(avgEval)}` : 'ثبت‌نشده'}
                              </div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 p-2 rounded-xl text-purple-900">
                              <div>میانگین آزمون‌ها</div>
                              <div className="text-sm font-black text-purple-700 mt-0.5">
                                {avgQuiz !== null ? `%${toPersianDigits(avgQuiz)}` : 'ثبت‌نشده'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setReportCardStaff(staff)}
                          className="w-full py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-4 h-4 text-amber-300" />
                          <span>مشاهده و چاپ کارنامه جامع</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalStaffPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 bg-slate-50 p-3 rounded-2xl">
                    <span className="text-xs font-bold text-slate-700">
                      صفحه {toPersianDigits(currentPageStaff)} از {toPersianDigits(totalStaffPages)} (مجموع {toPersianDigits(filteredStaff.length)} پرسنل)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPageStaff((p) => Math.max(p - 1, 1))}
                        disabled={currentPageStaff === 1}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 disabled:opacity-40"
                      >
                        قبلی
                      </button>
                      <button
                        onClick={() => setCurrentPageStaff((p) => Math.min(p + 1, totalStaffPages))}
                        disabled={currentPageStaff === totalStaffPages}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 disabled:opacity-40"
                      >
                        بعدی
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Modal for Personnel Report Card */}
          {reportCardStaff && (
            <StaffPersonnelReportCardModal
              staff={reportCardStaff}
              evaluations={allEvaluations.filter((ev) => ev.staffId === reportCardStaff.id)}
              submissions={allSubmissions.filter((sub) => sub.staffId === reportCardStaff.id)}
              onClose={() => setReportCardStaff(null)}
            />
          )}
        </div>
      ) : activeAdminTab === 'customize' ? (
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
            <div>
              <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-amber-500" />
                تعریف و ویرایش شاخص‌های ایمنی بیمار برای بخش‌ها
              </h3>
              <p className="text-xs text-slate-700 font-bold mt-1">
                شما می‌توانید عناوین شاخص‌ها، واحدهای سنجش، حد مجاز و بخش‌های مرتبط را ویرایش یا اضافه نمایید.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingNew(true);
                setEditingItem(null);
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن شاخص جدید</span>
            </button>
          </div>

          {/* Add / Edit Form Modal or Inline */}
          {(isAddingNew || editingItem) && (
            <div className="p-5 bg-indigo-50/90 rounded-2xl border-2 border-indigo-200 space-y-4">
              <h4 className="text-sm font-black text-indigo-950">
                {isAddingNew ? 'افزودن شاخص جدید' : `ویرایش شاخص: ${editingItem?.title}`}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div className="space-y-1">
                  <label className="text-slate-800">عنوان شاخص:</label>
                  <input
                    type="text"
                    value={isAddingNew ? newItem.title : editingItem?.title || ''}
                    onChange={(e) =>
                      isAddingNew
                        ? setNewItem({ ...newItem, title: e.target.value })
                        : setEditingItem({ ...editingItem!, title: e.target.value })
                    }
                    placeholder="مثلاً: تعداد موارد اشتباه دارویی..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800">واحد سنجش:</label>
                  <input
                    type="text"
                    value={isAddingNew ? newItem.unit : editingItem?.unit || ''}
                    onChange={(e) =>
                      isAddingNew
                        ? setNewItem({ ...newItem, unit: e.target.value })
                        : setEditingItem({ ...editingItem!, unit: e.target.value })
                    }
                    placeholder="مورد / درصد / نفر..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800">دسته‌بندی شاخص:</label>
                  <input
                    type="text"
                    value={isAddingNew ? newItem.category : editingItem?.category || ''}
                    onChange={(e) =>
                      isAddingNew
                        ? setNewItem({ ...newItem, category: e.target.value })
                        : setEditingItem({ ...editingItem!, category: e.target.value })
                    }
                    placeholder="دارویی / سقوط / عفونت / عمومی..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800">مقدار تارگت / استاندارد:</label>
                  <input
                    type="number"
                    value={isAddingNew ? newItem.targetValue : editingItem?.targetValue || 0}
                    onChange={(e) =>
                      isAddingNew
                        ? setNewItem({ ...newItem, targetValue: Number(e.target.value) })
                        : setEditingItem({ ...editingItem!, targetValue: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs font-bold">
                <label className="text-slate-800">شرح و نحوه محاسبه شاخص:</label>
                <textarea
                  rows={2}
                  value={isAddingNew ? newItem.description : editingItem?.description || ''}
                  onChange={(e) =>
                    isAddingNew
                      ? setNewItem({ ...newItem, description: e.target.value })
                      : setEditingItem({ ...editingItem!, description: e.target.value })
                  }
                  placeholder="توضیحات کوتاه یا فرمول محاسبه شاخص..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              {/* Excluded Departments Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-black text-rose-800 block">
                  استثنائات بخش‌ها (انتخاب بخش‌هایی که این شاخص نباید برای آن‌ها نمایش داده شود و جزء شاخص‌های آن بخش نیست):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-44 overflow-y-auto custom-scrollbar">
                  {CLINICAL_DEPARTMENTS.map((deptName) => {
                    const currentExcluded = isAddingNew ? newItem.excludedDepts || [] : editingItem?.excludedDepts || [];
                    const isChecked = currentExcluded.includes(deptName);

                    return (
                      <label
                        key={deptName}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border cursor-pointer transition text-xs font-bold ${
                          isChecked
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-black'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...currentExcluded, deptName]
                              : currentExcluded.filter((d) => d !== deptName);
                            if (isAddingNew) {
                              setNewItem({ ...newItem, excludedDepts: updated });
                            } else if (editingItem) {
                              setEditingItem({ ...editingItem, excludedDepts: updated });
                            }
                          }}
                          className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                        <span>بخش {deptName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-black hover:bg-slate-300 transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const itemToSave = isAddingNew ? newItem : editingItem;
                    if (!itemToSave || !itemToSave.title.trim()) {
                      alert('عنوان شاخص الزامی است.');
                      return;
                    }
                    await DataAccessLayer.saveIndicatorDefinition({
                      id: itemToSave.id,
                      title: itemToSave.title,
                      unit: itemToSave.unit,
                      targetValue: itemToSave.targetValue || 0,
                      description: itemToSave.description,
                      category: itemToSave.category,
                      excludedDepts: itemToSave.excludedDepts || [],
                    });
                    if (isAddingNew) {
                      setCustomIndicators((prev) => [...prev, newItem]);
                    } else if (editingItem) {
                      setCustomIndicators((prev) =>
                        prev.map((i) => (i.id === editingItem.id ? editingItem : i))
                      );
                    }
                    setIsAddingNew(false);
                    setEditingItem(null);
                    alert('شاخص با موفقیت ثبت و استثنائات بخش‌ها ذخیره گردید.');
                  }}
                  className="px-6 py-2 rounded-xl bg-indigo-900 text-white text-xs font-black hover:bg-indigo-950 transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره تغییرات و استثنائات</span>
                </button>
              </div>
            </div>
          )}

          {/* Indicators List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-indigo-950 text-white font-black">
                  <th className="p-3">عنوان شاخص</th>
                  <th className="p-3">دسته‌بندی</th>
                  <th className="p-3 text-center">واحد</th>
                  <th className="p-3 text-center">هدف (Target)</th>
                  <th className="p-3">شرح</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-extrabold text-slate-800">
                {customIndicators.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-black text-indigo-950">{item.title}</td>
                    <td className="p-3 text-slate-700">{item.category}</td>
                    <td className="p-3 text-center">{item.unit}</td>
                    <td className="p-3 text-center text-emerald-700">{toPersianDigits(item.targetValue ?? 0)}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{item.description || '---'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsAddingNew(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xs hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-5 shadow-xl text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-cyan-200/80">کل گزارش‌های ثبت‌شده</p>
            <p className="text-2xl font-black text-cyan-300 mt-1">{toPersianDigits(totalSubmissions)} <span className="text-xs font-normal text-cyan-100">مورد</span></p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-5 shadow-xl text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-cyan-200/80">بخش‌های پاسخ‌دهنده</p>
            <p className="text-2xl font-black text-emerald-300 mt-1">{toPersianDigits(activeDepartmentsCount)} <span className="text-xs font-normal text-cyan-100">بخش</span></p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-5 shadow-xl text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-cyan-200/80">شاخص‌های پایش‌شده</p>
            <p className="text-2xl font-black text-amber-300 mt-1">{toPersianDigits(monitoredIndicatorsCount)} <span className="text-xs font-normal text-cyan-100">عنوان</span></p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-5 shadow-xl text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-cyan-200/80">میانگین کل گزارش‌ها</p>
            <p className="text-2xl font-black text-indigo-200 mt-1">{toPersianDigits(overallAvg)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar & Export Actions */}
      <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-5 mb-8 shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
          {/* Dept Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cyan-200 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>انتخاب بخش:</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">همه بخش‌های بیمارستان</option>
              {deptList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cyan-200 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>دسته‌بندی شاخص:</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cyan-200 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>ماه شمسی:</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-slate-300 text-slate-900 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value={0}>تمام ماه‌های سال</option>
              {JALALI_MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cyan-200 flex items-center gap-1">
              <span>سال:</span>
            </label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-300 text-slate-900 font-black rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 lg:pt-0">
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="جستجوی شاخص یا بخش..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-cyan-400/30 text-white placeholder-cyan-200/50 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <Search className="w-4 h-4 text-cyan-300 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-xs shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 mb-8 shadow-2xl space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-cyan-400/20 pb-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-300" />
            <span>نمودار تحلیل شاخص‌های ایمنی بیمار بیمارستان</span>
          </h3>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-400/20">
            {selectedDept === 'all' ? 'تمام بخش‌ها' : selectedDept} | {selectedMonth === 0 ? 'سال ' + toPersianDigits(selectedYear) : JALALI_MONTHS[selectedMonth - 1] + ' ' + toPersianDigits(selectedYear)}
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-cyan-200/70 text-xs font-bold">
            داده‌ای برای نمایش نمودار با فیلترهای انتخابی ثبت نشده است.
          </div>
        ) : (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="name" stroke="#a5f3fc" fontSize={11} tick={{ fill: '#a5f3fc' }} />
                <YAxis stroke="#a5f3fc" fontSize={11} tick={{ fill: '#a5f3fc' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06162a', borderColor: '#38bdf8', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any, name: any, props: any) => [
                    `${toPersianDigits(value)} ${props.payload.unit || ''}`,
                    'میانگین ثبت‌شده',
                  ]}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullTitle || label}
                />
                <Bar dataKey="value" name="میانگین ثبت‌شده" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table of Records */}
      <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-cyan-400/20 pb-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>جدول داده‌های دریافتی از مسئولین بخش‌ها ({toPersianDigits(filteredRecords.length)} ردیف)</span>
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-cyan-100 font-bold text-sm">در حال دریافت داده‌ها...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-cyan-200/80 font-bold text-sm bg-[#06162a] rounded-2xl border border-cyan-500/20">
            هیچ داده‌ای مطابق فیلترهای انتخابی یافت نشد. مسئولین بخش‌ها می‌توانند از داشبورد خود اطلاعات شاخص‌ها را وارد نمایند.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#06162a] text-cyan-200 border-b border-cyan-500/30">
                  <th className="p-3">نام بخش</th>
                  <th className="p-3">عنوان شاخص</th>
                  <th className="p-3 text-center">مقدار ثبت‌شده</th>
                  <th className="p-3 text-center">ماه / سال</th>
                  <th className="p-3">توضیحات مسئول بخش / اقدام اصلاحی</th>
                  <th className="p-3 text-left">تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/20">
                {filteredRecords.map((r) => {
                  const indInfo = CLINICAL_INDICATORS_MATRIX.find(
                    (c) => c.id === r.indicatorId || c.title === r.indicatorTitle
                  );
                  const unit = indInfo?.unit || 'مورد';
                  const cat = indInfo?.category;

                  return (
                    <tr key={r.id} className="hover:bg-[#11375f]/50 transition">
                      <td className="p-3 font-black text-white whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-200 text-xs">
                          {r.departmentName}
                        </span>
                      </td>
                      <td className="p-3 text-cyan-100 font-semibold">
                        <div>{r.indicatorTitle}</div>
                        {cat && <div className="text-[10px] text-cyan-300/70 mt-0.5">{cat}</div>}
                      </td>
                      <td className="p-3 text-center font-black text-emerald-300 whitespace-nowrap">
                        <span className="text-sm">{toPersianDigits(r.value)}</span>{' '}
                        <span className="text-[11px] font-normal text-cyan-200/80">{unit}</span>
                      </td>
                      <td className="p-3 text-center text-cyan-100 whitespace-nowrap">
                        {r.monthName} {toPersianDigits(r.year)}
                      </td>
                      <td className="p-3 text-cyan-100/90">{r.notes || '---'}</td>
                      <td className="p-3 text-left text-cyan-300/70 text-xs whitespace-nowrap">{r.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};
