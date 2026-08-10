import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ShieldCheck } from 'lucide-react';
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
    <footer className="w-full mt-auto py-3.5 bg-gradient-to-r from-blue-800 via-indigo-800 to-cyan-800 border-t border-cyan-300/40 text-white text-xs sm:text-sm no-print shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left branding */}
        <div className="flex items-center gap-2 text-white font-bold">
          <ShieldCheck className="w-5 h-5 text-amber-300" />
          <span>سامانه مدیریت ایمنی بیمار بیمارستانی</span>
          <span className="text-white/40 hidden sm:inline">|</span>
          <span className="text-cyan-100 text-xs font-semibold hidden sm:inline">نسخه جامع ۱۴۰۵</span>
        </div>

        {/* Live Glassmorphic Date & Time Display */}
        <div className="px-4 py-1.5 rounded-2xl flex items-center gap-3 border border-white/30 bg-white/15 backdrop-blur-md shadow-lg text-white">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Calendar className="w-4 h-4" />
            <Clock className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white tracking-wide text-xs sm:text-sm">
            {dateTimeStr || 'در حال دریافت زمان...'}
          </span>
        </div>
      </div>
    </footer>
  );
};
