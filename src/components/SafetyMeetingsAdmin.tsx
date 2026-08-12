import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  PlusCircle,
  Archive,
  Download,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  ClipboardList,
  FileCheck,
  ShieldAlert,
  Edit3,
  X,
  Sparkles,
} from 'lucide-react';
import { SafetyMeeting, MeetingResolution } from '../types';
import { DataAccessLayer, subscribeToDALChanges } from '../services/dal';
import { downloadMeetingMinutesDocx } from '../utils/exportUtils';
import { toPersianDigits } from '../utils/jalali';
import { RcaFormAdmin } from './RcaFormAdmin';
import { QuarterlySelfAssessmentAdmin } from './QuarterlySelfAssessmentAdmin';
import { ConfirmModal } from './ConfirmModal';
import { FmeaFormAdmin } from './FmeaFormAdmin';
import { MedicalAiAnalyzerModal } from './MedicalAiAnalyzerModal';

interface SafetyMeetingsAdminProps {
  onBack: () => void;
}

export const SafetyMeetingsAdmin: React.FC<SafetyMeetingsAdminProps> = ({ onBack }) => {
  const [selectedTile, setSelectedTile] = useState<'meetings' | 'rca' | 'fmea' | 'quarterly' | null>(null);
  const [meetingSubTab, setMeetingSubTab] = useState<'create' | 'archive'>('create');
  const [meetings, setMeetings] = useState<SafetyMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const ITEMS_PER_PAGE = 15;

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState<any>(null);
  const [aiModalTitle, setAiModalTitle] = useState('');

  // Edit / Saved State
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [lastSavedMeeting, setLastSavedMeeting] = useState<SafetyMeeting | null>(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [secretary, setSecretary] = useState('');
  const [description, setDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [attendeesStr, setAttendeesStr] = useState('');
  const [followUpPerson, setFollowUpPerson] = useState('');
  const [deadline, setDeadline] = useState('');

  // Resolutions Form Array
  const [resolutions, setResolutions] = useState<Array<Omit<MeetingResolution, 'id'>>>([
    {
      text: '',
      weight: 3,
      priority: 'medium',
      isPublic: true,
      responsiblePerson: '',
      deadline: '',
      status: 'pending',
    },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadMeetings();
    const unsubscribe = subscribeToDALChanges(() => {
      loadMeetings(true);
    });
    return () => unsubscribe();
  }, []);

  const loadMeetings = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const data = await DataAccessLayer.getMeetings();
    setMeetings(data);
    setLoading(false);
  };

  const handleAddNewMeetingClick = () => {
    setEditingMeetingId(null);
    setSubject('');
    setSecretary('');
    setDescription('');
    setMeetingDate('');
    setAttendeesStr('');
    setFollowUpPerson('');
    setDeadline('');
    setResolutions([
      {
        text: '',
        weight: 3,
        priority: 'medium',
        isPublic: true,
        responsiblePerson: '',
        deadline: '',
        status: 'pending',
      },
    ]);
    setMeetingSubTab('create');
  };

  const handleEditMeeting = (m: SafetyMeeting) => {
    setEditingMeetingId(m.id);
    setSubject(m.subject || '');
    setSecretary(m.secretary || '');
    setDescription(m.description || '');
    setMeetingDate(m.meetingDate || '');
    setAttendeesStr(m.attendees ? m.attendees.join(', ') : '');
    setFollowUpPerson(m.followUpPerson || '');
    setDeadline(m.deadline || '');
    if (m.resolutions && m.resolutions.length > 0) {
      setResolutions(
        m.resolutions.map((r) => ({
          text: r.text || '',
          weight: r.weight || 3,
          priority: r.priority || 'medium',
          isPublic: r.isPublic ?? true,
          responsiblePerson: r.responsiblePerson || '',
          deadline: r.deadline || '',
          status: r.status || 'pending',
        }))
      );
    } else {
      setResolutions([
        {
          text: '',
          weight: 3,
          priority: 'medium',
          isPublic: true,
          responsiblePerson: '',
          deadline: '',
          status: 'pending',
        },
      ]);
    }
    setMeetingSubTab('create');
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

  const handleDeleteMeeting = (meetingId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف صورتجلسه',
      message: 'آیا از حذف این صورتجلسه اطمینان دارید؟',
      onConfirm: async () => {
        await DataAccessLayer.deleteMeeting(meetingId);
        if (editingMeetingId === meetingId) {
          handleAddNewMeetingClick();
        }
        loadMeetings();
      },
    });
  };

  const handleAddResolutionRow = () => {
    setResolutions((prev) => [
      ...prev,
      {
        text: '',
        weight: 3,
        priority: 'medium',
        isPublic: true,
        responsiblePerson: '',
        deadline: '',
        status: 'pending',
      },
    ]);
  };

  const handleRemoveResolutionRow = (index: number) => {
    setResolutions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResolutionChange = (index: number, field: keyof MeetingResolution, val: any) => {
    setResolutions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !secretary.trim()) {
      alert('لطفاً موضوع و دبیر جلسه را وارد کنید.');
      return;
    }

    const attendees = attendeesStr
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const formattedResolutions: MeetingResolution[] = resolutions
      .filter((r) => r.text.trim())
      .map((r, idx) => ({
        ...r,
        id: `res-${Date.now()}-${idx}`,
      }));

    const savedMeeting = await DataAccessLayer.saveMeeting({
      id: editingMeetingId || undefined,
      subject: subject.trim(),
      secretary: secretary.trim(),
      description: description.trim(),
      meetingDate: meetingDate.trim() || new Date().toLocaleDateString('fa-IR'),
      attendees,
      resolutions: formattedResolutions,
      followUpPerson: followUpPerson.trim(),
      deadline: deadline.trim(),
    });

    setLastSavedMeeting(savedMeeting);
    setSavedSuccess(true);

    // Reset Form
    handleAddNewMeetingClick();
    loadMeetings();
  };

  const handleTogglePublicResolution = async (meetingId: string, resolutionId: string, currentPublic: boolean) => {
    await DataAccessLayer.toggleResolutionPublicStatus(meetingId, resolutionId, !currentPublic);
    loadMeetings();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-indigo-200/60 gap-4" dir="rtl">
        <div className="flex items-center gap-3">
          {selectedTile ? (
            <button
              onClick={() => setSelectedTile(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت</span>
            </button>
          ) : (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40 shrink-0"
            >
              <ArrowRight className="w-4 h-4 text-slate-950" />
              <span>بازگشت</span>
            </button>
          )}

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
              <CalendarCheck className="w-7 h-7 text-cyan-600" />
              {selectedTile === 'meetings' && 'مدیریت و آرشیو جلسات کمیته ایمنی بیمار'}
              {selectedTile === 'rca' && 'کاربرگ تحلیل ریشه‌ای خطا (RCA)'}
              {selectedTile === 'quarterly' && 'خودارزیابی فصلی ایمنی بیمار'}
              {!selectedTile && 'جلسات، خودارزیابی و مصوبات کمیته ایمنی بیمار'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
              {selectedTile === 'meetings' && 'ثبت صورتجلسه جدید، تعیین وزن مصوبات، آرشیو جلسات و تنظیم انتشار عمومی'}
              {selectedTile === 'rca' && 'طراحی، تکمیل و پیگیری ۷ گام کاربرگ RCA و نمودار استخوان ماهی'}
              {selectedTile === 'quarterly' && 'ثبت ارزیابی ۲۵ استاندارد الزامی، محاسبه درصد موفقیت و خروجی Word'}
              {!selectedTile && 'لطفاً یکی از بخش‌های زیر را برای مدیریت جلسات و ارزیابی ایمنی انتخاب کنید'}
            </p>
          </div>
        </div>
      </div>

      {/* ================= TILE SELECTION SCREEN (4 Tiles) ================= */}
      {!selectedTile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
          {/* Tile 1: مدیریت و آرشیو جلسات ایمنی */}
          <button
            onClick={() => setSelectedTile('meetings')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
                <CalendarCheck className="w-8 h-8 text-cyan-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-black">
                بخش شماره ۱
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۱. مدیریت و آرشیو جلسات ایمنی بیمار
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                ثبت صورتجلسه جدید، آرشیو کلیه سوابق جلسات، تعیین وزن مصوبات و تنظیمات انتشار عمومی
              </p>
            </div>
          </button>

          {/* Tile 2: کاربرگ RCA */}
          <button
            onClick={() => setSelectedTile('rca')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 shadow-lg transition-all duration-300">
                <ClipboardList className="w-8 h-8 text-amber-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black">
                بخش شماره ۲
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۲. کاربرگ تحلیل ریشه‌ای خطا (RCA)
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                ثبت و پیگیری ۷ گام کاربرگ تحلیل ریشه‌ای خطاهای ایمنی بیمار، نمودار استخوان ماهی و برنامه‌های اصلاحی
              </p>
            </div>
          </button>

          {/* Tile 3: آنالیز FMEA */}
          <button
            onClick={() => setSelectedTile('fmea')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-teal-950 to-slate-900 p-7 text-white shadow-2xl border-2 border-emerald-400/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-emerald-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-emerald-200/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500/20 shadow-lg transition-all duration-300">
                <ShieldAlert className="w-8 h-8 text-emerald-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                بخش شماره ۳
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۳. آنالیز حالت‌های خطا و اثرات آن (FMEA)
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                شناسایی پیشگیرانه خطاهای بالقوه، محاسبه نمره اولویت ریسک (RPN)، برنامه‌های اصلاحی و دانلود فایل Word
              </p>
            </div>
          </button>

          {/* Tile 4: خودارزیابی فصلی */}
          <button
            onClick={() => setSelectedTile('quarterly')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400 flex flex-col justify-between min-h-[220px] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right ring-2 ring-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/25 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:bg-purple-500/20 shadow-lg transition-all duration-300">
                <FileCheck className="w-8 h-8 text-purple-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-400/20 border border-purple-400/40 text-purple-300 text-xs font-black">
                بخش شماره ۴
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                ۴. خودارزیابی فصلی ایمنی بیمار
              </h3>
              <p className="text-xs text-indigo-200/80 font-bold mt-2 leading-relaxed">
                تکمیل فرم خودارزیابی دوره‌ای ۲۵ استاندارد الزامی، محاسبه مجموع امتیازات، درصد موفقیت و دریافت خروجی Word
              </p>
            </div>
          </button>
        </div>
      )}

      {/* ================= TILE 1 CONTENT: UNIFIED MEETINGS SECTION ================= */}
      {selectedTile === 'meetings' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-tab Switcher Bar */}
          <div className="flex items-center gap-3 p-1.5 bg-indigo-950/90 border-2 border-indigo-300/30 rounded-2xl shadow-xl">
            <button
              type="button"
              onClick={() => setMeetingSubTab('create')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                meetingSubTab === 'create'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg ring-1 ring-cyan-300/30'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-cyan-300" />
              <span>۱. ثبت صورتجلسه جدید</span>
            </button>

            <button
              type="button"
              onClick={() => setMeetingSubTab('archive')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                meetingSubTab === 'archive'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg ring-1 ring-cyan-300/30'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Archive className="w-4 h-4 text-emerald-300" />
              <span>۲. آرشیو جلسات و تنظیم نمایش عمومی ({toPersianDigits(meetings.length)})</span>
            </button>
          </div>

          {/* Sub-Tab 1: Create or Edit Meeting */}
          {meetingSubTab === 'create' && (
            <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-400/20 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {editingMeetingId ? (
                    <>
                      <Edit3 className="w-5 h-5 text-amber-400" />
                      <span>ویرایش صورتجلسه کمیته ایمنی بیمار</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 text-cyan-400" />
                      <span>فرم ثبت صورتجلسه جدید کمیته ایمنی بیمار</span>
                    </>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {editingMeetingId && (
                    <button
                      type="button"
                      onClick={handleAddNewMeetingClick}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-rose-400" />
                      <span>انصراف و ثبت جلسه جدید</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMeetingSubTab('archive')}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-bold border border-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Archive className="w-4 h-4 text-emerald-300" />
                    <span>مشاهده آرشیو ({toPersianDigits(meetings.length)})</span>
                  </button>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      {lastSavedMeeting
                        ? `صورتجلسه «${lastSavedMeeting.subject}» با موفقیت ذخیره گردید.`
                        : 'صورتجلسه با موفقیت ذخیره گردید.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lastSavedMeeting && (
                      <button
                        type="button"
                        onClick={() => downloadMeetingMinutesDocx(lastSavedMeeting)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>دانلود خروجی Word این جلسه</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMeetingSubTab('archive')}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
                    >
                      مشاهده در آرشیو
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitMeeting} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                      موضوع جلسه <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: بررسی حوادث ناخواسته فصل بهار"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                      دبیر جلسه <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: آقای دکتر موسوی"
                      value={secretary}
                      onChange={(e) => setSecretary(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                      تاریخ برگزاری (شمسی)
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: 1403/05/10"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                    اعضای حاضر در جلسه (با کاما جدا کنید)
                  </label>
                  <input
                    type="text"
                    placeholder="دکتر موسوی، سرپرستار کاظمی، مهندس علوی"
                    value={attendeesStr}
                    onChange={(e) => setAttendeesStr(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                    شرح و مباحث مطرح‌شده در جلسه
                  </label>
                  <textarea
                    rows={3}
                    placeholder="شرح خلاصه مذاکرات و تحلیل‌های صورت گرفته..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Dynamic Resolutions Section */}
                <div className="space-y-4 pt-4 border-t border-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white">مصوبات تصویب‌شده جلسه</h4>
                    <button
                      type="button"
                      onClick={handleAddResolutionRow}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/30 text-cyan-100 border border-cyan-400/50 text-xs font-black hover:bg-cyan-500/40 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن مصوبه جدید</span>
                    </button>
                  </div>

                  {resolutions.map((res, index) => (
                    <div key={index} className="p-4 bg-[#06182e] rounded-2xl border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">مصوبه شماره {index + 1}</span>
                        {resolutions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveResolutionRow(index)}
                            className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="شرح کامل مصوبه..."
                        value={res.text}
                        onChange={(e) => handleResolutionChange(index, 'text', e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-cyan-100 mb-1 font-bold">وزن/اهمیت (۱ تا ۵):</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={res.weight}
                            onChange={(e) => handleResolutionChange(index, 'weight', Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-black text-center focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-cyan-100 mb-1 font-bold">اولویت اجرا:</label>
                          <select
                            value={res.priority}
                            onChange={(e) => handleResolutionChange(index, 'priority', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-cyan-400"
                          >
                            <option value="high">بالا</option>
                            <option value="medium">متوسط</option>
                            <option value="low">پایین</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-cyan-100 mb-1 font-bold">مسئول پیگیری:</label>
                          <input
                            type="text"
                            placeholder="نام فرد/واحد"
                            value={res.responsiblePerson}
                            onChange={(e) => handleResolutionChange(index, 'responsiblePerson', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-cyan-100 mb-1 font-bold">مهلت انجام:</label>
                          <input
                            type="text"
                            placeholder="تاریخ یا روز"
                            value={res.deadline}
                            onChange={(e) => handleResolutionChange(index, 'deadline', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`pub-${index}`}
                          checked={res.isPublic}
                          onChange={(e) => handleResolutionChange(index, 'isPublic', e.target.checked)}
                          className="rounded bg-white border-slate-300 text-cyan-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor={`pub-${index}`} className="text-xs text-cyan-100 font-bold cursor-pointer">
                          نمایش این مصوبه در صفحه اصلی (مخاطب عمومی)
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-black text-sm shadow-lg shadow-cyan-600/20 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingMeetingId ? 'ذخیره تغییرات صورتجلسه' : 'ثبت و ذخیره صورتجلسه'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiModalData({ subject, secretary, description, meetingDate, attendeesStr, resolutions });
                        setAiModalTitle(`تحلیل صورتجلسه ایمنی: ${subject || 'جلسه ایمنی'}`);
                        setAiModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm shadow-lg transition cursor-pointer ring-2 ring-purple-300/40 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>تحلیل مصوبات با هوش مصنوعی</span>
                    </button>
                    {editingMeetingId && (
                      <button
                        type="button"
                        onClick={handleAddNewMeetingClick}
                        className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition cursor-pointer"
                      >
                        انصراف
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {meetingSubTab === 'archive' && (
            /* Sub-Tab 2: Archive & Public Resolutions Toggle */
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-indigo-950">آرشیو صورتجلسات ثبت‌شده</h3>
                <button
                  type="button"
                  onClick={handleAddNewMeetingClick}
                  className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 text-cyan-300" />
                  <span>ثبت جلسه جدید</span>
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-indigo-950 font-bold text-sm">در حال بارگذاری صورتجلسات...</div>
              ) : meetings.length === 0 ? (
                <div className="py-12 text-center text-indigo-950 font-bold text-sm bg-white/80 rounded-3xl border border-indigo-100 shadow-md">
                  هنوز جلسه‌ای ثبت نشده است.
                </div>
              ) : (
                <>
                  {meetings
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((m) => (
                      <div key={m.id} className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 shadow-2xl space-y-4 text-white text-right">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-400/20 pb-3">
                          <div>
                            <h4 className="text-lg font-black text-white">{m.subject}</h4>
                            <span className="text-xs text-cyan-300 font-bold">دبیر جلسه: {m.secretary}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-cyan-100 bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-400/20 font-semibold">
                              تاریخ: {m.meetingDate}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setAiModalData(m);
                                setAiModalTitle(`تحلیل صورتجلسه ایمنی: ${m.subject}`);
                                setAiModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white border border-purple-300/40 text-xs font-black hover:from-purple-500 hover:to-cyan-500 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                              title="تحلیل هوشمند مصوبات با استناد به منابع مرجع"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>تحلیل با AI</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadMeetingMinutesDocx(m)}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-xs font-bold hover:bg-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer"
                              title="دانلود فایل Word صورتجلسه"
                            >
                              <Download className="w-3.5 h-3.5 text-cyan-300" />
                              <span>دانلود Word</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditMeeting(m)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
                              title="ویرایش صورتجلسه"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                              <span>ویرایش</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMeeting(m.id)}
                              className="p-2 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-bold hover:bg-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
                              title="حذف صورتجلسه"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-cyan-50 leading-relaxed font-medium">{m.description}</p>

                        {/* Resolutions list inside archive */}
                        <div className="space-y-2 pt-2">
                          <h5 className="text-xs font-bold text-slate-400">مصوبات جلسه:</h5>
                          {m.resolutions.map((r) => (
                            <div
                              key={r.id}
                              className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex-1 space-y-1">
                                <span className="font-bold text-white block">{r.text}</span>
                                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                  <span>مسئول پیگیری: {r.responsiblePerson || 'نامشخص'}</span>
                                  <span>مهلت: {r.deadline || '---'}</span>
                                  <span>وزن: {toPersianDigits(r.weight)}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleTogglePublicResolution(m.id, r.id, r.isPublic)}
                                className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                                  r.isPublic
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {r.isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{r.isPublic ? 'نمایش عمومی فعال' : 'مخفی از عمومی'}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                  {/* Pagination Controls */}
                  {Math.ceil(meetings.length / ITEMS_PER_PAGE) > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-cyan-500/20 bg-[#0c2a4a] p-4 rounded-3xl shadow-xl text-white dir-rtl">
                      <span className="text-xs font-extrabold text-cyan-200">
                        نمایش صفحه {toPersianDigits(currentPage)} از {toPersianDigits(Math.ceil(meetings.length / ITEMS_PER_PAGE))} (مجموع {toPersianDigits(meetings.length)} صورتجلسه - هر صفحه ۱۵ مورد)
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-200 text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-cyan-500/30"
                        >
                          صفحه قبل
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.ceil(meetings.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`w-9 h-9 rounded-xl text-xs font-black transition cursor-pointer ${
                                currentPage === p
                                  ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                                  : 'bg-cyan-950 text-cyan-300 hover:bg-cyan-900'
                              }`}
                            >
                              {toPersianDigits(p)}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(meetings.length / ITEMS_PER_PAGE)))}
                          disabled={currentPage === Math.ceil(meetings.length / ITEMS_PER_PAGE)}
                          className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-200 text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-cyan-500/30"
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
        </div>
      )}

      {/* ================= TILE 2 CONTENT: RCA WORKSHEET ================= */}
      {selectedTile === 'rca' && <RcaFormAdmin />}

      {/* ================= TILE 3 CONTENT: FMEA ANALYSIS ================= */}
      {selectedTile === 'fmea' && <FmeaFormAdmin />}

      {/* ================= TILE 4 CONTENT: QUARTERLY SELF-ASSESSMENT ================= */}
      {selectedTile === 'quarterly' && <QuarterlySelfAssessmentAdmin />}

      {/* AI Medical Analysis Modal */}
      <MedicalAiAnalyzerModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        contextType="SafetyMeeting"
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
