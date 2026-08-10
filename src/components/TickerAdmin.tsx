import React, { useState, useEffect } from 'react';
import { ArrowRight, Megaphone, Plus, Trash2, Edit2, CheckCircle2, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { Announcement } from '../types';
import { DataAccessLayer } from '../services/dal';
import { RichTextEditor } from './RichTextEditor';

interface TickerAdminProps {
  onBack: () => void;
}

export const TickerAdmin: React.FC<TickerAdminProps> = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [speed, setSpeed] = useState(25);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const list = await DataAccessLayer.getAnnouncements();
    setAnnouncements(list);
  };

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContentHtml(ann.content);
    setIsActive(ann.isActive);
    setSpeed(ann.speed || 25);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این اطلاعیه اطمینان دارید؟')) {
      await DataAccessLayer.deleteAnnouncement(id);
      loadAnnouncements();
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContentHtml('');
    setIsActive(true);
    setSpeed(25);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentHtml.trim()) {
      alert('لطفاً متن اطلاعیه را وارد کنید.');
      return;
    }

    await DataAccessLayer.saveAnnouncement({
      id: editingId || undefined,
      title: title || 'اطلاعیه ایمنی',
      content: contentHtml,
      isActive,
      priority: 'high',
      speed: Number(speed) || 25,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    resetForm();
    loadAnnouncements();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-indigo-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-amber-500" />
            <span>مدیریت نوار اطلاع‌رسانی متحرک (Ticker News)</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-bold">
            تنظیم و ویرایش متون روان صفحه اصلی با امکانات کامل ورد (Rich Text)
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-black shadow-sm transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به پنل مدیریت</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form Column */}
        <div className="lg:col-span-2 bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl space-y-6 text-slate-900">
          <h3 className="text-lg font-black text-slate-900 border-b-2 border-slate-200 pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            <span>{editingId ? 'ویرایش اطلاعیه متحرک' : 'تعریف اطلاعیه جدید نوار'}</span>
          </h3>

          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>اطلاعیه با موفقیت ذخیره و در نوار متحرک فعال شد.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                عنوان یا موضوع اطلاعیه
              </label>
              <input
                type="text"
                placeholder="مثلاً: اطلاعیه مهم کنترل عفونت یا تحویل دارویی"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  سرعت حرکت نوار (ثانیه)
                </label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 font-bold block mt-1">
                  زمان انجام یک دور چرخش کامل (کمتر = سریع‌تر)
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  وضعیت نمایش در نوار
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full py-2.5 px-4 rounded-2xl border-2 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isActive ? 'فعال (در حال پخش در نوار)' : 'غیرفعال (مخفی)'}</span>
                </button>
              </div>
            </div>

            {/* Rich Text Editor for Word features */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                متن اطلاعیه (فرمت‌های ورد شامل رنگ، برجسته‌سازی و لینک)
              </label>
              <RichTextEditor value={contentHtml} onChange={setContentHtml} />
            </div>

            {/* Live Preview Box */}
            {contentHtml && (
              <div className="p-4 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-2xl border-2 border-indigo-300 text-white space-y-1">
                <span className="text-[10px] font-black text-amber-300 block">
                  پیش‌نمایش ظاهر متن در نوار:
                </span>
                <div
                  className="text-xs sm:text-sm font-bold text-cyan-100"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-800 text-xs font-black cursor-pointer hover:bg-slate-200"
                >
                  انصراف
                </button>
              )}
              <button
                type="submit"
                className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 text-white font-black text-xs shadow-md transition cursor-pointer"
              >
                {editingId ? 'بروزرسانی اطلاعیه' : 'انتشار در نوار متحرک'}
              </button>
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <span>اطلاعیه‌های ثبت‌شده ({announcements.length})</span>
          </h3>

          {announcements.length === 0 ? (
            <div className="py-12 text-center text-slate-800 font-black text-sm bg-white rounded-3xl border-2 border-indigo-200 shadow-md">
              هنوز اطلاعیه‌ای ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-lg space-y-3 relative group text-slate-900"
                >
                  <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                    <span className="font-black text-slate-900 text-sm">{ann.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(ann)}
                        className="p-1.5 rounded-lg text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 transition cursor-pointer"
                        title="ویرایش"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="text-xs text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-24 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: ann.content }}
                  />

                  <div className="flex items-center justify-between text-[11px] font-black text-slate-600 pt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        ann.isActive
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : 'bg-rose-100 text-rose-950 border border-rose-300'
                      }`}
                    >
                      {ann.isActive ? 'فعال' : 'مخفی'}
                    </span>
                    <span>سرعت: {ann.speed || 25} ثانیه</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
