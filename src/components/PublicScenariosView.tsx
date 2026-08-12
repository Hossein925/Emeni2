import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, Calendar, Lightbulb, AlertTriangle, X } from 'lucide-react';
import { SafetyScenario } from '../types';
import { DataAccessLayer, subscribeToDALChanges } from '../services/dal';

interface PublicScenariosViewProps {
  onBack: () => void;
}

export const PublicScenariosView: React.FC<PublicScenariosViewProps> = ({ onBack }) => {
  const [scenarios, setScenarios] = useState<SafetyScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<SafetyScenario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
    const unsubscribe = subscribeToDALChanges(() => {
      loadScenarios(true);
    });
    return () => unsubscribe();
  }, []);

  const loadScenarios = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const data = await DataAccessLayer.getScenarios();
    setScenarios(data);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            سناریوهای ایمنی بیمار
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-medium mt-1">
            بررسی پرونده‌های واقعی، تحلیل خطاهای بالقوه و آموزه‌های کاربردی برای کادر درمان
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
          <span>بازگشت به منوی اصلی</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-indigo-950 font-bold text-sm">در حال بارگذاری سناریوها...</div>
      ) : scenarios.length === 0 ? (
        <div className="py-20 text-center text-indigo-950 font-bold text-sm bg-white rounded-3xl border border-indigo-100 shadow-md">
          هنوز سناریوی ایمنی ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-5xl mx-auto">
          {scenarios.map((scen) => (
            <div
              key={scen.id}
              onClick={() => setSelectedScenario(scen)}
              className="metro-tile cursor-pointer bg-white border border-indigo-100 hover:border-indigo-300 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between text-right transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black border border-indigo-200">
                    {scen.category || 'سناریوی ایمنی'}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    تاریخ: {scen.scenarioDate}
                  </span>
                </div>

                <h3 className="text-lg font-black text-indigo-950 group-hover:text-indigo-700 transition">
                  {scen.title}
                </h3>

                <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-3">
                  {scen.summary}
                </p>
              </div>

              {scen.lessonsLearned && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-900">نکته کلیدی: </span>
                    <span className="font-bold">{scen.lessonsLearned}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 text-right text-slate-900">
            <button
              onClick={() => setSelectedScenario(null)}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-indigo-700 font-extrabold">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>جزئیات کامل سناریوی بالینی</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-indigo-950">{selectedScenario.title}</h2>

            <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-xs text-indigo-950 font-semibold space-y-1">
              <div>تاریخ رویداد: <strong className="text-indigo-900 font-black">{selectedScenario.scenarioDate}</strong></div>
              <div>دسته‌بندی: <strong className="text-indigo-900 font-black">{selectedScenario.category || 'ایمنی عمومی'}</strong></div>
            </div>

            <div
              className="text-slate-800 text-sm font-medium leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: selectedScenario.fullContent }}
            />

            {selectedScenario.lessonsLearned && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-1">
                <div className="font-black text-amber-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  درس‌های آموخته‌شده برای کادر درمان:
                </div>
                <p className="font-semibold text-slate-800">{selectedScenario.lessonsLearned}</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 text-left">
              <button
                onClick={() => setSelectedScenario(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
