import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Award,
  Edit3,
  Trash2,
  Building2,
  Hash,
  Phone,
  Briefcase,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { StaffMember, Department } from '../types';
import { DataAccessLayer } from '../services/dal';
import { toPersianDigits } from '../utils/jalali';
import { StaffPersonnelReportCardModal } from './StaffPersonnelReportCardModal';
import { ConfirmModal } from './ConfirmModal';

interface StaffManagementViewProps {
  departmentName: string;
  departmentId?: string;
  userName?: string;
  onBack?: () => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  departmentName,
  departmentId,
  userName,
  onBack,
}) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(departmentName || 'all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [position, setPosition] = useState('پرستار');
  const [personnelCode, setPersonnelCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [staffDeptName, setStaffDeptName] = useState(departmentName || 'بخش اورژانس');
  const [staffDeptId, setStaffDeptId] = useState(departmentId || 'dept-1');
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Personnel Report Card Modal
  const [reportCardStaff, setReportCardStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    loadData();
  }, [departmentName]);

  const loadData = async () => {
    setLoading(true);
    const depts = await DataAccessLayer.getDepartments();
    setDepartments(depts);

    // Fetch staff members for department or all
    const allStaff = await DataAccessLayer.getStaffMembers();
    setStaffList(allStaff);
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFirstName('');
    setLastName('');
    setNationalId('');
    setPosition('پرستار');
    setPersonnelCode('');
    setPhoneNumber('');
    setStaffDeptName(departmentName || 'بخش اورژانس');
    setStaffDeptId(departmentId || 'dept-1');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFirstName(staff.firstName || '');
    setLastName(staff.lastName || '');
    setNationalId(staff.nationalId || '');
    setPosition(staff.position || 'پرستار');
    setPersonnelCode(staff.personnelCode || '');
    setPhoneNumber(staff.phoneNumber || '');
    setStaffDeptName(staff.departmentName || departmentName);
    setStaffDeptId(staff.departmentId || departmentId || 'dept-1');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim() || !lastName.trim()) {
      setFormError('لطفاً نام و نام خانوادگی پرسنل را وارد نمایید.');
      return;
    }

    const cleanNationalId = nationalId.trim();
    if (!cleanNationalId || cleanNationalId.length < 8) {
      setFormError('لطفاً کد ملی معتبر (۱۰ رقمی) وارد نمایید.');
      return;
    }

    // Check duplicate nationalId if creating new or changing nationalId
    const existing = staffList.find(
      (s) => s.nationalId.trim() === cleanNationalId && s.id !== editingStaff?.id
    );
    if (existing) {
      setFormError(`پرسنلی با کد ملی ${cleanNationalId} قبلاً با نام "${existing.fullName}" در بخش ${existing.departmentName} ثبت شده است.`);
      return;
    }

    // Match department ID if name changed
    const matchedDept = departments.find((d) => d.name === staffDeptName);

    await DataAccessLayer.saveStaffMember({
      id: editingStaff?.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationalId: cleanNationalId,
      position: position.trim() || 'پرستار',
      personnelCode: personnelCode.trim(),
      phoneNumber: phoneNumber.trim(),
      departmentName: staffDeptName,
      departmentId: matchedDept?.id || staffDeptId || 'dept-1',
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    setIsModalOpen(false);
    loadData();
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

  const handleDeleteStaff = (staff: StaffMember) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف پرسنل',
      message: `آیا از حذف پرسنل "${staff.fullName}" با کد ملی ${staff.nationalId} اطمینان دارید؟`,
      onConfirm: async () => {
        await DataAccessLayer.deleteStaffMember(staff.id);
        loadData();
      },
    });
  };

  // Filtered list
  const filteredStaff = staffList.filter((s) => {
    const matchesQuery =
      s.fullName.includes(searchQuery) ||
      s.nationalId.includes(searchQuery) ||
      (s.position && s.position.includes(searchQuery)) ||
      (s.personnelCode && s.personnelCode.includes(searchQuery));

    const matchesDept =
      selectedDeptFilter === 'all' ||
      s.departmentName === selectedDeptFilter ||
      s.departmentName.includes(selectedDeptFilter) ||
      selectedDeptFilter.includes(s.departmentName);

    return matchesQuery && matchesDept;
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn text-right" dir="rtl">
      
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border-2 border-indigo-400/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 mb-1">
            <Users className="w-4 h-4 text-amber-300" />
            <span>مدیریت پرسنل و کادر درمانی • سیستم یکپارچه هویت با کد ملی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            پرسنل و کادر بخش {departmentName}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-200 font-bold mt-1.5">
            ثبت کد ملی جهت شناسایی هوشمند در آزمون‌ها، ارزیابی‌ها و تشکیل کارنامه پرسنلی
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl active:scale-95 transition cursor-pointer border border-emerald-300/40"
          >
            <UserPlus className="w-5 h-5" />
            <span>+ افزودن پرسنل جدید</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو با نام، کد ملی یا سمت..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
          />
        </div>

        {/* Department Filter Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs text-slate-300 font-bold shrink-0">فیلتر بخش:</span>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold outline-none cursor-pointer"
          >
            <option value="all">همه بخش‌های بیمارستان</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Staff List Grid / Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-bold animate-pulse">
          در حال دریافت اطلاعات پرسنل...
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-400">
            هیچ پرسنلی در این بخش یا با این عبارت جستجو یافت نشد.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>ثبت اولین پرسنل بخش</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between gap-4 transition hover:-translate-y-1 group"
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-cyan-300 font-black text-base shrink-0 group-hover:bg-cyan-500/20 group-hover:text-cyan-200 transition">
                      {staff.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                        {staff.fullName}
                      </h3>
                      <span className="text-xs text-cyan-300 font-bold block mt-0.5">
                        {staff.position || 'کادر درمان'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-amber-400/15 text-amber-300 border border-amber-400/30 font-black text-xs shrink-0 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {toPersianDigits(staff.nationalId)}
                  </span>
                </div>

                {/* Details Pills */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">بخش محل خدمت:</span>
                    <span className="font-bold text-white">{staff.departmentName}</span>
                  </div>
                  {staff.personnelCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">کد پرسنلی:</span>
                      <span className="font-bold text-slate-200">{toPersianDigits(staff.personnelCode)}</span>
                    </div>
                  )}
                  {staff.phoneNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">شماره همراه:</span>
                      <span className="font-bold text-slate-200">{toPersianDigits(staff.phoneNumber)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setReportCardStaff(staff)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-cyan-300 border border-indigo-400/30 text-xs font-bold transition cursor-pointer"
                  title="مشاهده کارنامه پرسنلی، نمرات آزمون و ارزیابی‌ها"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>کارنامه پرسنلی</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(staff)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                    title="ویرایش اطلاعات"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
                    title="حذف پرسنل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ================= ADD / EDIT STAFF MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fadeIn text-right" dir="rtl">
          <div className="bg-slate-900 border-2 border-indigo-500/40 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative text-slate-100">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-4 border-b border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  {editingStaff ? 'ویرایش اطلاعات پرسنل' : 'افزودن پرسنل جدید به بخش'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    نام <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: علی"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    نام خانوادگی <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: حسینی"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              {/* National Code (کد ملی) */}
              <div>
                <label className="text-xs font-bold text-amber-300 flex items-center justify-between mb-1">
                  <span>کد ملی (۱۰ رقمی) <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">کلید شناسایی در سامانه</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="مثال: 0012345678"
                  required
                  className="w-full bg-slate-950 border-2 border-amber-500/40 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-amber-200 font-bold tracking-widest text-center outline-none"
                />
              </div>

              {/* Position / Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    سمت / رده شغلی
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="پرستار / بهیار / سرپرستار ..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    بخش محل خدمت
                  </label>
                  <select
                    value={staffDeptName}
                    onChange={(e) => setStaffDeptName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Personnel Code & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    کد پرسنلی (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={personnelCode}
                    onChange={(e) => setPersonnelCode(e.target.value)}
                    placeholder="مثال: 98012"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    شماره همراه (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
                >
                  {editingStaff ? 'ذخیره تغییرات' : 'ثبت و افزودن پرسنل'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= PERSONNEL REPORT CARD MODAL ================= */}
      {reportCardStaff && (
        <StaffPersonnelReportCardModal
          staff={reportCardStaff}
          onClose={() => setReportCardStaff(null)}
        />
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
