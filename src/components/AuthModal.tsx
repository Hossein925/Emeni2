import React, { useState } from 'react';
import { Lock, User, KeyRound, X, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';
import { DataAccessLayer } from '../services/dal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!userCode.trim() || !password.trim()) {
      setErrorMsg('لطفاً کد کاربری و رمز عبور را وارد نمایید.');
      return;
    }

    setLoading(true);
    try {
      const user = await DataAccessLayer.authenticateUser(userCode, password);
      if (user) {
        setUserCode('');
        setPassword('');
        setErrorMsg('');
        onSuccessLogin(user);
        onClose();
      } else {
        setErrorMsg('کد کاربری یا رمز عبور اشتباه است.');
      }
    } catch (err) {
      setErrorMsg('خطایی در احراز هویت رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-right text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-300 text-indigo-700 flex items-center justify-center mb-3 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900">ورود مسئولین و ادمین</h3>
          <p className="text-xs font-extrabold text-indigo-900 mt-1">
            ورود به پنل ادمین کل یا پنل اختصاصی مسئولین بخش‌ها
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-black flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5 text-right">
              کد کاربری
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="کد کاربری خود را وارد کنید"
                className="w-full pr-10 pl-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5 text-right">
              رمز عبور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                className="w-full pr-10 pl-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-extrabold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'در حال بررسی...' : 'ورود به سامانه'}
          </button>
        </form>
      </div>
    </div>
  );
};
