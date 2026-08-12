import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Archive,
  Download,
  Trash2,
  Edit3,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Users,
  ShieldAlert,
  ArrowRight,
  Info,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FmeaReport, FmeaFailureModeItem } from '../types';
import { DataAccessLayer } from '../services/dal';
import { exportFmeaReportDocx } from '../utils/exportUtils';
import { toPersianDigits } from '../utils/jalali';
import { MedicalAiAnalyzerModal } from './MedicalAiAnalyzerModal';
import { ConfirmModal } from './ConfirmModal';

interface FmeaFormAdminProps {
  onBack?: () => void;
}

export const FmeaFormAdmin: React.FC<FmeaFormAdminProps> = ({ onBack }) => {
  const [subTab, setSubTab] = useState<'create' | 'archive'>('create');
  const [fmeaReports, setFmeaReports] = useState<FmeaReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const ITEMS_PER_PAGE = 15;

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState<any>(null);
  const [aiModalTitle, setAiModalTitle] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastSavedReport, setLastSavedReport] = useState<FmeaReport | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [departmentOrProcess, setDepartmentOrProcess] = useState('');
  const [teamLeader, setTeamLeader] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toLocaleDateString('fa-IR'));
  const [description, setDescription] = useState('');

  // Items State
  const [items, setItems] = useState<FmeaFailureModeItem[]>([
    {
      id: `item-1`,
      processStep: '',
      potentialFailureMode: '',
      potentialEffects: '',
      severity: 5,
      potentialCauses: '',
      occurrence: 3,
      currentControls: '',
      detection: 4,
      rpn: 60,
      recommendedActions: '',
      responsiblePerson: '',
    },
  ]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const data = await DataAccessLayer.getFmeaReports();
    setFmeaReports(data);
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setLastSavedReport(null);
    setSavedSuccess(false);
    setTitle('');
    setDepartmentOrProcess('');
    setTeamLeader('');
    setTeamMembers('');
    setAssessmentDate(new Date().toLocaleDateString('fa-IR'));
    setDescription('');
    setItems([
      {
        id: `item-${Date.now()}`,
        processStep: '',
        potentialFailureMode: '',
        potentialEffects: '',
        severity: 5,
        potentialCauses: '',
        occurrence: 3,
        currentControls: '',
        detection: 4,
        rpn: 60,
        recommendedActions: '',
        responsiblePerson: '',
      },
    ]);
  };

  const handleEditReport = (report: FmeaReport) => {
    setEditingId(report.id);
    setLastSavedReport(report);
    setSavedSuccess(false);
    setTitle(report.title || '');
    setDepartmentOrProcess(report.departmentOrProcess || '');
    setTeamLeader(report.teamLeader || '');
    setTeamMembers(report.teamMembers || '');
    setAssessmentDate(report.assessmentDate || new Date().toLocaleDateString('fa-IR'));
    setDescription(report.description || '');
    if (report.items && report.items.length > 0) {
      setItems(
        report.items.map((it) => ({
          ...it,
          id: it.id || `item-${Math.random()}`,
          severity: it.severity || 5,
          occurrence: it.occurrence || 3,
          detection: it.detection || 4,
          rpn: (it.severity || 5) * (it.occurrence || 3) * (it.detection || 4),
        }))
      );
    } else {
      setItems([
        {
          id: `item-${Date.now()}`,
          processStep: '',
          potentialFailureMode: '',
          potentialEffects: '',
          severity: 5,
          potentialCauses: '',
          occurrence: 3,
          currentControls: '',
          detection: 4,
          rpn: 60,
          recommendedActions: '',
          responsiblePerson: '',
        },
      ]);
    }
    setSubTab('create');
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

  const handleDeleteReport = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف آنالیز FMEA',
      message: 'آیا از حذف این آنالیز FMEA اطمینان دارید؟',
      onConfirm: async () => {
        await DataAccessLayer.deleteFmeaReport(id);
        if (editingId === id) {
          resetForm();
        }
        loadReports();
      },
    });
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length}`,
        processStep: '',
        potentialFailureMode: '',
        potentialEffects: '',
        severity: 5,
        potentialCauses: '',
        occurrence: 3,
        currentControls: '',
        detection: 4,
        rpn: 60,
        recommendedActions: '',
        responsiblePerson: '',
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof FmeaFailureModeItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const updatedItem = { ...copy[index], [field]: value };
      
      // Auto recalculate RPN if severity, occurrence, or detection changes
      if (field === 'severity' || field === 'occurrence' || field === 'detection') {
        const s = field === 'severity' ? Number(value) : updatedItem.severity;
        const o = field === 'occurrence' ? Number(value) : updatedItem.occurrence;
        const d = field === 'detection' ? Number(value) : updatedItem.detection;
        updatedItem.rpn = s * o * d;
      }
      
      copy[index] = updatedItem;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !departmentOrProcess.trim()) {
      alert('لطفاً عنوان آنالیز و نام بخش/فرایند را وارد کنید.');
      return;
    }

    const cleanedItems = items.map((it) => ({
      ...it,
      severity: Number(it.severity) || 1,
      occurrence: Number(it.occurrence) || 1,
      detection: Number(it.detection) || 1,
      rpn: (Number(it.severity) || 1) * (Number(it.occurrence) || 1) * (Number(it.detection) || 1),
    }));

    const saved = await DataAccessLayer.saveFmeaReport({
      id: editingId || undefined,
      title: title.trim(),
      departmentOrProcess: departmentOrProcess.trim(),
      teamLeader: teamLeader.trim(),
      teamMembers: teamMembers.trim(),
      assessmentDate: assessmentDate.trim(),
      description: description.trim(),
      items: cleanedItems,
    });

    setLastSavedReport(saved);
    setSavedSuccess(true);
    setEditingId(saved.id);
    loadReports();
  };

  const getRpnBadge = (rpn: number, severity: number) => {
    if (rpn >= 100 || severity >= 8) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          ریسک بالا ({toPersianDigits(rpn)})
        </span>
      );
    }
    if (rpn >= 40) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ریسک متوسط ({toPersianDigits(rpn)})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ریسک پایین ({toPersianDigits(rpn)})
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 rounded-3xl border-2 border-emerald-400/30 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>مدیریت ایمنی بیمار و پیشگیری از خطا</span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            آنالیز حالت‌های خطا و اثرات آن (FMEA)
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1 font-bold">
            شناسایی پیشگیرانه خطاهای بالقوه، محاسبه نمره اولویت ریسک (RPN = S × O × D) و تدوین برنامه اقدامات اصلاحی
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black transition cursor-pointer border border-white/20"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به پنل اصلی</span>
          </button>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-3 p-1.5 bg-indigo-950/90 border-2 border-indigo-300/30 rounded-2xl shadow-xl">
        <button
          type="button"
          onClick={() => setSubTab('create')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            subTab === 'create'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-1 ring-emerald-300/30'
              : 'text-indigo-200 hover:text-white hover:bg-white/10'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>{editingId ? 'ویرایش آنالیز FMEA' : '۱. ثبت آنالیز FMEA جدید'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubTab('archive');
            loadReports();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            subTab === 'archive'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-1 ring-emerald-300/30'
              : 'text-indigo-200 hover:text-white hover:bg-white/10'
          }`}
        >
          <Archive className="w-4 h-4 text-emerald-300" />
          <span>۲. آرشیو آنالیزهای FMEA ({toPersianDigits(fmeaReports.length)})</span>
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {subTab === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Banner & Word Download Button */}
          {savedSuccess && lastSavedReport && (
            <div className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border-2 border-emerald-400 p-6 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">
                    آنالیز FMEA با موفقیت ذخیره گردید!
                  </h4>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    اکنون می‌توانید فایل ورد (.docx) این آنالیز را با قاب‌بندی، جدول‌بندی استاندارد و فیلد راست‌گرد دانلود کنید.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => exportFmeaReportDocx(lastSavedReport)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl shadow-xl transition cursor-pointer text-sm ring-2 ring-amber-300/50"
                >
                  <Download className="w-5 h-5" />
                  <span>دانلود فایل ورد (Docx) FMEA</span>
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition cursor-pointer text-xs"
                >
                  ثبت جدید
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Process General Info */}
          <div className="bg-slate-900/95 border-2 border-indigo-300/30 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-indigo-200/20">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-black text-white">
                اطلاعات کلی فرایند و ارزیابی
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  عنوان فرایند / موضوع آنالیز FMEA <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: آنالیز FMEA فرایند مدیریت و تجویز داروی بیماران بستری"
                  className="w-full bg-slate-950/80 border border-indigo-300/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  بخش / واحد مربوطه <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={departmentOrProcess}
                  onChange={(e) => setDepartmentOrProcess(e.target.value)}
                  placeholder="مثال: بخش اورژانس و داروخانه بستری"
                  className="w-full bg-slate-950/80 border border-indigo-300/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  رهبر / دبیر تیم FMEA
                </label>
                <input
                  type="text"
                  value={teamLeader}
                  onChange={(e) => setTeamLeader(e.target.value)}
                  placeholder="نام مسئول FMEA یا دبیر کمیته ایمنی"
                  className="w-full bg-slate-950/80 border border-indigo-300/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  تاریخ ارزیابی
                </label>
                <input
                  type="text"
                  value={assessmentDate}
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  placeholder="1403/05/10"
                  className="w-full bg-slate-950/80 border border-indigo-300/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 text-left dir-ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  اعضای تیم FMEA
                </label>
                <input
                  type="text"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="اسامی اعضای حاضر در جلسات تحلیل (با کاما جدا کنید)"
                  className="w-full bg-slate-950/80 border border-indigo-300/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  اهداف و شرح فرایند
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیح مختصری از مراحل فرایند و اهداف تحلیل پیشگیرانه..."
                  className="w-full bg-slate-950/80 border border-indigo-300/30 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Failure Modes Matrix */}
          <div className="bg-slate-900/95 border-2 border-indigo-300/30 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-indigo-200/20">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  جدول آنالیز حالت‌های خطای بالقوه (FMEA Matrix)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن سطر خطا +</span>
              </button>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => {
                const currentRpn = item.severity * item.occurrence * item.detection;
                return (
                  <div
                    key={item.id}
                    className="bg-slate-950/80 border-2 border-indigo-300/20 p-5 rounded-2xl relative space-y-4 shadow-lg hover:border-emerald-400/40 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-200/10">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-400/30">
                          {toPersianDigits(index + 1)}
                        </span>
                        <span className="text-sm font-black text-white">
                          حالت خطای شماره {toPersianDigits(index + 1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {getRpnBadge(currentRpn, item.severity)}

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition cursor-pointer"
                            title="حذف این سطر"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1">
                          گام / مرحله فرایند
                        </label>
                        <input
                          type="text"
                          value={item.processStep}
                          onChange={(e) => handleItemChange(index, 'processStep', e.target.value)}
                          placeholder="مثال: اخذ سابقه دارویی بیمار"
                          className="w-full bg-slate-900 border border-indigo-300/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1">
                          حالت خطای بالقوه (Failure Mode)
                        </label>
                        <input
                          type="text"
                          value={item.potentialFailureMode}
                          onChange={(e) => handleItemChange(index, 'potentialFailureMode', e.target.value)}
                          placeholder="مثال: عدم ثبت حساسیت دارویی"
                          className="w-full bg-slate-900 border border-indigo-300/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1">
                          اثرات بالقوه خطا (Failure Effects)
                        </label>
                        <input
                          type="text"
                          value={item.potentialEffects}
                          onChange={(e) => handleItemChange(index, 'potentialEffects', e.target.value)}
                          placeholder="مثال: شوک آنافیلاکسی"
                          className="w-full bg-slate-900 border border-indigo-300/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    {/* Scores Section: Severity (S), Occurrence (O), Detection (D) */}
                    <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-300/20 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Severity S */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-indigo-200">
                            شدت (S): <span className="text-amber-300 font-black">{toPersianDigits(item.severity)}</span>
                          </label>
                          <span className="text-[10px] text-slate-400">(۱ کمترین - ۱۰ بیشترین)</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={item.severity}
                          onChange={(e) => handleItemChange(index, 'severity', Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* Occurrence O */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-indigo-200">
                            وقوع (O): <span className="text-cyan-300 font-black">{toPersianDigits(item.occurrence)}</span>
                          </label>
                          <span className="text-[10px] text-slate-400">(۱ کمترین - ۱۰ بیشترین)</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={item.occurrence}
                          onChange={(e) => handleItemChange(index, 'occurrence', Number(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      {/* Detection D */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-indigo-200">
                            کشف (D): <span className="text-purple-300 font-black">{toPersianDigits(item.detection)}</span>
                          </label>
                          <span className="text-[10px] text-slate-400">(۱ اسان - ۱۰ بسیار سخت)</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={item.detection}
                          onChange={(e) => handleItemChange(index, 'detection', Number(e.target.value))}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                      </div>

                      {/* Calculated RPN Box */}
                      <div className="bg-slate-900 p-3 rounded-xl border border-indigo-200/30 flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] font-bold text-indigo-200">نمره اولویت ریسک (RPN)</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-white">
                            {toPersianDigits(currentRpn)}
                          </span>
                          <span className="text-[10px] text-slate-400">({toPersianDigits(item.severity)}×{toPersianDigits(item.occurrence)}×{toPersianDigits(item.detection)})</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1">
                          کنترلهای جاری (Current Controls)
                        </label>
                        <input
                          type="text"
                          value={item.currentControls}
                          onChange={(e) => handleItemChange(index, 'currentControls', e.target.value)}
                          placeholder="کنترلهای فعلی برای جلوگیری یا کشف خطا"
                          className="w-full bg-slate-900 border border-indigo-300/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1">
                          اقدامات پیشنهادی / اصلاحی
                        </label>
                        <input
                          type="text"
                          value={item.recommendedActions}
                          onChange={(e) => handleItemChange(index, 'recommendedActions', e.target.value)}
                          placeholder="دستورالعمل، تغییر نرم‌افزار یا آموزش لازم"
                          className="w-full bg-slate-900 border border-indigo-300/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1">
                          مسئول اجرا و مهلت
                        </label>
                        <input
                          type="text"
                          value={item.responsiblePerson}
                          onChange={(e) => handleItemChange(index, 'responsiblePerson', e.target.value)}
                          placeholder="مثال: سرپرستار بخش - مهلت: ۲ هفته"
                          className="w-full bg-slate-900 border border-indigo-300/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-xl transition cursor-pointer ring-2 ring-emerald-300/40"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{editingId ? 'بروزرسانی و ذخیره آنالیز FMEA' : 'ثبت و ذخیره‌سازی آنالیز FMEA'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiModalData({ title, departmentOrProcess, teamLeader, teamMembers, assessmentDate, description, items });
                  setAiModalTitle(`تحلیل FMEA: ${title || 'آنالیز FMEA در حال تکمیل'}`);
                  setAiModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm rounded-2xl shadow-xl transition cursor-pointer ring-2 ring-purple-300/40 active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>تحلیل FMEA با هوش مصنوعی</span>
              </button>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                انصراف از ویرایش
              </button>
            )}
          </div>
        </form>
      )}

      {/* ARCHIVE LIST */}
      {subTab === 'archive' && (
        <div className="bg-slate-900/95 border-2 border-indigo-300/30 p-6 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-200/20">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-black text-white">
                آرشیو و سوابق آنالیزهای FMEA ثبت‌شده
              </h3>
            </div>

            <span className="text-xs font-bold text-indigo-200">
              مجموع: {toPersianDigits(fmeaReports.length)} مورد
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-indigo-200 font-bold">
              در حال بارگذاری آرشیو...
            </div>
          ) : fmeaReports.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-indigo-300/10 space-y-3">
              <Info className="w-10 h-10 text-indigo-400 mx-auto" />
              <p className="text-sm font-bold text-indigo-200">
                هیچ آنالیز FMEA تا کنون ثبت نشده است.
              </p>
              <button
                type="button"
                onClick={() => setSubTab('create')}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500 transition"
              >
                ثبت اولین آنالیز FMEA
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {fmeaReports
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((report) => {
                    const maxRpn = Math.max(
                      ...report.items.map((it) => it.rpn || it.severity * it.occurrence * it.detection),
                      0
                    );
                    return (
                      <div
                        key={report.id}
                        className="bg-slate-950 border-2 border-indigo-300/20 hover:border-emerald-400/50 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-lg text-right"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black">
                              {report.departmentOrProcess || 'فرایند عمومی'}
                            </span>
                            <span className="text-xs text-slate-400">
                              تاریخ ارزیابی: {toPersianDigits(report.assessmentDate)}
                            </span>
                          </div>

                          <h4 className="text-base font-black text-white leading-snug">
                            {report.title}
                          </h4>

                          <div className="flex items-center gap-4 text-xs text-indigo-200/80 pt-1 flex-wrap">
                            {report.teamLeader && (
                              <span>رهبر تیم: <strong className="text-white">{report.teamLeader}</strong></span>
                            )}
                            <span>تعداد خطاهای بررسی‌شده: <strong className="text-amber-300">{toPersianDigits(report.items.length)}</strong></span>
                            <span>حداکثر RPN: <strong className="text-red-400">{toPersianDigits(maxRpn)}</strong></span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-indigo-200/10">
                          <button
                            type="button"
                            onClick={() => {
                              setAiModalData(report);
                              setAiModalTitle(`تحلیل FMEA: ${report.title}`);
                              setAiModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md border border-purple-300/40"
                            title="تحلیل هوشمند FMEA با استناد به کتاب‌های مرجع"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>تحلیل با AI</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => exportFmeaReportDocx(report)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-md"
                            title="دانلود خروجی Word راست‌گرد"
                          >
                            <Download className="w-4 h-4" />
                            <span>دانلود Word</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditReport(report)}
                            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                            title="ویرایش"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>ویرایش</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Pagination Controls */}
              {Math.ceil(fmeaReports.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-800 bg-slate-950 p-4 rounded-3xl shadow-sm text-white dir-rtl">
                  <span className="text-xs font-extrabold text-slate-300">
                    نمایش صفحه {toPersianDigits(currentPage)} از {toPersianDigits(Math.ceil(fmeaReports.length / ITEMS_PER_PAGE))} (مجموع {toPersianDigits(fmeaReports.length)} آنالیز FMEA - هر صفحه ۱۵ مورد)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-slate-700"
                    >
                      صفحه قبل
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(fmeaReports.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition cursor-pointer ${
                            currentPage === p
                              ? 'bg-emerald-600 text-white shadow-md scale-105'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {toPersianDigits(p)}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(fmeaReports.length / ITEMS_PER_PAGE)))}
                      disabled={currentPage === Math.ceil(fmeaReports.length / ITEMS_PER_PAGE)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-slate-700"
                    >
                      صفحه بعد
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* AI Medical Analysis Modal */}
      <MedicalAiAnalyzerModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        contextType="FMEA"
        title={aiModalTitle}
        data={aiModalData}
      />

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
