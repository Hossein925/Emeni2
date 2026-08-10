import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  ArrowRight,
  CheckCircle2,
  Users,
  Search,
  Activity,
  Calendar,
  AlertCircle,
  FileCheck2,
  ClipboardList,
  Download,
  Sparkles,
} from 'lucide-react';
import { RcaReport } from '../types';
import { DataAccessLayer } from '../services/dal';
import { toPersianDigits } from '../utils/jalali';
import { exportRcaReportDocx } from '../utils/exportUtils';
import { FishboneDiagram, FishboneCategoryData } from './FishboneDiagram';
import { MedicalAiAnalyzerModal } from './MedicalAiAnalyzerModal';

export const RcaFormAdmin: React.FC = () => {
  const [rcaList, setRcaList] = useState<RcaReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState<any>(null);
  const [aiModalTitle, setAiModalTitle] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<RcaReport>>({
    teamMembers: '',
    eventDescription: '',
    eventDate: '',
    eventLocation: '',
    eventTypeOrCode: '',
    intervieweeName: '',
    interviewerName: '',
    interviewDates: '',
    avgInterviewTime: '',
    interviewCount: '',
    reportsCount: '',
    documentsDocs: '',
    equipmentDocs: '',
    siteVisitDocs: '',
    informationMapping: '',
    problemIdentificationMethod: '',
    systemProblemsSDP: '',
    contributorProblemsCDP: '',
    patientFactors: '',
    humanFactors: '',
    processFactors: '',
    teamFactors: '',
    environmentalFactors: '',
    equipmentFactors: '',
    organizationalFactors: '',
    rootCausesAndActions: [{ id: '1', rootCause: '', correctiveAction: '' }],
    correctivePlans: [
      { id: '1', action: '', metric: '', responsible: '', startDate: '', endDate: '', progressReport: '' },
    ],
    operationalPlans: [
      {
        id: '1',
        programTitle: '',
        metric: '',
        activity: '',
        responsible: '',
        startDate: '',
        endDate: '',
        targetMetric: '',
        estimatedCost: '',
        monthlyProgress: {},
        goalRealization: '',
      },
    ],
    auditQ1: '',
    auditQ2: '',
    auditQ3: '',
    auditQ4: '',
  });

  useEffect(() => {
    loadRcaReports();
  }, []);

  const loadRcaReports = async () => {
    setLoading(true);
    const reports = await DataAccessLayer.getRcaReports();
    setRcaList(reports);
    setLoading(false);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      teamMembers: '',
      eventDescription: '',
      eventDate: new Date().toLocaleDateString('fa-IR'),
      eventLocation: '',
      eventTypeOrCode: '',
      intervieweeName: '',
      interviewerName: '',
      interviewDates: '',
      avgInterviewTime: '',
      interviewCount: '',
      reportsCount: '',
      documentsDocs: '',
      equipmentDocs: '',
      siteVisitDocs: '',
      informationMapping: '',
      problemIdentificationMethod: '',
      systemProblemsSDP: '',
      contributorProblemsCDP: '',
      patientFactors: '',
      humanFactors: '',
      processFactors: '',
      teamFactors: '',
      environmentalFactors: '',
      equipmentFactors: '',
      organizationalFactors: '',
      rootCausesAndActions: [{ id: '1', rootCause: '', correctiveAction: '' }],
      correctivePlans: [
        { id: '1', action: '', metric: '', responsible: '', startDate: '', endDate: '', progressReport: '' },
      ],
      operationalPlans: [
        {
          id: '1',
          programTitle: '',
          metric: '',
          activity: '',
          responsible: '',
          startDate: '',
          endDate: '',
          targetMetric: '',
          estimatedCost: '',
          monthlyProgress: {},
          goalRealization: '',
        },
      ],
      auditQ1: '',
      auditQ2: '',
      auditQ3: '',
      auditQ4: '',
    });
    setActiveTab('editor');
  };

  const handleEdit = (report: RcaReport) => {
    setEditingId(report.id);
    setFormData({ ...report });
    setActiveTab('editor');
  };

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این کاربرگ RCA اطمینان دارید؟')) {
      await DataAccessLayer.deleteRcaReport(id);
      loadRcaReports();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventDescription?.trim()) {
      alert('لطفاً شرح رویداد را وارد نمایید.');
      return;
    }

    await DataAccessLayer.saveRcaReport({
      ...formData,
      id: editingId || undefined,
    });

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);

    await loadRcaReports();
    setActiveTab('list');
  };

  // Helper arrays update
  const addRootCauseRow = () => {
    setFormData((prev) => ({
      ...prev,
      rootCausesAndActions: [
        ...(prev.rootCausesAndActions || []),
        { id: `rc-${Date.now()}`, rootCause: '', correctiveAction: '' },
      ],
    }));
  };

  const removeRootCauseRow = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      rootCausesAndActions: (prev.rootCausesAndActions || []).filter((_, i) => i !== idx),
    }));
  };

  const updateRootCauseRow = (idx: number, field: 'rootCause' | 'correctiveAction', val: string) => {
    setFormData((prev) => {
      const list = [...(prev.rootCausesAndActions || [])];
      if (list[idx]) {
        list[idx] = { ...list[idx], [field]: val };
      }
      return { ...prev, rootCausesAndActions: list };
    });
  };

  // Corrective Plans
  const addCorrectivePlanRow = () => {
    setFormData((prev) => ({
      ...prev,
      correctivePlans: [
        ...(prev.correctivePlans || []),
        { id: `cp-${Date.now()}`, action: '', metric: '', responsible: '', startDate: '', endDate: '', progressReport: '' },
      ],
    }));
  };

  const removeCorrectivePlanRow = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      correctivePlans: (prev.correctivePlans || []).filter((_, i) => i !== idx),
    }));
  };

  const updateCorrectivePlanRow = (idx: number, field: string, val: string) => {
    setFormData((prev) => {
      const list = [...(prev.correctivePlans || [])];
      if (list[idx]) {
        list[idx] = { ...list[idx], [field]: val };
      }
      return { ...prev, correctivePlans: list };
    });
  };

  // Operational Plans
  const addOperationalPlanRow = () => {
    setFormData((prev) => ({
      ...prev,
      operationalPlans: [
        ...(prev.operationalPlans || []),
        {
          id: `op-${Date.now()}`,
          programTitle: '',
          metric: '',
          activity: '',
          responsible: '',
          startDate: '',
          endDate: '',
          targetMetric: '',
          estimatedCost: '',
          monthlyProgress: {},
          goalRealization: '',
        },
      ],
    }));
  };

  const removeOperationalPlanRow = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      operationalPlans: (prev.operationalPlans || []).filter((_, i) => i !== idx),
    }));
  };

  const updateOperationalPlanRow = (idx: number, field: string, val: any) => {
    setFormData((prev) => {
      const list = [...(prev.operationalPlans || [])];
      if (list[idx]) {
        list[idx] = { ...list[idx], [field]: val };
      }
      return { ...prev, operationalPlans: list };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async (dataToExport?: any) => {
    const reportData = dataToExport || formData;
    await exportRcaReportDocx(reportData);
  };

  return (
    <div className="w-full space-y-6 text-right">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-200">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-indigo-950 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-cyan-600" />
            <span>کاربرگ تحلیل ریشه‌ای خطا (RCA)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
            ثبت، تحلیل، استخوان ماهی و پیگیری برنامه‌های اصلاحی رویدادهای ایمنی بیمار
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'editor' && (
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به آرشیو RCA</span>
            </button>
          )}

          {activeTab === 'list' && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت کاربرگ RCA جدید</span>
            </button>
          )}
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-black text-xs flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>کاربرگ تحلیل ریشه‌ای خطا (RCA) با موفقیت ذخیره گردید.</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold">
            اکنون می‌توانید هر زمان که مایل بودید، گزارش آن را از آرشیو زیر دانلود کنید.
          </p>
        </div>
      )}

      {/* LIST TAB */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-bold text-xs">در حال دریافت سوابق...</div>
          ) : rcaList.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-black text-slate-700">هیچ کاربرگ RCA هنوز ثبت نشده است.</p>
              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-md cursor-pointer"
              >
                ایجاد اولین کاربرگ RCA
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rcaList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-5 bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-400 shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black border border-indigo-200">
                        کد/نوع خطا: {item.eventTypeOrCode || 'ثبت‌نشده'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        تاریخ: {toPersianDigits(item.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1 line-clamp-2">
                      رویداد: {item.eventDescription || 'بدون شرح'}
                    </h4>
                    <p className="text-xs font-bold text-slate-600 mb-2">
                      محل رویداد: {item.eventLocation || 'مشخص‌نشده'}
                    </p>

                    <div className="text-xs font-bold text-slate-500 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div>اعضای تیم: {item.teamMembers || 'ثبت‌نشده'}</div>
                      <div>
                        تعداد علل ریشه‌ای: {toPersianDigits(item.rootCausesAndActions?.length || 0)} مورد
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAiModalData(item);
                        setAiModalTitle(`تحلیل RCA: ${item.eventDescription || 'رویداد ایمنی بیمار'}`);
                        setAiModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-black transition cursor-pointer shadow-md border border-purple-300/40"
                      title="تحلیل هوشمند با منابع هاریسون، پوترپری، برونرسودارث و اعتباربخشی"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>تحلیل با هوش مصنوعی</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadWord(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition cursor-pointer shadow-sm"
                      title="دانلود فایل Word با نمودار استخوان ماهی ۶ گانه"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-200" />
                      <span>دانلود Word</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(item);
                        setActiveTab('editor');
                        setTimeout(() => window.print(), 300);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition cursor-pointer shadow-sm"
                      title="چاپ یا پیش‌نمایش"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>چاپ</span>
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black transition cursor-pointer"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition cursor-pointer"
                      title="حذف گزارش"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDITOR TAB - 7 STEPS RCA WORKSHEET */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSave} className="space-y-8 bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-900">
          
          {/* Header Title Banner */}
          <div className="text-center py-4 bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-950 text-white rounded-2xl shadow-inner border border-cyan-400/30 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black">کاربرگ تحلیل ریشه‌ای خطا (RCA)</h2>
            <p className="text-xs text-cyan-200 font-bold">بیمارستان / کمیته مدیریت ایمنی بیمار</p>
          </div>

          {/* ================= STEP 1: تشکیل تیم و تعریف مشکل ================= */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <h3 className="text-base font-black text-indigo-950 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>مرحله اول: تشکیل تیم و تعریف مشکل</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-black">
              <div className="md:col-span-2">
                <label className="block text-slate-700 mb-1">۱. اعضای تیم / کمیته RCA:</label>
                <textarea
                  rows={2}
                  value={formData.teamMembers}
                  onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                  placeholder="اسامی اعضای تیم مانند: دبیر ایمنی، سوپروایزر، سرپرستار بخش..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 mb-1">۲. تعریف رویداد (What Happened):</label>
                <textarea
                  rows={3}
                  value={formData.eventDescription}
                  onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                  placeholder="شرح کامل حادثه و اتفاق رخ داده..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">۳. تاریخ رویداد:</label>
                <input
                  type="text"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  placeholder="مثال: 1403/05/12"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">۴. محل رویداد:</label>
                <input
                  type="text"
                  value={formData.eventLocation}
                  onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                  placeholder="مثال: بخش اورژانس / اتاق عمل 2"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 mb-1">۵. نوع رویداد / کد خطا:</label>
                <input
                  type="text"
                  value={formData.eventTypeOrCode}
                  onChange={(e) => setFormData({ ...formData, eventTypeOrCode: e.target.value })}
                  placeholder="مثال: خطای دارویی / Sentinel Event / سقوط بیمار"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* ================= STEP 2-A: جمع‌آوری اطلاعات ================= */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <h3 className="text-base font-black text-indigo-950 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              <span>مرحله دوم- الف: جمع‌آوری اطلاعات</span>
            </h3>

            {/* Sub 1: مصاحبه */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-black text-indigo-900">۱. مصاحبه:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-bold">
                <div>
                  <label className="block text-slate-600 mb-1">نام مصاحبه شونده:</label>
                  <input
                    type="text"
                    value={formData.intervieweeName}
                    onChange={(e) => setFormData({ ...formData, intervieweeName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">مصاحبه کننده:</label>
                  <input
                    type="text"
                    value={formData.interviewerName}
                    onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">تاریخ مصاحبه‌ها:</label>
                  <input
                    type="text"
                    value={formData.interviewDates}
                    onChange={(e) => setFormData({ ...formData, interviewDates: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">زمان متوسط هر مصاحبه:</label>
                  <input
                    type="text"
                    value={formData.avgInterviewTime}
                    onChange={(e) => setFormData({ ...formData, avgInterviewTime: e.target.value })}
                    placeholder="مثال: ۳۰ دقیقه"
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">تعداد جلسات مصاحبه:</label>
                  <input
                    type="text"
                    value={formData.interviewCount}
                    onChange={(e) => setFormData({ ...formData, interviewCount: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">تعداد گزارشات تهیه شده:</label>
                  <input
                    type="text"
                    value={formData.reportsCount}
                    onChange={(e) => setFormData({ ...formData, reportsCount: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Sub 2, 3, 4: اسناد، تجهیزات، بازدید مکان */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <label className="block text-indigo-900 font-black mb-1">۲. اسناد و مدارک:</label>
                <textarea
                  rows={2}
                  value={formData.documentsDocs}
                  onChange={(e) => setFormData({ ...formData, documentsDocs: e.target.value })}
                  placeholder="بررسی پرونده بیمار، کاردکس، دستورات..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <label className="block text-indigo-900 font-black mb-1">۳. تجهیزات:</label>
                <textarea
                  rows={2}
                  value={formData.equipmentDocs}
                  onChange={(e) => setFormData({ ...formData, equipmentDocs: e.target.value })}
                  placeholder="بررسی سلامت دستگاه‌ها، پمپ انفوزیون..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <label className="block text-indigo-900 font-black mb-1">۴. بازدید مکان:</label>
                <textarea
                  rows={2}
                  value={formData.siteVisitDocs}
                  onChange={(e) => setFormData({ ...formData, siteVisitDocs: e.target.value })}
                  placeholder="بررسی وضعیت روشنایی، کف‌پوش، تخت..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* ================= STEP 2-B: نگاشت اطلاعات ================= */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <h3 className="text-base font-black text-indigo-950 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>مرحله دوم- ب: نگاشت اطلاعات</span>
            </h3>
            <p className="text-xs font-bold text-slate-600">
              با یکی از روش‌های نگاشت اطلاعات، رویداد اتفاق افتاده را شرح دهید (رویدادنگاری داستانی، خط زمانی، خط زمانی مبتنی بر جدول، جدول شخص-زمان)
            </p>
            <textarea
              rows={4}
              value={formData.informationMapping}
              onChange={(e) => setFormData({ ...formData, informationMapping: e.target.value })}
              placeholder="شرح خط زمانی و ترتیبی رویداد..."
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
            />
          </div>

          {/* ================= STEP 3: شناسایی مسئله و مشکل ================= */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <h3 className="text-base font-black text-indigo-950 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              <span>مرحله سوم: شناسایی مسئله و مشکل</span>
            </h3>

            <div className="space-y-2 text-xs font-bold">
              <label className="block text-slate-700">
                روش شناسایی مسئله (بارش افکار، تحلیل تغییر و ...):
              </label>
              <textarea
                rows={2}
                value={formData.problemIdentificationMethod}
                onChange={(e) => setFormData({ ...formData, problemIdentificationMethod: e.target.value })}
                placeholder="نتایج جلسات بارش افکار یا تحلیل تغییر..."
                className="w-full p-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>

            <p className="text-xs font-black text-indigo-900 pt-2">
              مسائل شناسایی شده را در دو طبقه مسائل مرتبط با سیستم و مسائل مرتبط با فرد طبقه بندی نمایید:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                <label className="block text-indigo-950 font-black">SDP مسائل مرتبط با سیستم:</label>
                <textarea
                  rows={3}
                  value={formData.systemProblemsSDP}
                  onChange={(e) => setFormData({ ...formData, systemProblemsSDP: e.target.value })}
                  placeholder="نقص در پروتکل‌ها، کمبود نیرو، کمبود تجهیزات..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                <label className="block text-indigo-950 font-black">CDP مسائل مرتبط با فرد:</label>
                <textarea
                  rows={3}
                  value={formData.contributorProblemsCDP}
                  onChange={(e) => setFormData({ ...formData, contributorProblemsCDP: e.target.value })}
                  placeholder="خستگی، عدم آگاهی، اشتباه فردی..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* ================= STEP 4: تحلیل اطلاعات (FISHBONE DIAGRAM - 6 CATEGORIES) ================= */}
          <div className="space-y-6 p-5 rounded-2xl bg-indigo-950 text-white border-2 border-indigo-300 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800 pb-3">
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span>مرحله چهارم: تحلیل علت و معلولی استخوان ماهی (Ishikawa Fishbone Diagram)</span>
              </h3>
              <span className="px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-200 text-xs font-bold">
                نمودار استاندارد استخوان ماهی ۶ گانه RCA
              </span>
            </div>

            <p className="text-xs font-bold text-cyan-200/90 leading-relaxed">
              علل و عوامل موثر در بروز رویداد را در قالب ساختار واقعی و شاخه‌ای استخوان ماهی مشاهده و ویرایش کنید.
              می‌توانید مستقیماً روی هر شاخه کلیک کرده یا در کادرهای متنی زیر فرم وارد نمایید:
            </p>

            {/* VISUAL SVG FISHBONE DIAGRAM */}
            <FishboneDiagram
              eventTitle={formData.eventDescription || ''}
              categories={[
                {
                  id: 'cat-1',
                  title: '۱. عوامل مربوط به بیمار (Patient)',
                  shortTitle: 'بیمار',
                  color: '#06B6D4',
                  bgColor: '#1E293B',
                  borderColor: '#06B6D4',
                  textColor: '#E0F2FE',
                  fieldKey: 'patientFactors',
                  rawText: formData.patientFactors || '',
                },
                {
                  id: 'cat-2',
                  title: '۲. عوامل مربوط به پرسنل (Staff)',
                  shortTitle: 'پرسنل',
                  color: '#3B82F6',
                  bgColor: '#1E293B',
                  borderColor: '#3B82F6',
                  textColor: '#DBEAFE',
                  fieldKey: 'humanFactors',
                  rawText: formData.humanFactors || '',
                },
                {
                  id: 'cat-3',
                  title: '۳. وظایف و فرآیندها (Task/Process)',
                  shortTitle: 'فرآیندها',
                  color: '#8B5CF6',
                  bgColor: '#1E293B',
                  borderColor: '#8B5CF6',
                  textColor: '#EDE9FE',
                  fieldKey: 'processFactors',
                  rawText: formData.processFactors || '',
                },
                {
                  id: 'cat-4',
                  title: '۴. تیم کاری و ارتباطات (Team)',
                  shortTitle: 'تیم',
                  color: '#F59E0B',
                  bgColor: '#1E293B',
                  borderColor: '#F59E0B',
                  textColor: '#FEF3C7',
                  fieldKey: 'teamFactors',
                  rawText: formData.teamFactors || '',
                },
                {
                  id: 'cat-5',
                  title: '۵. محیط و تجهیزات (Environment)',
                  shortTitle: 'محیط و تجهیزات',
                  color: '#10B981',
                  bgColor: '#1E293B',
                  borderColor: '#10B981',
                  textColor: '#D1FAE5',
                  fieldKey: 'environmentalFactors',
                  rawText: [formData.environmentalFactors || '', formData.equipmentFactors || ''].filter(Boolean).join('\n'),
                },
                {
                  id: 'cat-6',
                  title: '۶. سازمان و مدیریت (Organization)',
                  shortTitle: 'سازمان',
                  color: '#EC4899',
                  bgColor: '#1E293B',
                  borderColor: '#EC4899',
                  textColor: '#FCE7F3',
                  fieldKey: 'organizationalFactors',
                  rawText: formData.organizationalFactors || '',
                },
              ]}
              onUpdateCategoryText={(fieldKey, newText) => {
                setFormData((prev) => ({ ...prev, [fieldKey]: newText }));
              }}
              onUpdateEventTitle={(newTitle) => {
                setFormData((prev) => ({ ...prev, eventDescription: newTitle }));
              }}
            />

            {/* EXPANDABLE / COLLAPSIBLE DETAILED TEXT INPUTS FOR CATEGORIES */}
            <details className="group pt-2">
              <summary className="cursor-pointer text-xs font-black text-amber-300 hover:text-amber-200 flex items-center gap-2 py-2 border-t border-indigo-800">
                <span>📝 مشاهده / ویرایش کادرهای متنی تفکیکی ۶ دسته (فرم ورود مستقیم)</span>
              </summary>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold text-slate-900 pt-3">
                {/* Category 1: Patient */}
                <div className="bg-indigo-900/70 p-4 rounded-xl border border-indigo-700 text-white space-y-1.5 flex flex-col justify-between">
                  <div>
                    <label className="block font-black text-cyan-300 mb-1 flex items-center gap-1.5">
                      <span>🏥 ۱. عوامل مربوط به بیمار (Patient):</span>
                    </label>
                    <p className="text-[10px] text-slate-300 font-bold mb-2">
                      وضعیت بالینی، بیماری زمینه‌ای، زبان/ارتباط، عدم همکاری، شرایط جسمی و روانی...
                    </p>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.patientFactors || ''}
                    onChange={(e) => setFormData({ ...formData, patientFactors: e.target.value })}
                    placeholder="علل مرتبط با شرایط بیمار..."
                    className="w-full p-2.5 rounded-lg border border-indigo-600 bg-indigo-950 text-white font-bold text-xs"
                  />
                </div>

                {/* Category 2: Staff */}
                <div className="bg-indigo-900/70 p-4 rounded-xl border border-indigo-700 text-white space-y-1.5 flex flex-col justify-between">
                  <div>
                    <label className="block font-black text-cyan-300 mb-1 flex items-center gap-1.5">
                      <span>👤 ۲. عوامل مربوط به فرد و پرسنل (Staff):</span>
                    </label>
                    <p className="text-[10px] text-slate-300 font-bold mb-2">
                      دانش و مهارت فنی، خستگی، استرس، صلاحیت بالینی، عدم رعایت پروتکل...
                    </p>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.humanFactors || ''}
                    onChange={(e) => setFormData({ ...formData, humanFactors: e.target.value })}
                    placeholder="علل مرتبط با فرد و پرسنل..."
                    className="w-full p-2.5 rounded-lg border border-indigo-600 bg-indigo-950 text-white font-bold text-xs"
                  />
                </div>

                {/* Category 3: Task & Process */}
                <div className="bg-indigo-900/70 p-4 rounded-xl border border-indigo-700 text-white space-y-1.5 flex flex-col justify-between">
                  <div>
                    <label className="block font-black text-cyan-300 mb-1 flex items-center gap-1.5">
                      <span>⚙️ ۳. عوامل مربوط به وظایف و فرآیندها (Task/Process):</span>
                    </label>
                    <p className="text-[10px] text-slate-300 font-bold mb-2">
                      دستورالعمل‌ها، وضوح وظایف، فرآیند تحویل شیفت/بیمار، چک‌لیست‌ها...
                    </p>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.processFactors || ''}
                    onChange={(e) => setFormData({ ...formData, processFactors: e.target.value })}
                    placeholder="علل مرتبط با فرایندها و وظایف..."
                    className="w-full p-2.5 rounded-lg border border-indigo-600 bg-indigo-950 text-white font-bold text-xs"
                  />
                </div>

                {/* Category 4: Team & Communication */}
                <div className="bg-indigo-900/70 p-4 rounded-xl border border-indigo-700 text-white space-y-1.5 flex flex-col justify-between">
                  <div>
                    <label className="block font-black text-cyan-300 mb-1 flex items-center gap-1.5">
                      <span>👥 ۴. عوامل مربوط به تیم کاری و ارتباطات (Team):</span>
                    </label>
                    <p className="text-[10px] text-slate-300 font-bold mb-2">
                      ارتباطات بین‌رشته‌ای، انتقال شیفت، نظارت، رهبری و هماهنگی تیم...
                    </p>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.teamFactors || ''}
                    onChange={(e) => setFormData({ ...formData, teamFactors: e.target.value })}
                    placeholder="علل مرتبط با تیم کاری و ارتباطات..."
                    className="w-full p-2.5 rounded-lg border border-indigo-600 bg-indigo-950 text-white font-bold text-xs"
                  />
                </div>

                {/* Category 5: Environment & Equipment */}
                <div className="bg-indigo-900/70 p-4 rounded-xl border border-indigo-700 text-white space-y-1.5 flex flex-col justify-between">
                  <div>
                    <label className="block font-black text-cyan-300 mb-1 flex items-center gap-1.5">
                      <span>🛠️ ۵. عوامل مربوط به محیط و تجهیزات (Environment/Equipment):</span>
                    </label>
                    <p className="text-[10px] text-slate-300 font-bold mb-2">
                      نور، شلوغی، صدای محیط، ساختار فیزیکی، خرابی تجهیزات، عدم کالیبراسیون...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={formData.environmentalFactors || ''}
                      onChange={(e) => setFormData({ ...formData, environmentalFactors: e.target.value })}
                      placeholder="عوامل محیطی (نور، شلوغی...)"
                      className="w-full p-2.5 rounded-lg border border-indigo-600 bg-indigo-950 text-white font-bold text-xs"
                    />
                    <textarea
                      rows={2}
                      value={formData.equipmentFactors || ''}
                      onChange={(e) => setFormData({ ...formData, equipmentFactors: e.target.value })}
                      placeholder="عوامل تجهیزاتی (خرابی، کالیبراسیون...)"
                      className="w-full p-2.5 rounded-lg border border-indigo-600 bg-indigo-950 text-white font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Category 6: Organization & Management */}
                <div className="bg-indigo-900/70 p-4 rounded-xl border border-indigo-700 text-white space-y-1.5 flex flex-col justify-between">
                  <div>
                    <label className="block font-black text-cyan-300 mb-1 flex items-center gap-1.5">
                      <span>🏢 ۶. عوامل مربوط به سازمان و مدیریت (Organization):</span>
                    </label>
                    <p className="text-[10px] text-slate-300 font-bold mb-2">
                      چیدمان نیرو، آموزش، فرهنگ ایمنی، منابع مالی/تجهیزاتی، ساختار مدیریتی...
                    </p>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.organizationalFactors || ''}
                    onChange={(e) => setFormData({ ...formData, organizationalFactors: e.target.value })}
                    placeholder="علل مرتبط با سازمان و مدیریت..."
                    className="w-full p-2.5 rounded-lg border border-indigo-600 bg-indigo-950 text-white font-bold text-xs"
                  />
                </div>
              </div>
            </details>
          </div>

          {/* ================= STEP 5: طراحی اقدامات / بهبود کیفیت ================= */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
              <h3 className="text-base font-black text-indigo-950 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <span>مرحله پنجم: طراحی اقدامات / بهبود کیفیت</span>
              </h3>
              <button
                type="button"
                onClick={addRootCauseRow}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن علت ریشه‌ای</span>
              </button>
            </div>

            <p className="text-xs font-bold text-slate-600">
              با توجه به مرحله چهارم، برای عوامل ریشه‌ای استخراج شده، اقدام مداخله‌ای تدوین نمایید.
            </p>

            <div className="space-y-3">
              {(formData.rootCausesAndActions || []).map((row, idx) => (
                <div key={row.id || idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-white p-3 rounded-xl border border-slate-200 items-center">
                  <div className="md:col-span-5 text-xs font-bold">
                    <label className="block text-slate-500 mb-1">علل اصلی بروز واقعه #{toPersianDigits(idx + 1)}:</label>
                    <input
                      type="text"
                      value={row.rootCause}
                      onChange={(e) => updateRootCauseRow(idx, 'rootCause', e.target.value)}
                      placeholder="علت ریشه‌ای..."
                      className="w-full p-2.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="md:col-span-6 text-xs font-bold">
                    <label className="block text-slate-500 mb-1">اقدام اصلاحی پیشنهاد شده:</label>
                    <input
                      type="text"
                      value={row.correctiveAction}
                      onChange={(e) => updateRootCauseRow(idx, 'correctiveAction', e.target.value)}
                      placeholder="اقدام مداخله‌ای..."
                      className="w-full p-2.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end pt-5">
                    <button
                      type="button"
                      onClick={() => removeRootCauseRow(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= STEP 6: برنامه‌های اصلاحی و عملیاتی ================= */}
          <div className="space-y-6 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-indigo-950 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>گام ششم: برنامه‌ها و مداخله‌های اصلاحی جهت پیشگیری از انحرافات مجدد</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  شرح دقیق اقدامات، شاخص پایش، گزارش پیشرفت و مشخصات اجرایی برنامه اصلاحی را وارد کنید.
                </p>
              </div>
              <button
                type="button"
                onClick={addCorrectivePlanRow}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن برنامه اصلاحی جدید</span>
              </button>
            </div>

            {/* List of Corrective Plan Cards */}
            <div className="space-y-4">
              {(formData.correctivePlans || []).length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-bold text-xs bg-white rounded-2xl border border-dashed border-slate-300">
                  هیچ برنامه اصلاحی ثبت نشده است. جهت ثبت اقدام جدید بر روی دکمه «افزودن برنامه اصلاحی جدید» کلیک کنید.
                </div>
              ) : (
                (formData.correctivePlans || []).map((cp, cIdx) => (
                  <div
                    key={cp.id || cIdx}
                    className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-indigo-300 shadow-sm transition space-y-4 text-xs font-bold text-slate-800"
                  >
                    {/* Header bar for each plan */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-950 font-black text-xs border border-indigo-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>برنامه اصلاحی شماره {toPersianDigits(cIdx + 1)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCorrectivePlanRow(cIdx)}
                        className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>حذف این برنامه</span>
                      </button>
                    </div>

                    {/* Action Title Field */}
                    <div className="space-y-1">
                      <label className="block font-black text-slate-900 text-xs">
                        ۱. عنوان و شرح کامل اقدام اصلاحی / مداخله‌ای:
                      </label>
                      <textarea
                        rows={3}
                        value={cp.action}
                        onChange={(e) => updateCorrectivePlanRow(cIdx, 'action', e.target.value)}
                        placeholder="شرح دقیق اقدام مداخله‌ای، اصلاح فرایند، آموزش پرسنل، خرید تجهیزات..."
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 font-bold"
                      />
                    </div>

                    {/* Metric & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-black text-slate-900 text-xs">
                          ۲. شاخص دستیابی و معیارهای ارزیابی:
                        </label>
                        <textarea
                          rows={2}
                          value={cp.metric}
                          onChange={(e) => updateCorrectivePlanRow(cIdx, 'metric', e.target.value)}
                          placeholder="شاخص پایش موفقیت، میزان کاهش خطا، چک‌لیست ارزیابی..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-black text-slate-900 text-xs">
                          ۳. گزارش پیشرفت و آخرین وضعیت اجرا:
                        </label>
                        <textarea
                          rows={2}
                          value={cp.progressReport}
                          onChange={(e) => updateCorrectivePlanRow(cIdx, 'progressReport', e.target.value)}
                          placeholder="درصد پیشرفت، اقدامات انجام شده تاکنون یا موانع..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-bold"
                        />
                      </div>
                    </div>

                    {/* Responsible & Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="block text-slate-600 font-bold text-xs">مسئول پیگیری / اجرا:</label>
                        <input
                          type="text"
                          value={cp.responsible}
                          onChange={(e) => updateCorrectivePlanRow(cIdx, 'responsible', e.target.value)}
                          placeholder="نام و سمت مسئول"
                          className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-600 font-bold text-xs">تاریخ شروع:</label>
                        <input
                          type="text"
                          value={cp.startDate}
                          onChange={(e) => updateCorrectivePlanRow(cIdx, 'startDate', e.target.value)}
                          placeholder="مثلاً ۱۴۰۳/۰۶/۰۱"
                          className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-600 font-bold text-xs">تاریخ پایان / مهلت اجرا:</label>
                        <input
                          type="text"
                          value={cp.endDate}
                          onChange={(e) => updateCorrectivePlanRow(cIdx, 'endDate', e.target.value)}
                          placeholder="مثلاً ۱۴۰۳/۰۷/۰۱"
                          className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={addCorrectivePlanRow}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن برنامه اصلاحی جدید</span>
              </button>
            </div>
          </div>

          {/* ================= STEP 7: پایش و ممیزی نتایج ================= */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <h3 className="text-base font-black text-indigo-950 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <span>گام هفتم: پایش و ممیزی نتایج</span>
            </h3>
            <p className="text-xs font-bold text-slate-600">
              ارزشیابی اقدامات پس از بازه زمانی معین انجام می‌شود:
            </p>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">
                  ۱. چه میزان اقدامات براساس برنامه تنظیم شده محقق شده‌اند؟
                </label>
                <textarea
                  rows={2}
                  value={formData.auditQ1}
                  onChange={(e) => setFormData({ ...formData, auditQ1: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  ۲. آیا اجرا اقدامات در پیشگیری بروز واقعه مشابه موثر بوده است؟
                </label>
                <textarea
                  rows={2}
                  value={formData.auditQ2}
                  onChange={(e) => setFormData({ ...formData, auditQ2: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  ۳. آیا علل وقوع حادثه پس انجام اقدامات مدیریت شده است؟
                </label>
                <textarea
                  rows={2}
                  value={formData.auditQ3}
                  onChange={(e) => setFormData({ ...formData, auditQ3: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">۴. نحوه اشتراک‌گذاری اقدامات را ذکر نمایید؟</label>
                <textarea
                  rows={2}
                  value={formData.auditQ4}
                  onChange={(e) => setFormData({ ...formData, auditQ4: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAiModalData(formData);
                setAiModalTitle(`تحلیل RCA: ${formData.eventDescription || 'رویداد ایمنی بیمار'}`);
                setAiModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl transition cursor-pointer ring-2 ring-purple-300/40 active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>تحلیل علل ریشه‌ای با هوش مصنوعی</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-6 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-sm transition cursor-pointer"
            >
              انصراف و بازگشت به آرشیو
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>ذخیره کاربرگ RCA</span>
            </button>
          </div>
        </form>
      )}

      {/* AI Medical Analysis Modal */}
      <MedicalAiAnalyzerModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        contextType="RCA"
        title={aiModalTitle}
        data={aiModalData}
      />
    </div>
  );
};
