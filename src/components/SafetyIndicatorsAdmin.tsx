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
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Department,
  SafetyIndicatorDefinition,
  SafetyIndicatorRecord,
} from '../types';
import { DataAccessLayer } from '../services/dal';
import { JALALI_MONTHS, toPersianDigits, getCurrentJalaliYear, getCurrentJalaliMonth } from '../utils/jalali';
import { exportToExcel } from '../utils/exportUtils';
import { CLINICAL_INDICATORS_MATRIX, CLINICAL_DEPARTMENTS } from '../data/indicators';

interface SafetyIndicatorsAdminProps {
  onBack: () => void;
}

export const SafetyIndicatorsAdmin: React.FC<SafetyIndicatorsAdminProps> = ({ onBack }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [indicatorDefs, setIndicatorDefs] = useState<SafetyIndicatorDefinition[]>([]);
  const [records, setRecords] = useState<SafetyIndicatorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = all months
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentJalaliYear());
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const depts = await DataAccessLayer.getDepartments();
    const defs = await DataAccessLayer.getIndicatorDefinitions();
    const recs = await DataAccessLayer.getIndicatorRecords();
    
    setDepartments(depts);
    setIndicatorDefs(defs);
    setRecords(recs);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-indigo-200/60 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <Activity className="w-8 h-8 text-cyan-600" />
            شاخص‌های ایمنی بیمار بیمارستان (پنل نظارت مدیریت)
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
            تجمیع، پایش و تحلیل خودکار داده‌ها و آمار شاخص‌های ایمنی ثبت‌شده توسط مسئولین بخش‌ها
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40"
          >
            <ArrowRight className="w-4 h-4 text-slate-950" />
            <span>بازگشت به پنل ادمین</span>
          </button>
        </div>
      </div>

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
    </div>
  );
};
