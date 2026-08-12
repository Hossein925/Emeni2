import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  FolderPlus,
  FileText,
  UserCheck,
  Pill,
  ShieldAlert,
  MessageSquareText,
  Hand,
  Clock,
  ChevronLeft,
  X,
  Activity,
  Stethoscope,
  HeartPulse,
  Syringe,
  Thermometer,
  Brain,
  Microscope,
  Hospital,
  ClipboardList,
  AlertTriangle,
  FileSpreadsheet,
  GraduationCap,
  Award,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { EducationCategory, EducationTopic } from '../types';
import { DataAccessLayer, subscribeToDALChanges } from '../services/dal';
import { RichTextEditor } from './RichTextEditor';
import { ConfirmModal } from './ConfirmModal';

interface EducationAdminProps {
  onBack: () => void;
}

const COLOR_PRESETS = [
  { name: 'آبی - نیلی', class: 'from-blue-600 to-indigo-700' },
  { name: 'فیروزه‌ای - سورمه‌ای', class: 'from-cyan-600 to-blue-800' },
  { name: 'زمردی - سبز', class: 'from-emerald-600 to-teal-700' },
  { name: 'بنفش - ارغوانی', class: 'from-indigo-600 to-purple-700' },
  { name: 'نارنجی - کهربایی', class: 'from-amber-600 to-orange-700' },
  { name: 'قرمز - رز', class: 'from-rose-600 to-red-700' },
  { name: 'یاقوتی - سرخ تیره', class: 'from-red-600 to-rose-800' },
  { name: 'یاسی - بنفش روشن', class: 'from-fuchsia-600 to-pink-700' },
  { name: 'نیلی - بنفش شب', class: 'from-violet-600 to-indigo-900' },
  { name: 'آبی آسمانی - فیروزه‌ای', class: 'from-sky-500 to-cyan-700' },
  { name: 'سبز لیمویی - زیتونی', class: 'from-lime-600 to-emerald-800' },
  { name: 'زرد طلایی - کهربایی', class: 'from-yellow-500 to-amber-700' },
  { name: 'ارغوانی - یاسمنی', class: 'from-pink-600 to-rose-700' },
  { name: 'سربی - زغالی', class: 'from-slate-700 to-zinc-900' },
  { name: 'سبز کله‌غازی - آبی تیرگی', class: 'from-teal-600 to-cyan-900' },
];

const ICON_PRESETS = [
  { id: 'UserCheck', label: 'شناسایی و هویت بیمار', icon: UserCheck },
  { id: 'Pill', label: 'دارو و درمان', icon: Pill },
  { id: 'ShieldAlert', label: 'ایمنی و هشدار بالینی', icon: ShieldAlert },
  { id: 'MessageSquareText', label: 'ارتباطات و ISBAR', icon: MessageSquareText },
  { id: 'Hand', label: 'بهداشت دست و کنترل عفونت', icon: Hand },
  { id: 'Activity', label: 'علائم حیاتی و پایش', icon: Activity },
  { id: 'Stethoscope', label: 'معاینات پزشکی و پرستاری', icon: Stethoscope },
  { id: 'HeartPulse', label: 'قلب و عروق / اورژانس', icon: HeartPulse },
  { id: 'Syringe', label: 'تزریقات و ایمن‌سازی', icon: Syringe },
  { id: 'Thermometer', label: 'تب و عفونت', icon: Thermometer },
  { id: 'Brain', label: 'مغز و اعصاب / سکته', icon: Brain },
  { id: 'Microscope', label: 'آزمایشگاه و پاراکلینیک', icon: Microscope },
  { id: 'Hospital', label: 'بخش و بیمارستان', icon: Hospital },
  { id: 'ClipboardList', label: 'چک‌لیست و پرونده', icon: ClipboardList },
  { id: 'AlertTriangle', label: 'گزارش خطا و حوادث', icon: AlertTriangle },
  { id: 'FileSpreadsheet', label: 'مستندسازی و فرم‌ها', icon: FileSpreadsheet },
  { id: 'GraduationCap', label: 'آموزش و پژوهش', icon: GraduationCap },
  { id: 'Award', label: 'اعتباربخشی و کیفیت', icon: Award },
  { id: 'Flame', label: 'کد قرمز و ایمنی حریق', icon: Flame },
  { id: 'Zap', label: 'اورژانس و شوک', icon: Zap },
  { id: 'ShieldCheck', label: 'ارزیابی و ایمنی بیمار', icon: ShieldCheck },
  { id: 'Layers', label: 'عمومی و سایر موارد', icon: Layers },
];

export const EducationAdmin: React.FC<EducationAdminProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [topics, setTopics] = useState<EducationTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EducationCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Category Form Modal/State
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catTitle, setCatTitle] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catColor, setCatColor] = useState(COLOR_PRESETS[0].class);
  const [catIcon, setCatIcon] = useState('Layers');

  // Topic Form State
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [topicReadingTime, setTopicReadingTime] = useState('۳ دقیقه');
  const [contentHtml, setContentHtml] = useState('');

  useEffect(() => {
    loadAll();
    const unsubscribe = subscribeToDALChanges(() => {
      loadAll(true);
    });
    return () => unsubscribe();
  }, []);

  const loadAll = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const [catData, topicData] = await Promise.all([
      DataAccessLayer.getEducationCategories(),
      DataAccessLayer.getEducationTopics(),
    ]);
    setCategories(catData);
    setTopics(topicData);
    setLoading(false);
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitle.trim()) {
      alert('لطفاً عنوان دسته‌بندی را وارد نمایید.');
      return;
    }

    const savedCat = await DataAccessLayer.saveEducationCategory({
      id: editingCatId || undefined,
      title: catTitle.trim(),
      description: catDescription.trim(),
      color: catColor,
      iconName: catIcon,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    // Reset Category Form
    setEditingCatId(null);
    setCatTitle('');
    setCatDescription('');
    setShowCategoryForm(false);
    
    // Refresh list
    await loadAll();

    // If editing currently selected category, update state
    if (selectedCategory && selectedCategory.id === savedCat.id) {
      setSelectedCategory(savedCat);
    }
  };

  const handleEditCategory = (cat: EducationCategory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCatId(cat.id);
    setCatTitle(cat.title);
    setCatDescription(cat.description || '');
    setCatColor(cat.color || COLOR_PRESETS[0].class);
    setCatIcon(cat.iconName || 'Layers');
    setShowCategoryForm(true);
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

  const handleDeleteCategory = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const topicCount = topics.filter((t) => t.categoryId === catId).length;
    const msg = topicCount > 0
      ? `این دسته‌بندی دارای ${topicCount} سرفصل آموزشی زیرمجموعه است. با حذف این دسته‌بندی، تمام سرفصل‌های آن نیز حذف خواهند شد. آیا مطمئن هستید؟`
      : 'آیا از حذف این دسته‌بندی اصلی اطمینان دارید؟';

    setConfirmModal({
      isOpen: true,
      title: 'حذف دسته‌بندی آموزشی',
      message: msg,
      onConfirm: async () => {
        await DataAccessLayer.deleteEducationCategory(catId);
        if (selectedCategory?.id === catId) {
          setSelectedCategory(null);
        }
        loadAll();
      },
    });
  };

  // --- Topic Handlers ---
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert('لطفاً ابتدا یک دسته‌بندی را انتخاب کنید.');
      return;
    }
    if (!topicTitle.trim()) {
      alert('لطفاً عنوان سرفصل آموزشی را وارد نمایید.');
      return;
    }

    await DataAccessLayer.saveEducationTopic({
      id: editingTopicId || undefined,
      categoryId: selectedCategory.id,
      categoryTitle: selectedCategory.title,
      title: topicTitle.trim(),
      summary: topicSummary.trim(),
      readingTime: topicReadingTime.trim(),
      content: contentHtml,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    // Reset Topic Form
    setEditingTopicId(null);
    setTopicTitle('');
    setTopicSummary('');
    setContentHtml('');
    loadAll();
  };

  const handleEditTopic = (t: EducationTopic) => {
    setEditingTopicId(t.id);
    setTopicTitle(t.title);
    setTopicSummary(t.summary || '');
    setTopicReadingTime(t.readingTime || '۳ دقیقه');
    setContentHtml(t.content);
  };

  const handleDeleteTopic = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف سرفصل آموزشی',
      message: 'آیا از حذف این سرفصل آموزشی اطمینان دارید؟',
      onConfirm: async () => {
        await DataAccessLayer.deleteEducationTopic(id);
        loadAll();
      },
    });
  };

  const currentCategoryTopics = selectedCategory
    ? topics.filter((t) => t.categoryId === selectedCategory.id)
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-200/60" dir="rtl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedCategory) {
                setSelectedCategory(null);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-slate-950" />
            <span>بازگشت</span>
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-indigo-700 mb-1">
              <span onClick={() => setSelectedCategory(null)} className="cursor-pointer hover:underline">
                مدیریت آموزش ایمنی بیمار
              </span>
              {selectedCategory && (
                <>
                  <span>/</span>
                  <span className="text-slate-800">{selectedCategory.title}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
              <BookOpenCheck className="w-7 h-7 text-cyan-600" />
              {selectedCategory ? `مدیریت سرفصل‌های ${selectedCategory.title}` : 'مدیریت دسته‌بندی‌های آموزش ایمنی بیمار'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
              {selectedCategory
                ? 'در این بخش می‌توانید سرفصل‌های آموزشی این دسته‌بندی را ثبت، ویرایش یا حذف نمایید.'
                : 'جهت افزودن یا ویرایش سرفصل‌های آموزشی، ابتدا وارد دسته‌بندی مربوطه شوید.'}
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>تغییرات با موفقیت ذخیره و در بخش عمومی منتشر گردید.</span>
        </div>
      )}

      {/* LEVEL 1: List of Main Categories (Drill-down view) */}
      {!selectedCategory ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-2 border-indigo-100 rounded-3xl p-5 shadow-md">
            <div>
              <h3 className="text-base font-black text-slate-900">دسته‌بندی‌های اصلی آموزش ({categories.length})</h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">روی هر دسته‌بندی کلیک کنید تا سرفصل‌های آموزشی آن را مدیریت کنید.</p>
            </div>
            <button
              onClick={() => {
                setEditingCatId(null);
                setCatTitle('');
                setCatDescription('');
                setShowCategoryForm(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-white font-black text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>تعریف دسته‌بندی اصلی جدید</span>
            </button>
          </div>

          {/* New/Edit Category Form Collapsible or Card */}
          {showCategoryForm && (
            <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl space-y-5 text-slate-900 animate-fadeIn relative">
              <button
                onClick={() => setShowCategoryForm(false)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-black text-indigo-950 border-b-2 border-slate-100 pb-3 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <span>{editingCatId ? 'ویرایش دسته‌بندی اصلی' : 'افزودن دسته‌بندی اصلی جدید'}</span>
              </h3>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    عنوان دسته‌بندی <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: شناسایی بیمار یا داروهای پرخطر"
                    value={catTitle}
                    onChange={(e) => setCatTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    توضیح کوتاه
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: دستورالعمل‌ها و پروتکل‌های انطباق هویت و دستبند شناسه بیمار"
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Color preset selection */}
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    رنگ کارت دسته‌بندی
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.class}
                        type="button"
                        onClick={() => setCatColor(p.class)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-black text-white bg-gradient-to-r ${p.class} transition cursor-pointer ${
                          catColor === p.class ? 'ring-4 ring-indigo-400 scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon selection */}
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    آیکون نمادین
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_PRESETS.map((ico) => {
                      const IconComp = ico.icon;
                      return (
                        <button
                          key={ico.id}
                          type="button"
                          onClick={() => setCatIcon(ico.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                            catIcon === ico.id
                              ? 'bg-indigo-950 text-white border-indigo-950 ring-2 ring-indigo-400 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                          <span>{ico.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-800 text-xs font-black cursor-pointer hover:bg-slate-200"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 text-white font-black text-xs shadow-md transition cursor-pointer"
                  >
                    {editingCatId ? 'بروزرسانی دسته‌بندی' : 'ذخیره دسته‌بندی جدید'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid of Categories */}
          {loading ? (
            <div className="py-16 text-center text-indigo-950 font-bold text-sm">در حال دریافت دسته‌بندی‌ها...</div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center text-indigo-950 font-bold text-sm bg-white rounded-3xl border border-indigo-100 shadow-md">
              هنوز دسته‌بندی اصلی تعریف نشده است. جهت شروع، دکمه «تعریف دسته‌بندی اصلی جدید» را بزنید.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const topicCount = topics.filter((t) => t.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`group bg-gradient-to-br ${cat.color || 'from-blue-600 to-indigo-700'} rounded-3xl p-5 text-white shadow-xl border-2 border-white/20 hover:border-amber-300 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1 relative`}
                  >
                    <div className="flex items-start justify-between border-b border-white/20 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-black/30 text-white border border-white/20 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                          {topicCount} سرفصل
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleEditCategory(cat, e)}
                          className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 transition text-xs"
                          title="ویرایش دسته‌بندی"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCategory(cat.id, e)}
                          className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 transition text-xs"
                          title="حذف دسته‌بندی"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-white text-lg mb-1">{cat.title}</h4>
                      <p className="text-xs text-cyan-100/90 font-bold line-clamp-2">
                        {cat.description || 'برای مدیریت سرفصل‌های آموزشی کلیک کنید.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-black text-amber-300">
                      <span>ورود و مدیریت سرفصل‌ها</span>
                      <ChevronLeft className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* LEVEL 2: Detailed Category Topics Management (Inside Selected Category) */
        <div className="space-y-8 animate-fadeIn">
          {/* Selected Category Header Card */}
          <div className={`p-6 rounded-3xl bg-gradient-to-r ${selectedCategory.color || 'from-blue-900 to-slate-900'} text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 border border-white/30 text-white font-black px-3 py-0.5 rounded-full">
                  دسته‌بندی اصلی
                </span>
              </div>
              <h3 className="text-xl font-black text-white">{selectedCategory.title}</h3>
              <p className="text-xs text-cyan-100/90 font-bold">
                {selectedCategory.description || 'سرفصل‌های آموزشی این دسته‌بندی را در فرم زیر مدیریت کنید.'}
              </p>
            </div>

            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-black transition cursor-pointer shrink-0"
            >
              <span>تغییر دسته‌بندی</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form for Creating / Editing Topic in this Category */}
            <div className="lg:col-span-2 bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl space-y-6 text-slate-900">
              <h3 className="text-base font-black text-slate-900 border-b-2 border-slate-200 pb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>
                  {editingTopicId
                    ? 'ویرایش سرفصل آموزشی'
                    : `افزودن سرفصل آموزشی جدید به «${selectedCategory.title}»`}
                </span>
              </h3>

              <form onSubmit={handleSaveTopic} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    عنوان سرفصل آموزشی <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: دستبند شناسایی بیمار یا شناسایی فعال"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1.5">
                      خلاصه کوتاه
                    </label>
                    <input
                      type="text"
                      placeholder="خلاصه کوتاه جهت نمایش در کارت سرفصل"
                      value={topicSummary}
                      onChange={(e) => setTopicSummary(e.target.value)}
                      className="w-full px-4 py-2 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1.5">
                      مدت زمان تخمینی مطالعه
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: ۳ دقیقه"
                      value={topicReadingTime}
                      onChange={(e) => setTopicReadingTime(e.target.value)}
                      className="w-full px-4 py-2 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    محتوای متنی، تصاویر و ویدیوهای آموزشی
                  </label>
                  <RichTextEditor value={contentHtml} onChange={setContentHtml} />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  {editingTopicId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTopicId(null);
                        setTopicTitle('');
                        setTopicSummary('');
                        setContentHtml('');
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
                    {editingTopicId ? 'بروزرسانی سرفصل آموزشی' : 'ذخیره و انتشار سرفصل'}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Topics inside this Category */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-base font-black text-indigo-950">
                سرفصل‌های ثبت‌شده ({currentCategoryTopics.length})
              </h3>

              {currentCategoryTopics.length === 0 ? (
                <div className="py-12 text-center text-indigo-950 font-bold text-sm bg-white rounded-3xl border border-indigo-100 shadow-md">
                  هنوز سرفصل آموزشی برای این دسته‌بندی ثبت نشده است. از فرم روبرو جهت ثبت اولین سرفصل استفاده کنید.
                </div>
              ) : (
                currentCategoryTopics.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border-2 border-indigo-100 rounded-3xl p-4 shadow-md space-y-2 text-slate-900"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-black text-slate-900 text-sm leading-snug">{t.title}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditTopic(t)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition text-xs text-slate-700"
                          title="ویرایش سرفصل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(t.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition text-xs text-rose-600"
                          title="حذف سرفصل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {t.summary && (
                      <p className="text-xs text-slate-600 font-bold line-clamp-2">
                        {t.summary}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-500 font-bold pt-1 flex justify-between">
                      <span>زمان مطالعه: {t.readingTime || '۳ دقیقه'}</span>
                      <span>بروزرسانی: {t.updatedAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
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
