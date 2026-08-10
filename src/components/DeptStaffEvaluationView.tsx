import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ClipboardCheck,
  Search,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
  FileText,
  Calendar,
  Building2,
  Award,
  Users,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { Department, Checklist, StaffEvaluation, StaffMember } from '../types';
import { DataAccessLayer } from '../services/dal';
import { JALALI_MONTHS, toPersianDigits, getCurrentJalaliYear, getCurrentJalaliMonth } from '../utils/jalali';
import { StaffPersonnelReportCardModal } from './StaffPersonnelReportCardModal';

interface DeptStaffEvaluationViewProps {
  departmentName: string;
  departmentId: string;
  userName: string;
  onBack: () => void;
}

export const DeptStaffEvaluationView: React.FC<DeptStaffEvaluationViewProps> = ({
  departmentName,
  departmentId,
  userName,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [evalChecklists, setEvalChecklists] = useState<Checklist[]>([]);
  const [departmentStaff, setDepartmentStaff] = useState<StaffMember[]>([]);
  const [evaluations, setEvaluations] = useState<StaffEvaluation[]>([]);

  // Selection & Form State
  const [nationalId, setNationalId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);
  const [selectedChecklistId, setSelectedChecklistId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentJalaliMonth());
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentJalaliYear());
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, number>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Search State
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchResultStaff, setSearchResultStaff] = useState<StaffMember | null>(null);

  // Report Card Modal
  const [reportCardStaff, setReportCardStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    loadData();
  }, [departmentName, departmentId]);

  const loadData = async () => {
    setLoading(true);
    let chks = await DataAccessLayer.getChecklists('staff_eval');
    if (chks.length === 0) {
      chks = await DataAccessLayer.getChecklists();
    }
    const staffList = await DataAccessLayer.getStaffMembers();
    const deptStaff = staffList.filter(
      (s) => s.departmentId === departmentId || s.departmentName === departmentName
    );
    const evals = await DataAccessLayer.getEvaluations();
    const deptEvals = evals.filter(
      (e) => e.departmentId === departmentId || e.departmentName === departmentName
    );

    setEvalChecklists(chks);
    setDepartmentStaff(deptStaff);
    setEvaluations(deptEvals);

    if (chks.length > 0) {
      setSelectedChecklistId(chks[0].id);
    }
    setLoading(false);
  };

  // When checklist changes, initialize answers to max points (2 points per field)
  useEffect(() => {
    const selectedChk = evalChecklists.find((c) => c.id === selectedChecklistId);
    if (selectedChk && selectedChk.fields && selectedChk.fields.length > 0) {
      const initialAnswers: Record<string, number> = {};
      selectedChk.fields.forEach((f) => {
        initialAnswers[f.id] = 2; // Default full compliance
      });
      setChecklistAnswers(initialAnswers);
    } else {
      setChecklistAnswers({});
    }
  }, [selectedChecklistId, evalChecklists]);

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

  const handleSelectStaff = (staff: StaffMember) => {
    setSelectedStaffMember(staff);
    setStaffName(staff.fullName);
    setNationalId(staff.nationalId);
    setSearchResultStaff(null);
    setSearchAttempted(false);
  };

  // Calculate scores
  const selectedChecklist = evalChecklists.find((c) => c.id === selectedChecklistId);
  const totalFields = selectedChecklist?.fields?.length || 0;
  const maxScore = totalFields > 0 ? totalFields * 2 : 100;
  const currentScore: number = totalFields > 0
    ? Object.values(checklistAnswers).reduce<number>((a, b) => a + Number(b || 0), 0)
    : 100;
  const percentage = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 100;

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !nationalId.trim()) {
      alert('لطفاً کد ملی و نام پرسنل را مشخص فرمایید.');
      return;
    }

    await DataAccessLayer.saveEvaluation({
      staffName: staffName.trim(),
      nationalId: nationalId.trim(),
      departmentId: departmentId,
      departmentName: departmentName,
      checklistId: selectedChecklistId || 'custom-chk',
      checklistTitle: selectedChecklist?.title || 'ارزیابی عملکرد پرسنل بخش',
      totalScore: Number(currentScore),
      maxScore: Number(maxScore),
      percentage: percentage,
      year: selectedYear,
      month: selectedMonth,
      monthName: JALALI_MONTHS[selectedMonth - 1],
      correctiveAction: correctiveAction.trim() || 'عدم نیاز به اقدام اصلاحی',
      evaluatedBy: userName || 'مسئول بخش',
      answers: checklistAnswers,
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setStaffName('');
      setNationalId('');
      setSelectedStaffMember(null);
      setCorrectiveAction('');
    }, 2000);

    // Refresh evaluations list
    const evals = await DataAccessLayer.getEvaluations();
    const deptEvals = evals.filter(
      (ev) => ev.departmentId === departmentId || ev.departmentName === departmentName
    );
    setEvaluations(deptEvals);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-indigo-200 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                ارزیابی پرسنل بخش {departmentName}
              </h2>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              تکمیل چک‌لیست‌های ارزیابی عملکرد و سنجه‌های ایمنی بیمار برای پرسنل این بخش توسط مسئول بخش
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs">
            ثبت‌کننده: {userName}
          </span>
        </div>
      </div>

      {/* Main Evaluation Form */}
      <form onSubmit={handleSubmitEvaluation} className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-indigo-200 shadow-lg space-y-6">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-200">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          <span>مرحله اول: انتخاب یا جستجوی پرسنل بخش</span>
        </h3>

        {/* Search by National ID or Select from list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box 1: Search by National ID */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-indigo-100 space-y-3">
            <label className="block text-xs font-black text-slate-800">
              ۱. جستجو با کد ملی پرسنل: <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                value={nationalId}
                onChange={(e) => {
                  setNationalId(e.target.value);
                  setSearchAttempted(false);
                  setSearchResultStaff(null);
                }}
                placeholder="کد ۱۰ رقمی ملی پرسنل"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-300 font-black text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 text-center tracking-widest"
              />
              <button
                type="button"
                onClick={handleSearchStaff}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4 text-amber-300" />
                <span>جستجو</span>
              </button>
            </div>

            {searchAttempted && (
              <div>
                {searchResultStaff ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-black flex items-center justify-between gap-2">
                    <span className="text-emerald-950">
                      {searchResultStaff.fullName} ({searchResultStaff.position || 'کادر درمان'})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectStaff(searchResultStaff)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px]"
                    >
                      انتخاب پرسنل
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>پرسنلی با این کد ملی یافت نشد. می‌توانید نام را مستقیم وارد کنید.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Box 2: Dropdown from Department Staff */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-indigo-100 space-y-3">
            <label className="block text-xs font-black text-slate-800">
              ۲. یا انتخاب مستقیم از لیست پرسنل ثبت‌شده بخش {departmentName}:
            </label>
            <select
              onChange={(e) => {
                const staff = departmentStaff.find((s) => s.id === e.target.value);
                if (staff) handleSelectStaff(staff);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 font-black text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- انتخاب پرسنل بخش ({toPersianDigits(departmentStaff.length)} نفر) --</option>
              {departmentStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} - {s.position || 'کادر درمان'} (کد ملی: {s.nationalId})
                </option>
              ))}
            </select>

            {selectedStaffMember && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>پرسنل انتخاب‌شده: <strong>{selectedStaffMember.fullName}</strong> ({selectedStaffMember.position || 'کادر درمان'})</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Staff Name & National ID Display or Manual Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">
              نام و نام خانوادگی پرسنل <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: مریم محمدی"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-black text-sm focus:bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">
              کد ملی پرسنل <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="مثال: ۰۰۱۲۳۴۵۶۷۸"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-black text-sm text-center tracking-widest focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Step 2: Select Evaluation Checklist */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>مرحله دوم: انتخاب چک‌لیست ارزیابی و نمره‌دهی</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                عنوان چک‌لیست ارزیابی <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedChecklistId}
                onChange={(e) => setSelectedChecklistId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-indigo-200 rounded-xl text-slate-900 font-black text-xs focus:ring-2 focus:ring-indigo-500"
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
                ماه و سال ارزیابی
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-2 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                >
                  {JALALI_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-center"
                />
              </div>
            </div>
          </div>

          {/* Render Checklist Questions */}
          {selectedChecklist && selectedChecklist.fields && selectedChecklist.fields.length > 0 ? (
            <div className="space-y-3 bg-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-indigo-200">
              <div className="flex items-center justify-between border-b pb-2 border-indigo-200">
                <span className="text-xs font-black text-indigo-950">
                  سوالات و سنجه‌های ارزیابی ({toPersianDigits(selectedChecklist.fields.length)} گویه)
                </span>
                <span className="text-xs font-black text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200 shadow-sm">
                  نمره کسب شده: {toPersianDigits(currentScore)} از {toPersianDigits(maxScore)} ({toPersianDigits(percentage)}٪)
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {selectedChecklist.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="text-xs font-black text-slate-900 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 text-[11px]">
                        {toPersianDigits(index + 1)}
                      </span>
                      <span>{field.label}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setChecklistAnswers((prev) => ({ ...prev, [field.id]: 2 }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer ${
                          checklistAnswers[field.id] === 2
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                        }`}
                      >
                        عالی (۲ نمره)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setChecklistAnswers((prev) => ({ ...prev, [field.id]: 1 }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer ${
                          checklistAnswers[field.id] === 1
                            ? 'bg-amber-500 text-white shadow'
                            : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                        }`}
                      >
                        تاحدودی (۱)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setChecklistAnswers((prev) => ({ ...prev, [field.id]: 0 }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer ${
                          checklistAnswers[field.id] === 0
                            ? 'bg-rose-600 text-white shadow'
                            : 'bg-slate-100 text-slate-700 hover:bg-rose-100'
                        }`}
                      >
                        نیازمند بهبود (۰)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs font-bold text-amber-950">
              ارزیابی عمومی با ثبت درصد نمره رعایت
            </div>
          )}

          {/* Corrective Action */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">
              اقدام اصلاحی و بازخورد مسئول بخش
            </label>
            <textarea
              rows={2}
              placeholder="در صورت وجود نقاط قابل بهبود، توصیه یا اقدام اصلاحی را بنویسید..."
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Submit Button & Notification */}
        {submitSuccess && (
          <div className="p-4 bg-emerald-500 text-white rounded-2xl font-black text-xs text-center shadow-lg animate-fadeIn flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-300" />
            <span>ارزیابی پرسنل با موفقیت ثبت شد و در کارنامه ثبت گردید.</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white font-black text-sm shadow-xl transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-5 h-5 text-amber-300" />
            <span>ثبت نهایی ارزیابی پرسنل</span>
          </button>
        </div>
      </form>

      {/* History Table of Saved Evaluations for this department */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-indigo-200 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>سوابق ارزیابی‌های ثبت‌شده پرسنل بخش {departmentName} ({toPersianDigits(evaluations.length)})</span>
          </h3>
        </div>

        {evaluations.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs font-bold">
            هنوز ارزیابی برای پرسنل این بخش ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-800 font-black">
                <tr>
                  <th className="p-3 rounded-r-xl">نام پرسنل</th>
                  <th className="p-3">کد ملی</th>
                  <th className="p-3">عنوان چک‌لیست</th>
                  <th className="p-3">ماه / سال</th>
                  <th className="p-3">نمره (درصد)</th>
                  <th className="p-3">ارزیاب</th>
                  <th className="p-3 rounded-l-xl text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {evaluations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 font-bold text-slate-800">
                    <td className="p-3 font-black text-slate-900">{item.staffName}</td>
                    <td className="p-3 font-mono">{toPersianDigits(item.nationalId)}</td>
                    <td className="p-3">{item.checklistTitle || 'ارزیابی پرسنل'}</td>
                    <td className="p-3">
                      {item.monthName || item.month} {toPersianDigits(item.year)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          item.percentage >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.percentage >= 70
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {toPersianDigits(item.percentage)}٪ ({toPersianDigits(item.totalScore)}/{toPersianDigits(item.maxScore)})
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{item.evaluatedBy || 'مسئول بخش'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          const nameParts = (item.staffName || '').trim().split(' ');
                          const staffObj: StaffMember = {
                            id: `stf-${item.nationalId}`,
                            firstName: nameParts[0] || '',
                            lastName: nameParts.slice(1).join(' ') || '',
                            fullName: item.staffName,
                            nationalId: item.nationalId,
                            departmentId: item.departmentId,
                            departmentName: item.departmentName,
                            createdAt: item.createdAt,
                          };
                          setReportCardStaff(staffObj);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده کارنامه</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Card Modal */}
      {reportCardStaff && (
        <StaffPersonnelReportCardModal
          staff={reportCardStaff}
          onClose={() => setReportCardStaff(null)}
        />
      )}
    </div>
  );
};
