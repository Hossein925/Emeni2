import * as jalaali from 'jalaali-js';

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const JALALI_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه',
];

export function toPersianDigits(num: number | string): string {
  if (num === null || num === undefined) return '';
  const str = num.toString();
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

export function getCurrentJalaliDate(): { year: number; month: number; day: number; monthName: string; formatted: string } {
  const now = new Date();
  const j = jalaali.toJalaali(now);
  const monthName = JALALI_MONTHS[j.jm - 1];
  const formatted = `${toPersianDigits(j.jd)} ${monthName} ${toPersianDigits(j.jy)}`;
  return {
    year: j.jy,
    month: j.jm,
    day: j.jd,
    monthName,
    formatted,
  };
}

export function getFullJalaliDateTimeString(date: Date = new Date()): string {
  const j = jalaali.toJalaali(date);
  const dayOfWeek = JALALI_WEEKDAYS[date.getDay()];
  const monthName = JALALI_MONTHS[j.jm - 1];
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const timeStr = `${toPersianDigits(hours)}:${toPersianDigits(minutes)}:${toPersianDigits(seconds)}`;
  const dateStr = `${dayOfWeek} ${toPersianDigits(j.jd)} ${monthName} ${toPersianDigits(j.jy)}`;

  return `${dateStr} - ${timeStr}`;
}

export function formatGregorianToJalali(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // fallback if already Jalali or string
  const j = jalaali.toJalaali(date);
  return `${toPersianDigits(j.jy)}/${toPersianDigits(String(j.jm).padStart(2, '0'))}/${toPersianDigits(String(j.jd).padStart(2, '0'))}`;
}

export function getCurrentJalaliYear(): number {
  return jalaali.toJalaali(new Date()).jy;
}

export function getCurrentJalaliMonth(): number {
  return jalaali.toJalaali(new Date()).jm;
}
