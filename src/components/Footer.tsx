import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { getFullJalaliDateTimeString } from '../utils/jalali';

export const Footer: React.FC = () => {
  const [dateTimeStr, setDateTimeStr] = useState<string>('');

  useEffect(() => {
    setDateTimeStr(getFullJalaliDateTimeString());
    const interval = setInterval(() => {
      setDateTimeStr(getFullJalaliDateTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full mt-auto py-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 border-t border-cyan-400/40 text-white text-sm sm:text-base no-print shadow-2xl relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Branding / Signature */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/10 border border-amber-300/30 shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <span className="font-serif italic font-black text-lg sm:text-xl tracking-wider bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)]">
              Hossein Nassari Art
            </span>
          </div>
          <span className="text-white/40 hidden sm:inline">|</span>
          <span className="text-cyan-200/80 text-xs sm:text-sm font-bold hidden sm:inline">
            سامانه جامع مدیریت و ارتقای ایمنی بیمار
          </span>
        </div>

        {/* Live Glassmorphic Date & Time Display */}
        <div className="px-5 py-2 rounded-2xl flex items-center gap-3 border border-cyan-400/30 bg-white/10 backdrop-blur-md shadow-lg text-white">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
          </div>
          <span className="font-black text-white tracking-wide text-xs sm:text-sm">
            {dateTimeStr || 'در حال دریافت زمان...'}
          </span>
        </div>
      </div>
    </footer>
  );
};

