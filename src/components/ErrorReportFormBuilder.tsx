import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  Edit3,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  FileText,
  ListPlus,
  Smile,
  Frown,
  Meh,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import { Checklist, ChecklistField } from '../types';
import { DataAccessLayer } from '../services/dal';

interface ErrorReportFormBuilderProps {
  onSaved?: () => void;
}

const DEFAULT_SECTIONS = [
  'اطلاعات کلی حادثه',
  'دسته‌بندی و نوع خطا',
  'پیامد و شدت حادثه',
  'علل وقوع و پیشنهادها',
];

export const ErrorReportFormBuilder: React.FC<ErrorReportFormBuilderProps> = ({ onSaved }) => {
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [title, setTitle] = useState('فرم عمومی گزارش خطای پزشکی و ایمنی بیمار');
  const [description, setDescription] = useState(
    'فرم ثبت و گزارش‌دهی آنلاین حوادث ناخواسته درمانی، دارویی، سقوط و تجهیزات پزشکی توسط پرسنل'
  );
  const [showNonPunitiveNotice, setShowNonPunitiveNotice] = useState(true);
  const [nonPunitiveNoticeText, setNonPunitiveNoticeText] = useState(
    'هدف از این گزارش، ریشه‌یابی سیستماتیک خطاها و جلوگیری از تکرار مجدد آن است. ثبت این گزارش غیرتنبیهی (Non-Punitive) بوده و اختیاری بودن درج نام گزارش‌دهنده کاملاً محرمانه باقی می‌ماند.'
  );

  const [fields, setFields] = useState<ChecklistField[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [saving, setSaving] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    loadExistingForm();
  }, []);

  const loadExistingForm = async () => {
    const chklists = await DataAccessLayer.getChecklists('error_report');
    if (chklists.length > 0) {
      const existing = chklists[0];
      setChecklistId(existing.id);
      setTitle(existing.title || 'فرم عمومی گزارش خطای پزشکی و ایمنی بیمار');
      setDescription(
        existing.description ||
          'فرم ثبت و گزارش‌دهی آنلاین حوادث ناخواسته درمانی، دارویی، سقوط و تجهیزات پزشکی توسط پرسنل'
      );
      if (existing.showNonPunitiveNotice !== undefined) {
        setShowNonPunitiveNotice(existing.showNonPunitiveNotice);
      }
      if (existing.nonPunitiveNoticeText) {
        setNonPunitiveNoticeText(existing.nonPunitiveNoticeText);
      }
      if (existing.fields && existing.fields.length > 0) {
        setFields(existing.fields);
      } else {
        loadMoHStandardPreset();
      }
    } else {
      loadMoHStandardPreset();
    }
  };

  const loadMoHStandardPreset = () => {
    const standardFields: ChecklistField[] = [
      {
        id: `f-${Date.now()}-1`,
        label: 'تاریخ و زمان دقیق وقوع یا کشف حادثه',
        type: 'date',
        section: 'اطلاعات کلی حادثه',
        required: true,
        placeholder: 'مثلاً ۱۴۰۳/۰۵/۱۵ - ساعت ۱۰:۳۰',
        helpText: 'تاریخ و زمان تقریبی بروز حادثه یا زمان کشف خطای نزدیک به وقوع',
      },
      {
        id: `f-${Date.now()}-2`,
        label: 'وضعیت بیمار در زمان وقوع حادثه',
        type: 'mc',
        options: ['بستری در بخش', 'سرپایی / پاراکلینیک', 'در حال انتقال داخل بیمارستان', 'ترخیص شده'],
        section: 'اطلاعات کلی حادثه',
        required: false,
      },
      {
        id: `f-${Date.now()}-3`,
        label: 'دسته‌بندی اصلی خطای رخ‌داده یا نزدیک به وقوع (Near Miss)',
        type: 'mc',
        options: [
          'خطای دارویی (تجویز، دوز، زمان، داروی مشابه)',
          'سقوط بیمار از تخت یا حین جابه‌جایی',
          'اشتباه در شناسایی بیمار یا پرونده',
          'اشتباه در نمونه‌گیری / آزمایشگاه / گرافی',
          'نقص عملکرد تجهیزات و ملزومات پزشکی',
          'عوارض ناخواسته تزریق خون و فرآورده‌ها',
          'تاخیر در ویزیت یا ارائه خدمات درمانی',
          'سایر حوادث ناخواسته',
        ],
        section: 'دسته‌بندی و نوع خطا',
        required: true,
      },
      {
        id: `f-${Date.now()}-4`,
        label: 'مرحله وقوع یا کشف خطا',
        type: 'select',
        options: [
          'مرحله دستور یا تجویز پزشک',
          'مرحله ثبت و انتقال دستورات در پرونده/سیستم',
          'مرحله تحویل و آماده‌سازی دارو یا تجهیزات',
          'مرحله تجویز به بیمار (Administration)',
          'مرحله پایش پس از اقدام درمانی',
        ],
        section: 'دسته‌بندی و نوع خطا',
        required: false,
      },
      {
        id: `f-${Date.now()}-5`,
        label: 'آیا خطا به بیمار صدمه یا آسیب وارد کرده است؟',
        type: 'yesno',
        section: 'پیامد و شدت حادثه',
        required: true,
      },
      {
        id: `f-${Date.now()}-6`,
        label: 'ارزیابی کیفی درجه شدت حادثه',
        type: 'rating',
        section: 'پیامد و شدت حادثه',
        required: true,
        helpText: 'از ۱ (خطای نزدیک به وقوع / بدون آسیب) تا ۵ (صدمه بسیار شدید یا مرگ‌آور)',
      },
      {
        id: `f-${Date.now()}-7`,
        label: 'شرح کامل و دقیق نحوه وقوع حادثه',
        type: 'textarea',
        section: 'علل وقوع و پیشنهادها',
        required: true,
        placeholder: 'توضیحات کامل درباره جزییات وقوع، اقدامات فوری انجام‌شده و وضعیت فعلی بیمار را بنویسید...',
      },
      {
        id: `f-${Date.now()}-8`,
        label: 'علل احتمالی و زمینه‌ساز بروز این خطا (امکان انتخاب چندگانه)',
        type: 'checkbox_group',
        options: [
          'خستگی / کمبود نیروی انسانی',
          'تشابه اسامی داروها یا بیماران',
          'نقص یا خرابی دستگاه و تجهیزات',
          'عدم رعایت پروتکل‌ها و دستورالعمل‌ها',
          'نقص در ارتباطات شفاهی یا کتبی کادر درمان',
          'شلوغی و ازدحام بخش',
        ],
        section: 'علل وقوع و پیشنهادها',
        required: false,
      },
      {
        id: `f-${Date.now()}-9`,
        label: 'پیشنهاد یا راهکار اصلاحی شما برای جلوگیری از تکرار مجدد',
        type: 'textarea',
        section: 'علل وقوع و پیشنهادها',
        required: false,
        placeholder: 'راهکار پیشنهادی شما جهت مطرح‌شدن و بررسی در کمیته ایمنی بیمار...',
      },
    ];
    setFields(standardFields);
  };

  const handleAddField = (sectionName?: string) => {
    const newField: ChecklistField = {
      id: `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: 'عنوان سوال جدید',
      type: 'yesno',
      section: sectionName || DEFAULT_SECTIONS[0],
      required: true,
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleDuplicateField = (index: number) => {
    const fieldToDup = fields[index];
    const dup: ChecklistField = {
      ...fieldToDup,
      id: `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: `${fieldToDup.label} (رونوشت)`,
    };
    const updated = [...fields];
    updated.splice(index + 1, 0, dup);
    setFields(updated);
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFields((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    setFields((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleFieldChange = (index: number, key: keyof ChecklistField, val: any) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const handleOptionChange = (fieldIndex: number, optionIndex: number, newVal: string) => {
    setFields((prev) => {
      const copy = [...prev];
      const opts = [...(copy[fieldIndex].options || [])];
      opts[optionIndex] = newVal;
      copy[fieldIndex] = { ...copy[fieldIndex], options: opts };
      return copy;
    });
  };

  const handleAddOption = (fieldIndex: number) => {
    setFields((prev) => {
      const copy = [...prev];
      const opts = [...(copy[fieldIndex].options || [])];
      opts.push(`گزینه ${opts.length + 1}`);
      copy[fieldIndex] = { ...copy[fieldIndex], options: opts };
      return copy;
    });
  };

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    setFields((prev) => {
      const copy = [...prev];
      const opts = (copy[fieldIndex].options || []).filter((_, i) => i !== optionIndex);
      copy[fieldIndex] = { ...copy[fieldIndex], options: opts };
      return copy;
    });
  };

  const handleSaveForm = async () => {
    if (!title.trim()) {
      alert('لطفاً عنوان فرم را وارد کنید.');
      return;
    }

    const validFields = fields.filter((f) => f.label.trim());
    if (validFields.length === 0) {
      alert('لطفاً حداقل یک سوال برای فرم گزارش خطا تعریف کنید.');
      return;
    }

    setSaving(true);
    try {
      await DataAccessLayer.saveChecklist({
        id: checklistId || undefined,
        title: title.trim(),
        category: 'error_report',
        description: description.trim(),
        showNonPunitiveNotice,
        nonPunitiveNoticeText: nonPunitiveNoticeText.trim(),
        fields: validFields,
      });

      setSavedSuccessMsg('فرم گزارش خطا با موفقیت ذخیره و در کاشی گزارش خطای بیمارستان منتشر گردید.');
      setTimeout(() => setSavedSuccessMsg(''), 4000);
      if (onSaved) onSaved();
    } catch (err) {
      alert('خطایی در ذخیره‌سازی فرم رخ داد.');
    } finally {
      setSaving(false);
    }
  };

  // Group fields by section for rendering
  const groupedSections = fields.reduce<Record<string, { field: ChecklistField; originalIndex: number }[]>>(
    (acc, field, idx) => {
      const sec = field.section || 'سوالات عمومی';
      if (!acc[sec]) acc[sec] = [];
      acc[sec].push({ field, originalIndex: idx });
      return acc;
    },
    {}
  );

  return (
    <div className="w-full space-y-6 text-slate-900 text-right">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-400/50 rounded-3xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 mb-1">
            <Edit3 className="w-4 h-4 text-amber-300" />
            <span>طراح و ویراستار پیشرفته فرم گزارش خطا</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            طراحی و سفارشی‌سازی فرم ثبت گزارش خطای بیمارستان
          </h3>
          <p className="text-xs text-cyan-200 font-bold mt-1">
            تمامی تغییرات و سوالات تعریف‌شده در این بخش به‌صورت زنده در کاشی «گزارش خطای بیمارستان» برای کادر درمان ظاهر خواهد شد.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadMoHStandardPreset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-900/80 hover:bg-indigo-800 text-cyan-200 border border-indigo-400/40 font-black text-xs transition cursor-pointer shadow-md"
            title="بارگذاری سوالات استاندارد وزارت بهداشت"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>بارگذاری قالب استاندارد</span>
          </button>

          <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/20">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'builder'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>ویرایش سوالات</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>پیش‌نمایش زنده</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveForm}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer ring-2 ring-emerald-300/40"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'در حال ذخیره‌سازی...' : 'انتشار و ذخیره نهایی فرم'}</span>
          </button>
        </div>
      </div>

      {savedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-xs font-black flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Main Content Body */}
      {activeTab === 'builder' ? (
        <div className="space-y-6">
          {/* Header & Notice Configuration Box */}
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-black text-slate-900 border-b-2 border-slate-200 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>تنظیمات عمومی و بیانیه فرم گزارش خطا</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  عنوان اصلی فرم در صفحه گزارش خطا <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-black text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثلاً: فرم عمومی گزارش خطای پزشکی و ایمنی بیمار"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">توضیحات کوتاه زیر عنوان</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="توضیحات راهنما برای پرسنل..."
                />
              </div>
            </div>

            {/* Non-Punitive Notice Configuration */}
            <div className="p-4 bg-rose-50/90 rounded-2xl border-2 border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-black text-rose-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNonPunitiveNotice}
                    onChange={(e) => setShowNonPunitiveNotice(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                  <span>نمایش کادر اطلاعیه «سیستم گزارش‌دهی غیرتنبیهی (Non-Punitive)» در بالای فرم</span>
                </label>
              </div>

              {showNonPunitiveNotice && (
                <div>
                  <label className="block text-[11px] font-black text-rose-900 mb-1">
                    متن بیانیه تضمین محرمانگی و عدم تنبیه:
                  </label>
                  <textarea
                    rows={2}
                    value={nonPunitiveNoticeText}
                    onChange={(e) => setNonPunitiveNoticeText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-rose-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Questions Builder & Section Grouping */}
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-indigo-600" />
                  <span>طراحی و مدیریت سوالات فرم ({fields.length} سوال)</span>
                </h4>
                <p className="text-xs text-slate-700 font-bold mt-1">
                  می‌توانید سوالات را به بخش‌های مختلف گروه‌بندی کرده، نوع پاسخ را تغییر داده یا ترتیبات را تنظیم نمایید.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddField()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن سوال جدید</span>
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="py-12 text-center text-slate-700 font-bold text-sm bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-3">
                <p>هیچ سوالی تعریف نشده است.</p>
                <button
                  type="button"
                  onClick={loadMoHStandardPreset}
                  className="px-4 py-2 rounded-xl bg-indigo-100 text-indigo-900 font-black text-xs hover:bg-indigo-200"
                >
                  بارگذاری فرم استاندارد پیشنهادی
                </button>
              </div>
            ) : (
              (Object.entries(groupedSections) as [string, { field: ChecklistField; originalIndex: number }[]][]).map(([secName, items]) => (
                <div key={secName} className="space-y-4">
                  {/* Section Title Header */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-sky-100 via-indigo-50 to-slate-100 px-4 py-2.5 rounded-2xl border-2 border-sky-300">
                    <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                      بخش: {secName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddField(secName)}
                      className="text-xs font-black text-indigo-800 hover:text-indigo-950 flex items-center gap-1 bg-white px-3 py-1 rounded-xl border border-indigo-200 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن سوال به این بخش</span>
                    </button>
                  </div>

                  {/* Question Cards inside Section */}
                  <div className="space-y-4 pr-2 sm:pr-4">
                    {items.map(({ field: f, originalIndex: idx }) => (
                      <div
                        key={f.id}
                        className="bg-slate-50/90 rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-sm hover:border-indigo-400 transition space-y-4"
                      >
                        {/* Top Bar of Card */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-black text-indigo-950">سوال شماره {idx + 1}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              title="انتقال به بالا"
                              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === fields.length - 1}
                              title="انتقال به پایین"
                              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateField(idx)}
                              title="تکثیر سوال"
                              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveField(idx)}
                              title="حذف سوال"
                              className="p-1.5 rounded-lg bg-white border border-slate-300 text-rose-600 hover:bg-rose-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Main Field Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-900 mb-1">
                              متن سوال <span className="text-rose-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={f.label}
                              onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                              className="w-full px-3.5 py-2 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black text-xs focus:ring-2 focus:ring-indigo-500"
                              placeholder="عنوان یا متن سوال..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">
                              دسته‌بندی / بخش مربوطه:
                            </label>
                            <input
                              type="text"
                              list={`sections-list-${idx}`}
                              value={f.section || 'اطلاعات کلی حادثه'}
                              onChange={(e) => handleFieldChange(idx, 'section', e.target.value)}
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                            <datalist id={`sections-list-${idx}`}>
                              {DEFAULT_SECTIONS.map((s) => (
                                <option key={s} value={s} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        {/* Field Type and Required Setting */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block font-black text-slate-900 mb-1">نوع پاسخ‌دهی:</label>
                            <select
                              value={f.type}
                              onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="yesno">بله / خیر (تک انتخابی)</option>
                              <option value="mc">چندگزینه‌ای / دکمه‌ای (تک انتخابی)</option>
                              <option value="checkbox_group">چند انتخابی (چک‌باکس‌های چندتایی)</option>
                              <option value="select">منوی کشویی (Dropdown)</option>
                              <option value="rating">شدت و درجه‌بندی (۱ تا ۵ با آیکون)</option>
                              <option value="text">پاسخ متنی کوتاه</option>
                              <option value="textarea">توضیحات تشریحی چندسطری</option>
                              <option value="date">تاریخ / زمان وقوع</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-black text-slate-900 mb-1">راهنمای سوال (زیر سوال):</label>
                            <input
                              type="text"
                              placeholder="توضیح اختیاری..."
                              value={f.helpText || ''}
                              onChange={(e) => handleFieldChange(idx, 'helpText', e.target.value)}
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 font-black text-slate-900 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!f.required}
                                onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                              />
                              <span>پاسخ به این سوال اجباری باشد</span>
                            </label>
                          </div>
                        </div>

                        {/* Options editor for MC, Checkbox Group, and Select */}
                        {['mc', 'checkbox_group', 'select'].includes(f.type) && (
                          <div className="p-3 bg-white rounded-xl border border-slate-300 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-900">گزینه‌های پاسخ‌دهی:</label>
                              <button
                                type="button"
                                onClick={() => handleAddOption(idx)}
                                className="text-[11px] font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>افزودن گزینه</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(f.options || []).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-black focus:bg-white"
                                  />
                                  {(f.options || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(idx, optIdx)}
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Placeholder editor for Text / Textarea / Date */}
                        {['text', 'textarea', 'date'].includes(f.type) && (
                          <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">
                              متن جای‌نگهدار (Placeholder داخل کادر):
                            </label>
                            <input
                              type="text"
                              value={f.placeholder || ''}
                              onChange={(e) => handleFieldChange(idx, 'placeholder', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold"
                              placeholder="مثلاً: توضیحات خود را بنویسید..."
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ================= LIVE PREVIEW TAB ================= */
        <div className="bg-slate-100 rounded-3xl p-4 sm:p-8 border-2 border-indigo-300/60 shadow-xl space-y-6">
          <div className="p-3 rounded-2xl bg-indigo-900 text-white text-xs font-black flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-300" />
              <span>پیش‌نمایش زنده فرم گزارش خطا (همانطور که پرسنل آن را خواهند دید)</span>
            </span>
            <span className="text-[11px] text-cyan-200">این یک پیش‌نمایش واقعی است</span>
          </div>

          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-indigo-950 flex items-center gap-2">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">{description}</p>
            </div>

            {showNonPunitiveNotice && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-950 leading-relaxed font-semibold">
                  <strong className="block text-sm font-black text-rose-900 mb-0.5">
                    اصول ایمنی: سیستم ثبت گزارش غیرتنبیهی (Non-Punitive)
                  </strong>
                  {nonPunitiveNoticeText}
                </div>
              </div>
            )}

            {/* Static Department Selector Simulation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  نام گزارش‌دهنده (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="در صورت تمایل وارد کنید..."
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-bold text-sm"
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  بخش محل وقوع حادثه <span className="text-rose-600">*</span>
                </label>
                <select className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold text-sm" disabled>
                  <option>بخش اورژانس</option>
                  <option>بخش آی‌سی‌یو (ICU)</option>
                  <option>بخش جراحی</option>
                </select>
              </div>
            </div>

            {/* Dynamic Questions Preview grouped by section */}
            {(Object.entries(groupedSections) as [string, { field: ChecklistField; originalIndex: number }[]][]).map(([secName, items]) => (
              <div key={secName} className="space-y-4 pt-4 border-t-2 border-slate-200">
                <h4 className="text-xs sm:text-sm font-black text-indigo-950 bg-sky-50 px-3.5 py-2 rounded-xl border border-sky-200 inline-block">
                  {secName}
                </h4>

                <div className="space-y-5">
                  {items.map(({ field: f, originalIndex: idx }) => (
                    <div key={f.id} className="p-4 bg-sky-50/70 rounded-2xl border-2 border-sky-200 space-y-2.5">
                      <label className="block text-xs sm:text-sm font-black text-slate-900">
                        {idx + 1}. {f.label} {f.required && <span className="text-rose-600">*</span>}
                      </label>
                      {f.helpText && <p className="text-[11px] text-slate-600 font-bold">{f.helpText}</p>}

                      {/* Interactive Controls in Preview */}
                      {f.type === 'mc' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(f.options || []).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPreviewAnswers((prev) => ({ ...prev, [f.id]: opt }))}
                              className={`p-2.5 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                                previewAnswers[f.id] === opt
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                                  : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {f.type === 'checkbox_group' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(f.options || []).map((opt) => {
                            const selectedOpts: string[] = Array.isArray(previewAnswers[f.id]) ? (previewAnswers[f.id] as string[]) : [];
                            const isSelected = selectedOpts.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const updated = isSelected
                                    ? selectedOpts.filter((o) => o !== opt)
                                    : [...selectedOpts, opt];
                                  setPreviewAnswers((prev) => ({ ...prev, [f.id]: updated }));
                                }}
                                className={`p-2.5 rounded-xl border-2 text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                    : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                <CheckSquare className="w-4 h-4" />
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {f.type === 'select' && (
                        <select
                          value={previewAnswers[f.id] || ''}
                          onChange={(e) => setPreviewAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-extrabold text-xs"
                        >
                          <option value="">انتخاب کنید...</option>
                          {(f.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {f.type === 'yesno' && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPreviewAnswers((prev) => ({ ...prev, [f.id]: 'بله' }))}
                            className={`px-6 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                              previewAnswers[f.id] === 'بله'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                                : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            بله
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewAnswers((prev) => ({ ...prev, [f.id]: 'خیر' }))}
                            className={`px-6 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                              previewAnswers[f.id] === 'خیر'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            خیر
                          </button>
                        </div>
                      )}

                      {f.type === 'rating' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setPreviewAnswers((prev) => ({ ...prev, [f.id]: lvl }))}
                              className={`px-3.5 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                                previewAnswers[f.id] === lvl
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                                  : 'bg-white text-slate-900 border-slate-300'
                              }`}
                            >
                              <span>درجه {lvl}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {f.type === 'text' && (
                        <input
                          type="text"
                          placeholder={f.placeholder || 'پاسخ را بنویسید...'}
                          value={previewAnswers[f.id] || ''}
                          onChange={(e) => setPreviewAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                        />
                      )}

                      {f.type === 'textarea' && (
                        <textarea
                          rows={3}
                          placeholder={f.placeholder || 'توضیحات کامل را وارد کنید...'}
                          value={previewAnswers[f.id] || ''}
                          onChange={(e) => setPreviewAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                        />
                      )}

                      {f.type === 'date' && (
                        <input
                          type="text"
                          placeholder={f.placeholder || 'مثلاً ۱۴۰۳/۰۵/۱۵'}
                          value={previewAnswers[f.id] || ''}
                          onChange={(e) => setPreviewAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
