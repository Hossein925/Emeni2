import React, { useState, useEffect } from 'react';
import { ArrowRight, Building2, Plus, Edit2, Trash2, Key, User as UserIcon, LogIn } from 'lucide-react';
import { Department, User } from '../types';
import { DataAccessLayer } from '../services/dal';

interface DeptManagersAdminProps {
  onBack: () => void;
  onEnterDeptPanel?: (deptUser: User) => void;
}

export const DeptManagersAdmin: React.FC<DeptManagersAdminProps> = ({ onBack, onEnterDeptPanel }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerCode, setManagerCode] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    const data = await DataAccessLayer.getDepartments();
    setDepartments(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
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

  const handleEdit = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setManagerName(dept.managerName);
    setManagerCode(dept.managerCode);
    setManagerPassword(dept.managerPassword || '');
  };

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این بخش اطمینان دارید؟')) {
      await DataAccessLayer.deleteDepartment(id);
      loadDepartments();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-cyan-600" />
            معرفی مسئولین بخش‌ها
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
            تعریف بخش‌های بیمارستان و تخصیص کد کاربری و رمز عبور به مسئولین جهت ورود به پنل بخش
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
          <span>بازگشت به پنل ادمین</span>
        </button>
      </div>

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

          <form onSubmit={handleSave} className="space-y-4">
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

          {loading ? (
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
                        onClick={() => handleEdit(dept)}
                        className="p-1.5 rounded-lg text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 transition cursor-pointer"
                        title="ویرایش"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
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
                            username: dept.managerCode,
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
    </div>
  );
};
