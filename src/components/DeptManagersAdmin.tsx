import React, { useState, useEffect } from 'react';
import { ArrowRight, Building2, Plus, Edit2, Trash2, Key, User as UserIcon, LogIn, ShieldCheck, Phone, Award } from 'lucide-react';
import { Department, SafetyOfficer, User } from '../types';
import { DataAccessLayer } from '../services/dal';
import { ConfirmModal } from './ConfirmModal';

interface DeptManagersAdminProps {
  onBack: () => void;
  onEnterDeptPanel?: (deptUser: User) => void;
}

export const DeptManagersAdmin: React.FC<DeptManagersAdminProps> = ({ onBack, onEnterDeptPanel }) => {
  const [activeTab, setActiveTab] = useState<'departments' | 'safety_officers'>('departments');

  // Departments State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  // Department Form State
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerCode, setManagerCode] = useState('');
  const [managerPassword, setManagerPassword] = useState('');

  // Safety Officers State
  const [safetyOfficers, setSafetyOfficers] = useState<SafetyOfficer[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);

  // Safety Officer Form State
  const [editingOfficerId, setEditingOfficerId] = useState<string | null>(null);
  const [officerFullName, setOfficerFullName] = useState('');
  const [officerUserCode, setOfficerUserCode] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [officerPosition, setOfficerPosition] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadDepartments();
    loadSafetyOfficers();
  }, []);

  const loadDepartments = async () => {
    setLoadingDepts(true);
    const data = await DataAccessLayer.getDepartments();
    setDepartments(data);
    setLoadingDepts(false);
  };

  const loadSafetyOfficers = async () => {
    setLoadingOfficers(true);
    const data = await DataAccessLayer.getSafetyOfficers();
    setSafetyOfficers(data);
    setLoadingOfficers(false);
  };

  // Save Department Manager
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!deptName.trim() || !managerName.trim() || !managerCode.trim() || !managerPassword.trim()) {
      setErrorMsg('لطفاً تمامی فیلدها را تکمیل نمایید.');
      return;
    }

    if (editingDeptId) {
      const existing = departments.find((d) => d.id === editingDeptId);
      if (existing) {
        await DataAccessLayer.updateDepartment({
          ...existing,
          name: deptName.trim(),
          managerName: managerName.trim(),
          managerCode: managerCode.trim(),
          managerPassword: managerPassword.trim(),
        });
      }
    } else {
      await DataAccessLayer.addDepartment({
        name: deptName.trim(),
        managerName: managerName.trim(),
        managerCode: managerCode.trim(),
        managerPassword: managerPassword.trim(),
      });
    }

    // Reset Form
    setEditingDeptId(null);
    setDeptName('');
    setManagerName('');
    setManagerCode('');
    setManagerPassword('');
    loadDepartments();
  };

  const handleEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setManagerName(dept.managerName);
    setManagerCode(dept.managerCode);
    setManagerPassword(dept.managerPassword || '');
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

  const handleDeleteDept = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف بخش',
      message: 'آیا از حذف این بخش اطمینان دارید؟ تمامی ارزیابی‌ها و گزارش‌های وابسته منتقل خواهند شد.',
      onConfirm: async () => {
        await DataAccessLayer.deleteDepartment(id);
        loadDepartments();
      },
    });
  };

  // Save Safety Officer
  const handleSaveSafetyOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!officerFullName.trim() || !officerUserCode.trim() || !officerPassword.trim()) {
      setErrorMsg('نام، کد کاربری و رمز عبور کارشناس ایمنی الزامی است.');
      return;
    }

    if (editingOfficerId) {
      const existing = safetyOfficers.find((o) => o.id === editingOfficerId);
      if (existing) {
        await DataAccessLayer.updateSafetyOfficer({
          ...existing,
          fullName: officerFullName.trim(),
          userCode: officerUserCode.trim(),
          password: officerPassword.trim(),
          phoneNumber: officerPhone.trim(),
          position: officerPosition.trim() || 'کارشناس ایمنی بیمار',
        });
      }
    } else {
      await DataAccessLayer.addSafetyOfficer({
        fullName: officerFullName.trim(),
        userCode: officerUserCode.trim(),
        password: officerPassword.trim(),
        phoneNumber: officerPhone.trim(),
        position: officerPosition.trim() || 'کارشناس ایمنی بیمار',
      });
    }

    // Reset Form
    setEditingOfficerId(null);
    setOfficerFullName('');
    setOfficerUserCode('');
    setOfficerPassword('');
    setOfficerPhone('');
    setOfficerPosition('');
    loadSafetyOfficers();
  };

  const handleEditOfficer = (officer: SafetyOfficer) => {
    setEditingOfficerId(officer.id);
    setOfficerFullName(officer.fullName);
    setOfficerUserCode(officer.userCode);
    setOfficerPassword(officer.password || '');
    setOfficerPhone(officer.phoneNumber || '');
    setOfficerPosition(officer.position || '');
  };

  const handleDeleteOfficer = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف کارشناس ایمنی بیمار',
      message: 'آیا از حذف این کارشناس ایمنی بیمار اطمینان دارید؟',
      onConfirm: async () => {
        await DataAccessLayer.deleteSafetyOfficer(id);
        loadSafetyOfficers();
      },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-200/60" dir="rtl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-slate-950" />
            <span>بازگشت</span>
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-cyan-600" />
              مدیریت دسترسی‌ها و مسئولین
            </h2>
            <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
              تعریف مسئولین بخش‌ها و کارشناسان ایمنی بیمار (دسترسی کامل ادمین کل)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6 bg-indigo-50/80 p-1.5 rounded-2xl border border-indigo-200/60 w-fit">
        <button
          onClick={() => {
            setActiveTab('departments');
            setErrorMsg('');
          }}
          className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-indigo-900 hover:bg-indigo-100/70'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>مسئولین بخش‌ها ({departments.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('safety_officers');
            setErrorMsg('');
          }}
          className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'safety_officers'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-indigo-900 hover:bg-indigo-100/70'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>کارشناسان ایمنی بیمار ({safetyOfficers.length})</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
            ادمین کل
          </span>
        </button>
      </div>

      {/* Tab Content: Department Managers */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1 bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl h-fit space-y-4 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b-2 border-slate-200 pb-3">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>{editingDeptId ? 'ویرایش اطلاعات بخش' : 'تعریف بخش و مسئول جدید'}</span>
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-100 border-2 border-rose-300 text-rose-950 font-black text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  نام بخش بیمارستان
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: بخش جراحی ۱"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  نام و نام خانوادگی مسئول بخش
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: خانم دکتر رضایی"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  کد کاربری مسئول بخش
                </label>
                <input
                  type="text"
                  placeholder="کد عددی ورود"
                  value={managerCode}
                  onChange={(e) => setManagerCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  رمز عبور اختصاصی مسئول بخش
                </label>
                <input
                  type="text"
                  placeholder="رمز عبور"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  dir="ltr"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  {editingDeptId ? 'بروزرسانی اطلاعات' : 'ذخیره مسئول و بخش'}
                </button>

                {editingDeptId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDeptId(null);
                      setDeptName('');
                      setManagerName('');
                      setManagerCode('');
                      setManagerPassword('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-800 text-xs font-black cursor-pointer hover:bg-slate-200"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-black text-slate-900 mb-2">
              لیست بخش‌ها و مسئولین ثبت‌شده ({departments.length})
            </h3>

            {loadingDepts ? (
              <div className="py-12 text-center text-slate-900 font-black text-sm">در حال دریافت اطلاعات...</div>
            ) : departments.length === 0 ? (
              <div className="py-12 text-center text-slate-800 font-black text-sm bg-white rounded-3xl border-2 border-indigo-200 shadow-md">
                هنوز بخشی ثبت نشده است.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-lg space-y-3 relative group text-slate-900"
                  >
                    <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                      <span className="font-black text-slate-900 text-base">{dept.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditDept(dept)}
                          className="p-1.5 rounded-lg text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 transition cursor-pointer"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDept(dept.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-800 font-extrabold">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>مسئول بخش: <strong className="text-slate-950 font-black">{dept.managerName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>کد کاربری: <code className="text-amber-950 font-mono font-black bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{dept.managerCode}</code></span>
                      </div>
                    </div>

                    {onEnterDeptPanel && (
                      <div className="pt-2 border-t border-slate-200">
                        <button
                          onClick={() => {
                            const managerUser: User = {
                              id: `user-${dept.id}`,
                              userCode: dept.managerCode,
                              passwordHash: '',
                              name: dept.managerName,
                              role: 'department_manager',
                              departmentId: dept.id,
                              departmentName: dept.name,
                            };
                            onEnterDeptPanel(managerUser);
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <LogIn className="w-4 h-4 text-cyan-300" />
                          <span>ورود به پنل مسئول بخش</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Safety Officers */}
      {activeTab === 'safety_officers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1 bg-white border-2 border-cyan-200 rounded-3xl p-6 shadow-xl h-fit space-y-4 text-slate-900">
            <div className="border-b-2 border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600" />
                <span>{editingOfficerId ? 'ویرایش کارشناس ایمنی' : 'افزودن کارشناس ایمنی جدید'}</span>
              </h3>
              <p className="text-[11px] font-bold text-slate-600 mt-1 leading-relaxed">
                کارشناسان ایمنی بیمار پس از ثبت، دارای دسترسی کامل هم‌سطح ادمین کل سامانه می‌باشند.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-100 border-2 border-rose-300 text-rose-950 font-black text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveSafetyOfficer} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  نام و نام خانوادگی کارشناس
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: خانم مهندس صادقی"
                  value={officerFullName}
                  onChange={(e) => setOfficerFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  سمت سازمانی / عنوان شغلی
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: کارشناس ارشد ایمنی بیمار"
                  value={officerPosition}
                  onChange={(e) => setOfficerPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  کد کاربری اختصاصی جهت ورود
                </label>
                <input
                  type="text"
                  placeholder="کد عددی ورود"
                  value={officerUserCode}
                  onChange={(e) => setOfficerUserCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  رمز عبور
                </label>
                <input
                  type="text"
                  placeholder="رمز عبور"
                  value={officerPassword}
                  onChange={(e) => setOfficerPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  شماره تماس (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="۰۹۱۲..."
                  value={officerPhone}
                  onChange={(e) => setOfficerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  dir="ltr"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-700 hover:from-cyan-500 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  {editingOfficerId ? 'بروزرسانی کارشناس' : 'ذخیره کارشناس ایمنی'}
                </button>

                {editingOfficerId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOfficerId(null);
                      setOfficerFullName('');
                      setOfficerUserCode('');
                      setOfficerPassword('');
                      setOfficerPhone('');
                      setOfficerPosition('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-800 text-xs font-black cursor-pointer hover:bg-slate-200"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center justify-between">
              <span>لیست کارشناسان ایمنی بیمار ({safetyOfficers.length})</span>
              <span className="text-xs font-bold text-slate-600 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-300">
                سطح دسترسی: ادمین کل
              </span>
            </h3>

            {loadingOfficers ? (
              <div className="py-12 text-center text-slate-900 font-black text-sm">در حال دریافت اطلاعات...</div>
            ) : safetyOfficers.length === 0 ? (
              <div className="py-12 text-center text-slate-800 font-black text-sm bg-white rounded-3xl border-2 border-cyan-200 shadow-md">
                هنوز کارشناس ایمنی ثبت نشده است.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safetyOfficers.map((officer) => (
                  <div
                    key={officer.id}
                    className="bg-white border-2 border-cyan-200 rounded-3xl p-5 shadow-lg space-y-3 relative group text-slate-900"
                  >
                    <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0" />
                        <div>
                          <span className="font-black text-slate-900 text-base block">{officer.fullName}</span>
                          <span className="text-[10px] font-extrabold text-indigo-700 block">{officer.position}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditOfficer(officer)}
                          className="p-1.5 rounded-lg text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 transition cursor-pointer"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOfficer(officer.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-800 font-extrabold">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>کد کاربری ورود: <code className="text-amber-950 font-mono font-black bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{officer.userCode}</code></span>
                      </div>
                      {officer.password && (
                        <div className="flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-emerald-600" />
                          <span>رمز عبور: <code className="text-slate-900 font-mono font-black bg-slate-100 px-2 py-0.5 rounded border border-slate-300">{officer.password}</code></span>
                        </div>
                      )}
                      {officer.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-indigo-600" />
                          <span>شماره تماس: <span className="font-mono text-slate-900">{officer.phoneNumber}</span></span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-black text-emerald-700 bg-emerald-50/70 p-2 rounded-xl">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>دسترسی کامل مدیریت کل سیستم</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">{officer.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

