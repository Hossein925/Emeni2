import React, { useState, useEffect } from 'react';
import { Megaphone, Pause, Play, Edit3 } from 'lucide-react';
import { Announcement, User } from '../types';
import { DataAccessLayer } from '../services/dal';

interface TickerBannerProps {
  currentUser?: User | null;
  onEditTicker?: () => void;
}

interface SingleTickerRowProps {
  announcement: Announcement;
  isPaused: boolean;
}

const SingleTickerRow: React.FC<SingleTickerRowProps> = ({ announcement, isPaused }) => {
  const rawContent = announcement.content || '';
  const plainText = rawContent.replace(/<[^>]*>/g, ' ').trim();
  const textLength = Math.max(plainText.length, 10);

  // Repeat base text enough times so 1 block is wide enough to fill any screen completely
  const repeatsNeeded = Math.max(3, Math.ceil(300 / textLength));
  const unitHtml = Array(repeatsNeeded)
    .fill(rawContent)
    .join(' &nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#fbbf24; font-size: 16px;">✦</span> &nbsp;&nbsp;&nbsp;&nbsp; ');

  // Speed calculation (~12 chars per second or custom speed)
  const customSpeed = announcement.speed;
  const calculatedDuration = customSpeed || Math.max(15, Math.round((plainText.length * repeatsNeeded) / 12));

  return (
    <div dir="ltr" className="w-full overflow-hidden relative py-2.5 bg-slate-950/60 rounded-2xl border border-indigo-800/40 px-2">
      <div
        className={`flex w-max whitespace-nowrap ${
          isPaused ? '' : 'animate-ticker-continuous'
        }`}
        style={
          {
            '--ticker-speed': `${calculatedDuration}s`,
          } as React.CSSProperties
        }
      >
        {/* Block 1 */}
        <div
          dir="rtl"
          className="ticker-text-block flex items-center px-8 font-extrabold text-sm sm:text-base text-cyan-50 leading-relaxed text-right shrink-0"
          dangerouslySetInnerHTML={{
            __html: unitHtml + ' &nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#fbbf24; font-size: 16px;">✦</span> &nbsp;&nbsp;&nbsp;&nbsp; ',
          }}
        />
        {/* Block 2 (Exact duplicate for 100% continuous, gapless, seamless infinite scroll) */}
        <div
          dir="rtl"
          className="ticker-text-block flex items-center px-8 font-extrabold text-sm sm:text-base text-cyan-50 leading-relaxed text-right shrink-0"
          dangerouslySetInnerHTML={{
            __html: unitHtml + ' &nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#fbbf24; font-size: 16px;">✦</span> &nbsp;&nbsp;&nbsp;&nbsp; ',
          }}
        />
      </div>
    </div>
  );
};

export const TickerBanner: React.FC<TickerBannerProps> = ({ currentUser, onEditTicker }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await DataAccessLayer.getAnnouncements();
    const active = data.filter((a) => a.isActive && a.content && a.content.trim() !== '');

    // Sort active announcements chronologically by creation time (oldest first, newer stacked below)
    active.sort((a, b) => {
      const timeA = parseInt((a.id || '').replace('ann-', ''), 10) || 0;
      const timeB = parseInt((b.id || '').replace('ann-', ''), 10) || 0;
      if (timeA && timeB) return timeA - timeB;
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });

    setAnnouncements(active);
  };

  if (announcements.length === 0) {
    return (
      <div className="mb-8 w-full bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 border-2 border-indigo-200 rounded-3xl p-6 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-amber-300 block mb-0.5">موضوع: سامانه جامع ایمنی بیمار</span>
            <span className="text-sm font-bold text-cyan-100">
              خوش آمدید. هنوز اطلاعیه جدیدی فعال نشده است.
            </span>
          </div>
        </div>
        {currentUser?.role === 'super_admin' && onEditTicker && (
          <button
            onClick={onEditTicker}
            className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
          >
            <Edit3 className="w-4 h-4" />
            <span>مدیریت نوار</span>
          </button>
        )}
      </div>
    );
  }

  // Combined topics for top header badge
  const topicsTitle = announcements.map((a) => a.title).filter(Boolean).join(' | ') || 'اطلاعیه ایمنی بیمار';

  return (
    <div className="mb-8 w-full bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 border-2 border-indigo-200 rounded-3xl shadow-2xl overflow-hidden text-white relative group transition-all duration-300">
      {/* Top glowing accent border */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400"></div>

      {/* SINGLE TOP HEADER FOR ALL TICKERS */}
      <div className="bg-indigo-950/80 border-b border-indigo-800/60 px-5 py-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Megaphone icon before word "موضوع:" */}
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
            <Megaphone className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-black text-amber-300 text-xs sm:text-sm shrink-0">
            موضوع:
          </span>
          <span className="font-extrabold text-cyan-100 text-xs sm:text-sm tracking-tight truncate">
            {topicsTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'شروع حرکت' : 'توقف نوار'}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-200 border border-white/20 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-300" /> : <Pause className="w-3.5 h-3.5 text-amber-300" />}
            <span>{isPaused ? 'شروع' : 'توقف'}</span>
          </button>

          {currentUser?.role === 'super_admin' && onEditTicker && (
            <button
              onClick={onEditTicker}
              title="ویرایش نوار اطلاع‌رسانی"
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1 shadow-md cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ویرایش</span>
            </button>
          )}
        </div>
      </div>

      {/* SINGLE CONTAINER CONTENT AREA - Multiple Tickers stacked vertically inside */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 relative z-10">
        {announcements.map((ann) => (
          <SingleTickerRow key={ann.id} announcement={ann} isPaused={isPaused} />
        ))}
      </div>
    </div>
  );
};
