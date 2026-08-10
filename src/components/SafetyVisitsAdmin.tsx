import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import { Department, SafetyVisit } from '../types';
import { DataAccessLayer } from '../services/dal';

interface SafetyVisitsAdminProps {
  onBack: () => void;
}

export const SafetyVisitsAdmin: React.FC<SafetyVisitsAdminProps> = ({ onBack }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [visits, setVisits] = useState<SafetyVisit[]>([]);
  const [loading, setLoading] = useState(true);

  // Visit Form state
  const [visitDate, setVisitDate] = useState('');
  const [teamMembersStr, setTeamMembersStr] = useState('');
  const [observations, setObservations] = useState('');
  const [resolutions, setResolutions] = useState('');
  const [followUpPerson, setFollowUpPerson] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    const depts = await DataAccessLayer.getDepartments();
    setDepartments(depts);
    setLoading(false);
  };

  const handleSelectDepartment = async (dept: Department) => {
    setSelectedDept(dept);
    const deptVisits = await DataAccessLayer.getSafetyVisits(dept.id);
    setVisits(deptVisits);
  };

  const handleSaveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    if (!observations.trim()) {
      alert('لطفاً موارد مشاهده‌شده در بازدید را ثبت کنید.');
      return;
    }

    const teamMembers = teamMembersStr
      .split('،')
      .map((m) => m.trim())
      .filter(Boolean);

    await DataAccessLayer.saveSafetyVisit({
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      visitDate: visitDate.trim() || new Date().toLocaleDateString('fa-IR'),
      teamMembers: teamMembers.length > 0 ? teamMembers : ['تیم ایمنی بیمار'],
      observations: observations.trim(),
      resolutions: resolutions.trim(),
      followUpPerson: followUpPerson.trim() || 'سوپروایزر ایمنی',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    // Reset Form & reload
    setVisitDate('');
    setTeamMembersStr('');
    setObservations('');
    setResolutions('');
    setFollowUpPerson('');

    const deptVisits = await DataAccessLayer.getSafetyVisits(selectedDept.id);
    setVisits(deptVisits);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-cyan-600" />
            بازدیدهای مدیریتی ایمنی بیمار (Safety Walkarounds)
          </h2>
          <p className="text-xs sm:text-sm text-indigo-900/80 font-bold mt-1">
            ثبت مشاهدات، مصوبات و اقدامات اصلاحی تیم مدیریت ایمنی در بازدیدهای میدانی از بخش‌ها
          </p>
        </div>
        <button
          onClick={selectedDept ? () => setSelectedDept(null) : onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
          <span>{selectedDept ? 'بازگشت به لیست بخش‌ها' : 'بازگشت به پنل ادمین'}</span>
        </button>
      </div>

      {!selectedDept ? (
        /* Department Metro Tiles Selection */
        <div>
          <h3 className="text-lg font-black text-indigo-950 mb-4">جهت ثبت یا مشاهده بازدیدها، بخش مورد نظر را انتخاب کنید:</h3>
          {loading ? (
            <div className="py-12 text-center text-indigo-950 font-bold text-sm">در حال بارگذاری بخش‌ها...</div>
          ) : departments.length === 0 ? (
            <div className="py-12 text-center text-indigo-950 font-bold text-sm bg-white/80 rounded-3xl border border-indigo-100 shadow-md">
              هنوز بخشی تعریف نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleSelectDepartment(dept)}
                  className="metro-tile group text-right rounded-3xl bg-[#0c2a4a] p-6 text-white shadow-2xl border border-cyan-400/30 hover:border-cyan-300 flex flex-col justify-between min-h-[160px] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-cyan-200 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-xl border border-cyan-400/20">بخش بیمارستان</span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-white group-hover:text-cyan-300 transition">{dept.name}</h4>
                    <p className="text-xs text-cyan-100 font-medium mt-1">مسئول: {dept.managerName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Department Selected - Visit Form & History */
        <div className="space-y-8">
          <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
            <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-300" />
                ثبت بازدید مدیریتی ایمنی بیمار از {selectedDept.name}
              </h3>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-400/20">مسئول بخش: {selectedDept.managerName}</span>
            </div>

            {savedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>بازدید ایمنی بیمار با موفقیت در آرشیو بخش ثبت گردید.</span>
              </div>
            )}

            <form onSubmit={handleSaveVisit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                    تاریخ بازدید (شمسی)
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: 1403/05/12"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-black placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                    اعضای شرکت‌کننده در بازدید (با کاما جدا کنید)
                  </label>
                  <input
                    type="text"
                    placeholder="دکتر موسوی، مهندس صادقی، سوپروایزر ایمنی"
                    value={teamMembersStr}
                    onChange={(e) => setTeamMembersStr(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                  موارد مشاهده‌شده در بازدید <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="شرح کامل نقاط قوت، نقاط ضعف و چالش‌های ایمنی بیمار در بخش..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                    مصوبات و اقدامات اصلاحی تعیین‌شده
                  </label>
                  <textarea
                    rows={2}
                    placeholder="اقدامات اصلاحی فوری یا بلندمدت..."
                    value={resolutions}
                    onChange={(e) => setResolutions(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                    مسئول پیگیری مصوبات
                  </label>
                  <input
                    type="text"
                    placeholder="سرپرستار بخش / سوپروایزر"
                    value={followUpPerson}
                    onChange={(e) => setFollowUpPerson(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2 text-left">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 text-white font-black text-sm shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                >
                  ثبت فرم بازدید ایمنی
                </button>
              </div>
            </form>
          </div>

          {/* Visit History Archive */}
          <div className="bg-[#0c2a4a] border border-cyan-400/30 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <h4 className="text-lg font-black text-white mb-2">
              آرشیو بازدیدهای انجام‌شده از {selectedDept.name} ({visits.length})
            </h4>

            {visits.length === 0 ? (
              <div className="py-12 text-center text-cyan-200/80 font-bold text-sm bg-[#06162a] rounded-2xl border border-cyan-500/20">
                هیچ بازدید سابقه‌ای برای این بخش ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map((vis) => (
                  <div key={vis.id} className="bg-[#06162a] border border-cyan-500/30 rounded-2xl p-5 space-y-3 text-white">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 text-xs">
                      <span className="font-bold text-cyan-300">تاریخ بازدید: {vis.visitDate}</span>
                      <span className="text-cyan-100/90 font-medium">اعضا: {vis.teamMembers.join(' - ')}</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="text-cyan-50 leading-relaxed">
                        <strong className="text-white font-bold">مشاهدات: </strong>
                        <span>{vis.observations}</span>
                      </div>
                      {vis.resolutions && (
                        <div className="text-emerald-300 font-semibold pt-1">
                          <strong className="text-emerald-400">مصوبات: </strong>
                          <span>{vis.resolutions}</span>
                        </div>
                      )}
                      <div className="text-cyan-200/80 pt-1">
                        <span>مسئول پیگیری: {vis.followUpPerson}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
