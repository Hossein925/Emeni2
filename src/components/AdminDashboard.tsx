import React, { useState, useEffect } from 'react';
import {
  Building2,
  Activity,
  UserCheck,
  CalendarCheck,
  ClipboardList,
  AlertTriangle,
  BookOpenCheck,
  ShieldCheck,
  Crown,
  Megaphone,
  Database,
  RefreshCw,
  Copy,
  Check,
  Code2,
  CheckCircle2,
  XCircle,
  Smartphone,
  Monitor,
  Image,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { User } from '../types';
import {
  checkSupabaseConnection,
  COMPLETE_SUPABASE_SQL_SCRIPT,
  getSupabaseConfig,
  reinitializeSupabase,
  clearCustomSupabaseConfig,
} from '../services/supabase';
import { syncDataFromSupabase } from '../services/dal';
import {
  applyAppIcon,
  processUploadedImageToIcon,
  resetAppIconToDefault,
  ProcessedAppIcons,
} from '../utils/appIconHelper';

interface AdminDashboardProps {
  currentUser: User;
  onSelectAdminSection: (
    section:
      | 'dept_managers'
      | 'indicators'
      | 'evaluations'
      | 'meetings'
      | 'checklists'
      | 'error_reports'
      | 'education'
      | 'visits'
      | 'ticker'
  ) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onSelectAdminSection,
}) => {
  const [supabaseStatus, setSupabaseStatus] = useState<{
    loading: boolean;
    connected: boolean;
    message: string;
  }>({
    loading: true,
    connected: false,
    message: 'در حال بررسی وضعیت اتصال دیتابیس ابری...',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [activeDbTab, setActiveDbTab] = useState<'sql' | 'icon'>('sql');

  // Supabase Credentials State
  const initialConfig = getSupabaseConfig();
  const [inputSupabaseUrl, setInputSupabaseUrl] = useState(initialConfig.url);
  const [inputSupabaseKey, setInputSupabaseKey] = useState(initialConfig.key);

  const handleSaveSupabaseCredentials = () => {
    if (!inputSupabaseUrl || !inputSupabaseKey) {
      alert('لطفاً هر دو مقادیر آدرس Supabase URL و کلید Anon Key را وارد نمایید.');
      return;
    }
    reinitializeSupabase(inputSupabaseUrl.trim(), inputSupabaseKey.trim());
    verifyConnection();
    alert('اطلاعات اتصال به Supabase با موفقیت به‌روزرسانی و ذخیره گردید!');
  };

  const handleResetSupabaseCredentials = () => {
    if (confirm('آیا از بازنشانی تنظیمات اتصال دیتابیس به حالت پیش‌فرض اطمینان دارید؟')) {
      clearCustomSupabaseConfig();
      const current = getSupabaseConfig();
      setInputSupabaseUrl(current.url);
      setInputSupabaseKey(current.key);
      verifyConnection();
      alert('تنظیمات به حالت اولیه بازنشانی گردید.');
    }
  };

  // App Icon Management State
  const [customIconUrl, setCustomIconUrl] = useState<string>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('hospital_custom_app_icon') || '' : '')
  );
  const [processedIcons, setProcessedIcons] = useState<ProcessedAppIcons | null>(null);
  const [isProcessingIcon, setIsProcessingIcon] = useState(false);
  const [iconSuccessMsg, setIconSuccessMsg] = useState('');

  const handleFileUploadForIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingIcon(true);
    setIconSuccessMsg('');
    try {
      const res = await processUploadedImageToIcon(file);
      setProcessedIcons(res);
      setIconSuccessMsg('تصویر با موفقیت در اندازه‌های مختلف پردازش گردید. جهت اعمال نهایی روی دکمه "ذخیره و اعمال بعنوان آیکون اصلی" کلیک کنید.');
    } catch (err: any) {
      alert(err.message || 'خطا در پردازش تصویر لوگو');
    } finally {
      setIsProcessingIcon(false);
    }
  };

  const handleApplyIcon = () => {
    if (!processedIcons) return;
    applyAppIcon(processedIcons.icon512);
    setCustomIconUrl(processedIcons.icon512);
    setIconSuccessMsg('آیکون جدید برنامه با موفقیت ذخیره و روی تمامی دستگاه‌ها (مرورگر، آیفون، آندروید و میانبرهای وب) اعمال گردید!');
    setTimeout(() => setIconSuccessMsg(''), 5000);
  };

  const handleResetIcon = () => {
    if (confirm('آیا از بازنشانی آیکون به حالت پیش‌فرض اطمینان دارید؟')) {
      resetAppIconToDefault();
      setCustomIconUrl('');
      setProcessedIcons(null);
      setIconSuccessMsg('آیکون برنامه به حالت پیش‌فرض سیستم بازنشانی شد.');
      setTimeout(() => setIconSuccessMsg(''), 4000);
    }
  };

  const verifyConnection = async () => {
    setSupabaseStatus({ loading: true, connected: false, message: 'در حال تست ارتباط با Supabase...' });
    const res = await checkSupabaseConnection();
    setSupabaseStatus({
      loading: false,
      connected: res.connected,
      message: res.message,
    });
  };

  useEffect(() => {
    verifyConnection();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const res = await syncDataFromSupabase();
    alert(res.message);
    setIsSyncing(false);
    verifyConnection();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(COMPLETE_SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Top Welcome Title */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 border-2 border-indigo-200 shadow-xl flex items-center justify-between text-white relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 mb-1">
            <Crown className="w-4 h-4 text-amber-300" />
            <span>پنل ادمین کل سامانه</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            خوش آمدید، {currentUser?.name || 'مدیر کل'}
          </h2>
          <p className="text-xs text-cyan-100 font-bold mt-1">
            دسترسی کامل مدیریت بیمارستان جهت نظارت، ارزیابی، تعریف بخش‌ها، نوار متحرک، تحلیل شاخص‌ها و دیتابیس
          </p>
        </div>
      </div>

      {/* Admin Tiles Grid - Strictly 2 per row, Square Aspect Ratio, Icon at Top-Right, Title Only */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mb-12">
        {/* Tile 1: معرفی مسئولین بخش‌ها */}
        <button
          onClick={() => onSelectAdminSection('dept_managers')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۱. مسئولین بخش‌ها و کارشناسان ایمنی بیمار
            </h3>
          </div>
        </button>

        {/* Tile 2: شاخص‌های ایمنی بیمار */}
        <button
          onClick={() => onSelectAdminSection('indicators')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-200 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۲. شاخص‌های ایمنی بیمار
            </h3>
          </div>
        </button>

        {/* Tile 3: ارزیابی پرسنل */}
        <button
          onClick={() => onSelectAdminSection('evaluations')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500/20 shadow-lg transition-all duration-300">
              <UserCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۳. ارزیابی پرسنل
            </h3>
          </div>
        </button>

        {/* Tile 4: جلسات و خودارزیابی */}
        <button
          onClick={() => onSelectAdminSection('meetings')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500/20 shadow-lg transition-all duration-300">
              <CalendarCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۴. جلسات و خودارزیابی
            </h3>
          </div>
        </button>

        {/* Tile 5: چک‌لیست‌ها */}
        <button
          onClick={() => onSelectAdminSection('checklists')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:bg-purple-500/20 shadow-lg transition-all duration-300">
              <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۵. چک‌لیست‌ها
            </h3>
          </div>
        </button>

        {/* Tile 6: گزارش خطا */}
        <button
          onClick={() => onSelectAdminSection('error_reports')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-rose-300 group-hover:scale-110 group-hover:bg-rose-500/20 shadow-lg transition-all duration-300">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۶. گزارش خطا
            </h3>
          </div>
        </button>

        {/* Tile 7: آموزش ایمنی بیمار */}
        <button
          onClick={() => onSelectAdminSection('education')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 shadow-lg transition-all duration-300">
              <BookOpenCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۷. آموزش ایمنی بیمار
            </h3>
          </div>
        </button>

        {/* Tile 8: بازدیدهای ایمنی */}
        <button
          onClick={() => onSelectAdminSection('visits')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-teal-300 group-hover:scale-110 group-hover:bg-teal-500/20 shadow-lg transition-all duration-300">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۸. بازدیدهای ایمنی
            </h3>
          </div>
        </button>

        {/* Tile 9: نوار اطلاع‌رسانی متحرک */}
        <button
          onClick={() => onSelectAdminSection('ticker')}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 shadow-lg transition-all duration-300">
              <Megaphone className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۹. نوار اطلاع‌رسانی متحرک
            </h3>
          </div>
        </button>

        {/* Tile 10: دیتابیس ابری Supabase و اسکریپت SQL */}
        <button
          onClick={() => setShowDbModal(true)}
          className="metro-tile group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-7 text-white shadow-2xl border-2 border-indigo-300/40 hover:border-amber-400/80 flex flex-col justify-between aspect-square hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-right"
        >
          <div className="flex justify-start">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-indigo-200/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 shadow-lg transition-all duration-300">
              <Database className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight group-hover:text-amber-300 transition-colors">
              ۱۰. مدیریت دیتابیس Supabase و اسکریپت SQL
            </h3>
          </div>
        </button>
      </div>

      {/* Database & App Icon Management Modal (Super Admin Only) */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn dir-rtl">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-right overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>مدیریت دیتابیس ابری و آیکون برنامه</span>
                    {supabaseStatus.loading ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : supabaseStatus.connected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 font-bold">
                    {supabaseStatus.message}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs Header */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setActiveDbTab('sql')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      activeDbTab === 'sql'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                    <span>دیتابیس و کد SQL</span>
                  </button>

                  <button
                    onClick={() => setActiveDbTab('icon')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      activeDbTab === 'icon'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    <span>آیکون و نشان برنامه</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowDbModal(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold cursor-pointer transition shrink-0"
                >
                  بستن
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* TAB 1: SQL Database Management */}
              {activeDbTab === 'sql' && (
                <div className="space-y-6">
                  {/* Connection Status Box */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    supabaseStatus.connected
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {supabaseStatus.connected ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-xs sm:text-sm">
                          {supabaseStatus.connected ? 'اتصال به دیتابیس Supabase برقرار است' : 'دیتابیس Supabase متصل نیست'}
                        </div>
                        <p className="text-[11px] opacity-80 mt-0.5">{supabaseStatus.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Supabase URL & Key Configuration Form */}
                  <div className="p-5 rounded-2xl bg-slate-950/90 border border-indigo-900/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-amber-400" />
                        <h4 className="text-xs sm:text-sm font-black text-white">تنظیم آدرس و کلید Supabase (ویژه ورسل و هاست)</h4>
                      </div>
                      <span className="text-[10px] text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800/50">
                        قابلیت تنظیم آنلاین
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          آدرس دیتابیس (Supabase URL):
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={inputSupabaseUrl}
                          onChange={(e) => setInputSupabaseUrl(e.target.value)}
                          placeholder="https://xxxx.supabase.co"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          کلید عمومی (Supabase Anon Key):
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={inputSupabaseKey}
                          onChange={(e) => setInputSupabaseKey(e.target.value)}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveSupabaseCredentials}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          <span>ذخیره و برقراری اتصال</span>
                        </button>

                        <button
                          onClick={handleResetSupabaseCredentials}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>بازنشانی پیش‌فرض</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        💡 می‌توانید مقادیر فوق را در پنل <strong className="text-cyan-300">Supabase &rarr; Project Settings &rarr; API</strong> کپی کنید.
                      </div>
                    </div>
                  </div>

                  {/* Vercel Environment Variables Guide */}
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-slate-300 text-xs leading-relaxed space-y-2">
                    <p className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>🚀 راهنمای اتصال همیشگی در Vercel (محیط Vercel Environment Variables):</span>
                    </p>
                    <p>
                      برای اینکه برنامه در ورسل (Vercel) پس از دیپلوی همیشه متصل باشد و دیتابیس و آیکون‌ها در تمام گوشی‌ها همگام شوند، در تنظیمات پروژه ورسل خود وارد بخش <strong className="text-amber-300">Settings -&gt; Environment Variables</strong> شوید و متغیرهای زیر را اضافه کنید:
                    </p>
                    <ul className="list-disc list-inside space-y-1 dir-ltr text-left font-mono text-[11px] text-cyan-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <li>VITE_SUPABASE_URL = {inputSupabaseUrl || 'https://xxxx.supabase.co'}</li>
                      <li>VITE_SUPABASE_ANON_KEY = {inputSupabaseKey ? inputSupabaseKey.slice(0, 30) + '...' : 'eyJhbG...'}</li>
                    </ul>
                    <p className="text-[11px] text-slate-400">
                      پس از ذخیره متغیرها در Vercel، دکمه <strong className="text-emerald-400">Redeploy</strong> را بزنید تا بیلد جدید ورسل تنظیمات را اعمال کند.
                    </p>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={verifyConnection}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>تست مجدد اتصال</span>
                      </button>

                      <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>همگام‌سازی دستی داده‌ها</span>
                      </button>
                    </div>

                    <button
                      onClick={handleCopySql}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-950" />
                          <span>کپی شد!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>کپی تمام کد اسکریپت SQL</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-slate-300 text-xs leading-relaxed">
                    <p className="font-bold text-amber-300 mb-1">💡 راهنمای ساخت/اصلاح دیتابیس:</p>
                    <p>
                      در صورتی که اولین بار است دیتابیس را راه‌اندازی می‌کنید یا تغییراتی در جداول ایجاد شده، دکمه <strong className="text-amber-300">کپی تمام کد اسکریپت SQL</strong> را بزنید، سپس در پنل Supabase خود وارد بخش <strong className="text-amber-300">SQL Editor</strong> شده، اسکریپت را Paste کرده و روی <strong className="text-emerald-400">Run</strong> کلیک نمایید.
                    </p>
                  </div>

                  {/* SQL Code View */}
                  <div className="rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono">supabase_schema_and_storage.sql</span>
                      <Code2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs dir-ltr text-left max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-all select-all">
                        {COMPLETE_SUPABASE_SQL_SCRIPT}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: App Icon Management & Processing */}
              {activeDbTab === 'icon' && (
                <div className="space-y-6">
                  {/* Title Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 border border-cyan-500/30 text-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span>پردازش و تنظیم هوشمند آیکون برنامه (App Icon & Favicon & PWA)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      تصویر لوگوی جدید بیمارستان یا نشان تجاری مورد نظر را انتخاب نمایید. سیستم به‌صورت خودکار ابعاد تصویر را برش داده و در اندازه‌های ۵۱۲x۵۱۲، ۱۹۲x۱۹۲، ۱۸۰x۱۸۰ و ۳۲x۳۲ برای تمامی رایانه‌ها، گوشی‌های آیفون (iOS)، آندروید و میانبر وب (Add to Home Screen) تنظیم می‌کند.
                    </p>
                  </div>

                  {/* Icon Upload Box */}
                  <div className="p-6 rounded-2xl bg-slate-950/80 border-2 border-dashed border-slate-700 hover:border-cyan-400 transition flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
                      {isProcessingIcon ? (
                        <RefreshCw className="w-8 h-8 animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white">انتخاب تصویر لوگو یا نشان جدید</h4>
                      <p className="text-xs text-slate-400 mt-1">فرمت‌های پشتیبانی‌شده: PNG, JPG, WebP, SVG (ترجیحاً مربع شکل)</p>
                    </div>

                    <label className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-lg cursor-pointer transition flex items-center gap-2 active:scale-95">
                      <Upload className="w-4 h-4" />
                      <span>انتخاب فایل تصویر</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUploadForIcon}
                        className="hidden"
                      />
                    </label>

                    {isProcessingIcon && (
                      <p className="text-xs text-amber-300 font-bold animate-pulse">
                        در حال پردازش تصویر و ایجاد سایزهای استاندارد...
                      </p>
                    )}
                  </div>

                  {/* Status message */}
                  {iconSuccessMsg && (
                    <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{iconSuccessMsg}</span>
                    </div>
                  )}

                  {/* Device Previews Grid */}
                  {(processedIcons || customIconUrl) && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Monitor className="w-4 h-4 text-amber-400" />
                        <span>پیش‌نمایش آیکون برنامه در دستگاه‌های مختلف:</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Preview 1: iOS iPhone App Icon */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                            <span>آیفون و آیپد (iOS)</span>
                          </div>

                          <div className="w-16 h-16 rounded-[18px] overflow-hidden shadow-2xl border border-white/20 bg-slate-900 p-0.5">
                            <img
                              src={processedIcons?.icon180 || customIconUrl}
                              alt="iOS Icon"
                              className="w-full h-full object-cover rounded-[16px]"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">180x180 px</span>
                        </div>

                        {/* Preview 2: Android / PWA Icon */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>آندروید و PWA</span>
                          </div>

                          <div className="w-16 h-16 rounded-full overflow-hidden shadow-2xl border border-white/20 bg-slate-900 p-0.5">
                            <img
                              src={processedIcons?.icon192 || customIconUrl}
                              alt="Android Icon"
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">192x192 / 512x512 px</span>
                        </div>

                        {/* Preview 3: Desktop Browser Favicon */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <Monitor className="w-3.5 h-3.5 text-amber-400" />
                            <span>تب مرورگر وب</span>
                          </div>

                          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 max-w-full">
                            <img
                              src={processedIcons?.icon32 || customIconUrl}
                              alt="Favicon"
                              className="w-4 h-4 rounded-sm object-cover"
                            />
                            <span className="text-[10px] text-slate-300 font-bold truncate max-w-[120px]">
                              سامانه مدیریت کیفیت
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">32x32 px Favicon</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                        {processedIcons && (
                          <button
                            onClick={handleApplyIcon}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>ذخیره و اعمال بعنوان آیکون اصلی برنامه</span>
                          </button>
                        )}

                        <button
                          onClick={handleResetIcon}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>بازنشانی به آیکون پیش‌فرض</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
