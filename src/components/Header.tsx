import React from 'react';
import { Lock, Info, LogOut, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onOpenAboutModal: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuthModal,
  onOpenAboutModal,
  onLogout,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-cyan-400/30 shadow-xl py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* App Title and Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 sm:gap-3 text-right hover:opacity-95 transition group focus:outline-none cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-300" />
          </div>
          <div className="text-right">
            <h1 className="text-base sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5 leading-tight">
              <span>سامانه جامع ایمنی بیمار</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold hidden sm:inline-flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-slate-950" />
                Safe Care
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-cyan-200/90 font-medium hidden xs:block">
              سامانه جامع ارتقاء ایمنی، آموزش و گزارش‌دهی حوادث
            </p>
          </div>
        </button>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <button
              onClick={onLogout}
              title="خروج از حساب کاربری"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 text-xs font-black shadow-md transition active:scale-95 cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4 text-rose-300" />
              <span>خروج</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer border border-amber-300"
            >
              <Lock className="w-3.5 h-3.5 text-slate-950" />
              <span>ورود مدیریت</span>
            </button>
          )}

          {/* About Button */}
          <button
            onClick={onOpenAboutModal}
            title="درباره سامانه"
            className="p-2 sm:p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-md transition active:scale-95 cursor-pointer shrink-0"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
