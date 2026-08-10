import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ClipboardList,
  Plus,
  Trash2,
  ListFilter,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Checklist, ChecklistField } from '../types';
import { DataAccessLayer } from '../services/dal';
import { ErrorReportFormBuilder } from './ErrorReportFormBuilder';

interface ChecklistsAdminProps {
  onBack: () => void;
}

export const ChecklistsAdmin: React.FC<ChecklistsAdminProps> = ({ onBack }) => {
  const [selectedTile, setSelectedTile] = useState<'head_nurse' | 'staff_eval' | 'error_report' | null>(null);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Builder State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<ChecklistField[]>([
    { id: 'f-1', label: 'سوال نمونه اول', type: 'yesno', required: true },
  ]);

  useEffect(() => {
    if (selectedTile) {
      loadChecklists();
    }
  }, [selectedTile]);

  const loadChecklists = async () => {
    if (!selectedTile) return;
    setLoading(true);
    const data = await DataAccessLayer.getChecklists(selectedTile);
    setChecklists(data);
    setLoading(false);
  };

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, label: '', type: 'yesno', required: true },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: keyof ChecklistField, val: any) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const handleSaveChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('لطفاً عنوان چک‌لیست را وارد کنید.');
      return;
    }

    const validFields = fields.filter((f) => f.label.trim());
    if (validFields.length === 0) {
      alert('لطفاً حداقل یک سوال برای چک‌لیست تعریف کنید.');
      return;
    }

    await DataAccessLayer.saveChecklist({
      id: editingId || undefined,
      title: title.trim(),
      category: selectedTile || 'head_nurse',
      description: description.trim(),
      fields: validFields,
    });

    // Reset Form
    setEditingId(null);
    setTitle('');
    setDescription('');
    setFields([{ id: 'f-1', label: 'سوال نمونه اول', type: 'yesno', required: true }]);

    loadChecklists();
  };

  const handleEdit = (chk: Checklist) => {
    setEditingId(chk.id);
    setTitle(chk.title);
    setDescription(chk.description || '');
    setFields(chk.fields);
  };

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این چک‌لیست اطمینان دارید؟')) {
      await DataAccessLayer.deleteChecklist(id);
      loadChecklists();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-cyan-600" />
            {selectedTile === 'head_nurse' && 'طراحی و مدیریت چک‌لیست‌های سرپرستاران'}
            {selectedTile === 'staff_eval' && 'طراحی و مدیریت چک‌لیست‌های ارزیابی پرسنل'}
            {selectedTile === 'error_report' && 'طراحی و ویرایش فرم گزارش خطای پزشکی'}
            {!selectedTile && 'سازنده چک‌لیست‌ها و فرم‌های پویا (Dynamic Form Builder)'}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
            {selectedTile === 'head_nurse' && 'تعریف سوالات چک‌لیست ارزیابی بخش توسط سرپرستار (بله/خیر، ۴گزینه‌ای، تشریحی)'}
            {selectedTile === 'staff_eval' && 'طراحی بنود چک‌لیست‌های ارزیابی دانش و توانمندی ایمنی بیمار برای کادر درمان'}
            {selectedTile === 'error_report' && 'تعریف فیلدها و سوالات فرم ثبت گزارش خطا برای پرستاران و پزشکان'}
            {!selectedTile && 'لطفاً نوع چک‌لیست یا فرمی که قصد طراحی/ویرایش آن را دارید انتخاب کنید'}
          </p>
        </div>

        {selectedTile ? (
          <button
            onClick={() => {
              setSelectedTile(null);
              setEditingId(null);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به انتخاب بخش</span>
          </button>
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40"
          >
            <ArrowRight className="w-4 h-4 text-slate-950" />
            <span>بازگشت به پنل ادمین</span>
          </button>
        )}
      </div>

      {/* ================= TILE SELECTION SCREEN ================= */}
      {!selectedTile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          {/* Tile 1: چک‌لیست‌های سرپرستاران */}
          <button
            onClick={() => {
              setSelectedTile('head_nurse');
              setEditingId(null);
            }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500/20 shadow-lg transition-all duration-300">
                <FileCheck2 className="w-9 h-9 text-indigo-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-400/20 border border-indigo-400/40 text-indigo-300 text-xs font-black">
                بخش شماره ۱
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۱. چک‌لیست‌های سرپرستاران
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                طراحی چک‌لیست‌های ارزیابی بخش قابل تکمیل در پنل مسئولین و سرپرستاران
              </p>
            </div>
          </button>

          {/* Tile 2: چک‌لیست‌های ارزیابی پرسنل */}
          <button
            onClick={() => {
              setSelectedTile('staff_eval');
              setEditingId(null);
            }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
                <UserCheck className="w-9 h-9 text-cyan-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-black">
                بخش شماره ۲
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۲. چک‌لیست‌های ارزیابی پرسنل
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                تعریف فرم‌ها و چک‌لیست‌های سنجش دانش و عملکرد ایمنی بیمار برای ارزیابی حضوری
              </p>
            </div>
          </button>

          {/* Tile 3: فرم گزارش خطا */}
          <button
            onClick={() => {
              setSelectedTile('error_report');
              setEditingId(null);
            }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 shadow-lg transition-all duration-300">
                <AlertTriangle className="w-9 h-9 text-amber-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black">
                بخش شماره ۳
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۳. فرم گزارش خطا
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                طراحی فیلدهای فرم آنلاین گزارش حوادث ناخواسته و خطاهای پزشکی صفحه اصلی
              </p>
            </div>
          </button>
        </div>
      )}

      {selectedTile === 'error_report' && (
        <ErrorReportFormBuilder onSaved={loadChecklists} />
      )}

      {selectedTile && selectedTile !== 'error_report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Builder Panel */}
        <div className="lg:col-span-2 bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl space-y-6 text-slate-900">
          <h3 className="text-lg font-black text-slate-900 border-b-2 border-slate-200 pb-3">
            {editingId ? 'ویرایش چک‌لیست' : 'طراحی چک‌لیست و فرم جدید'}
          </h3>

          <form onSubmit={handleSaveChecklist} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1">
                عنوان چک‌لیست / فرم <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="مثلاً: چک‌لیست پایش ترالی دارویی"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1">توضیحات کوتاه</label>
              <input
                type="text"
                placeholder="راهنمای تکمیلی برای کاربر"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Questions Builder */}
            <div className="space-y-4 pt-4 border-t-2 border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900">لیست سوالات و فیلدهای فرم</h4>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 border-2 border-indigo-200 text-xs font-black hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن سوال</span>
                </button>
              </div>

              {fields.map((f, idx) => (
                <div key={f.id} className="p-4 bg-slate-50/80 rounded-2xl border-2 border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-800">سوال شماره {idx + 1}</span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="متن سوال را بنویسید..."
                    value={f.label}
                    onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-900 mb-1 font-black">نوع پاسخ:</label>
                      <select
                        value={f.type}
                        onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="yesno">بله / خیر</option>
                        <option value="mc">چهارگزینه‌ای / چندگزینه‌ای</option>
                        <option value="rating">امتیازی / شکلک‌های کیفی (۱ تا ۵)</option>
                        <option value="text">پاسخ تشریحی آزاد</option>
                      </select>
                    </div>

                    {f.type === 'mc' && (
                      <div>
                        <label className="block text-slate-900 mb-1 font-black">گزینه‌ها (با کاما جدا کنید):</label>
                        <input
                          type="text"
                          placeholder="گزینه ۱، گزینه ۲، گزینه ۳"
                          value={(f.options || []).join('، ')}
                          onChange={(e) =>
                            handleFieldChange(
                              idx,
                              'options',
                              e.target.value.split('،').map((o) => o.trim())
                            )
                          }
                          className="w-full px-3 py-1.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setDescription('');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-800 text-xs font-black cursor-pointer hover:bg-slate-200"
                >
                  انصراف
                </button>
              )}
              <button
                type="submit"
                className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 text-white font-black text-xs shadow-md transition cursor-pointer"
              >
                ذخیره چک‌لیست
              </button>
            </div>
          </form>
        </div>

        {/* Existing Checklists List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-black text-slate-900 mb-2">
            چک‌لیست‌های موجود ({checklists.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-slate-900 font-black text-sm">در حال دریافت چک‌لیست‌ها...</div>
          ) : checklists.length === 0 ? (
            <div className="py-12 text-center text-slate-800 font-black text-sm bg-white rounded-3xl border-2 border-indigo-200 shadow-md">
              هنوز چک‌لیستی در این بخش ثبت نشده است.
            </div>
          ) : (
            checklists.map((chk) => (
              <div
                key={chk.id}
                className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-lg space-y-3 text-slate-900"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                  <h4 className="font-black text-slate-900 text-sm">{chk.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(chk)}
                      className="p-1 rounded-lg text-indigo-700 hover:text-indigo-900 transition text-xs font-black cursor-pointer"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(chk.id)}
                      className="p-1 rounded-lg text-rose-600 hover:text-rose-800 transition text-xs font-black cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-extrabold">{chk.description || 'بدون توضیح'}</p>
                <span className="inline-block text-[10px] text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full font-black">
                  شامل {chk.fields.length} سوال
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
};
