import React, { useState, useEffect } from 'react';
import { EducationalContentRenderer } from './EducationalContentRenderer';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  UserCheck,
  Pill,
  ShieldAlert,
  MessageSquareText,
  Hand,
  Clock,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Activity,
  Stethoscope,
  HeartPulse,
  Syringe,
  Thermometer,
  Brain,
  Microscope,
  Hospital,
  ClipboardList,
  AlertTriangle,
  FileSpreadsheet,
  GraduationCap,
  Award,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { EducationCategory, EducationTopic } from '../types';
import { DataAccessLayer, subscribeToDALChanges } from '../services/dal';

interface PublicEducationViewProps {
  onBack: () => void;
}

// Icon mapper for categories
const renderCategoryIcon = (iconName?: string, className: string = 'w-5 h-5') => {
  switch (iconName) {
    case 'UserCheck':
      return <UserCheck className={className} />;
    case 'Pill':
      return <Pill className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'MessageSquareText':
      return <MessageSquareText className={className} />;
    case 'Hand':
      return <Hand className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Syringe':
      return <Syringe className={className} />;
    case 'Thermometer':
      return <Thermometer className={className} />;
    case 'Brain':
      return <Brain className={className} />;
    case 'Microscope':
      return <Microscope className={className} />;
    case 'Hospital':
      return <Hospital className={className} />;
    case 'ClipboardList':
      return <ClipboardList className={className} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} />;
    case 'FileSpreadsheet':
      return <FileSpreadsheet className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    default:
      return <Layers className={className} />;
  }
};

export const PublicEducationView: React.FC<PublicEducationViewProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [topics, setTopics] = useState<EducationTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EducationCategory | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDALChanges(() => {
      loadData(true);
    });
    return () => unsubscribe();
  }, []);

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const [catData, topicData] = await Promise.all([
      DataAccessLayer.getEducationCategories(),
      DataAccessLayer.getEducationTopics(),
    ]);
    setCategories(catData);
    setTopics(topicData);
    setLoading(false);
  };

  const handleToggleComplete = (topicId: string) => {
    if (completedTopicIds.includes(topicId)) {
      setCompletedTopicIds(completedTopicIds.filter((id) => id !== topicId));
    } else {
      setCompletedTopicIds([...completedTopicIds, topicId]);
    }
  };

  // Filter topics for selected category
  const filteredTopics = selectedCategory
    ? topics.filter((t) => t.categoryId === selectedCategory.id)
    : [];

  const handleBack = () => {
    if (selectedTopic) {
      setSelectedTopic(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn text-right">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-200/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-indigo-700 mb-1">
            <span onClick={() => { setSelectedCategory(null); setSelectedTopic(null); }} className="cursor-pointer hover:underline">
              آموزش ایمنی بیمار
            </span>
            {selectedCategory && (
              <>
                <span>/</span>
                <span onClick={() => setSelectedTopic(null)} className="cursor-pointer hover:underline text-cyan-700">
                  {selectedCategory.title}
                </span>
              </>
            )}
            {selectedTopic && (
              <>
                <span>/</span>
                <span className="text-slate-800">{selectedTopic.title}</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-indigo-950 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-600" />
            {selectedTopic
              ? selectedTopic.title
              : selectedCategory
              ? selectedCategory.title
              : 'دسته‌بندی‌های آموزش ایمنی بیمار'}
          </h2>
          <p className="text-xs text-indigo-900/80 font-medium mt-1">
            {selectedTopic
              ? `آموزش تخصصی زیرمجموعه ${selectedCategory?.title || 'ایمنی بیمار'}`
              : selectedCategory
              ? selectedCategory.description || 'فهرست آموزش‌های تخصصی و پروتکل‌های بالینی ثبت‌شده'
              : 'برای مشاهده سرفصل‌های آموزشی، موضوع مورد نظر را انتخاب نمایید'}
          </p>
        </div>

        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer ring-2 ring-amber-300/40 self-start sm:self-auto"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
          <span>
            {selectedTopic
              ? 'بازگشت به فهرست آموزش‌ها'
              : selectedCategory
              ? 'بازگشت به دسته‌بندی‌ها'
              : 'بازگشت به منوی اصلی'}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-indigo-900/70 font-bold text-sm">در حال بارگذاری محتوای آموزشی...</div>
      ) : selectedTopic ? (
        /* LEVEL 3: Full Lesson Reader View */
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-900 text-right animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
            <div>
              <span className="inline-block text-xs font-black text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 mb-2">
                دسته: {selectedCategory?.title || 'ایمنی بیمار'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{selectedTopic.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedTopic.readingTime && (
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>زمان مطالعه: {selectedTopic.readingTime}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>بروزرسانی: {selectedTopic.updatedAt}</span>
              </div>
            </div>
          </div>

          {/* Rich Content Render */}
          <EducationalContentRenderer html={selectedTopic.content} className="pt-2" />

          {/* Completion Mark Footer */}
          <div className="pt-6 border-t-2 border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => handleToggleComplete(selectedTopic.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer active:scale-95 shadow-md ${
                completedTopicIds.includes(selectedTopic.id)
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-indigo-950 hover:bg-indigo-900 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {completedTopicIds.includes(selectedTopic.id)
                  ? 'مطالعه این بخش به اتمام رسید (تکمیل شده)'
                  : 'علامت‌گذاری به‌عنوان مطالعه‌شده'}
              </span>
            </button>

            <button
              onClick={() => setSelectedTopic(null)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer"
            >
              <span>بازگشت به فهرست آموزش‌ها</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : selectedCategory ? (
        /* LEVEL 2: List of Training Topics inside Selected Category */
        <div className="space-y-5 animate-fadeIn">
          <div className={`p-5 rounded-3xl bg-gradient-to-r ${selectedCategory.color || 'from-blue-900 to-slate-900'} text-white shadow-xl flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shadow-inner shrink-0">
              {renderCategoryIcon(selectedCategory.iconName, 'w-6 h-6')}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{selectedCategory.title}</h3>
              <p className="text-xs text-cyan-100/90 font-bold mt-1">
                {selectedCategory.description || 'لیست آموزش‌ها و دستورالعمل‌های ثبت‌شده در این بخش'}
              </p>
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="py-12 text-center text-indigo-950 font-bold text-sm bg-white rounded-3xl border border-indigo-100 shadow-md">
              هنوز موضوع آموزشی برای این دسته‌بندی ثبت نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="group bg-white border-2 border-indigo-100 hover:border-indigo-400 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-3 hover:-translate-y-1 text-right"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm group-hover:text-indigo-700 transition-colors leading-snug">
                          {topic.title}
                        </h4>
                        {topic.summary && (
                          <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-2">
                            {topic.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-slate-500">
                    <div className="flex items-center gap-2">
                      {topic.readingTime && (
                        <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          <Clock className="w-3 h-3" />
                          {topic.readingTime}
                        </span>
                      )}
                      <span>بروزرسانی: {topic.updatedAt}</span>
                    </div>

                    <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                      <span>مطالعه</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* LEVEL 1: Main Categories Grid (Responsive 2/3/4 column grid) */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 max-w-5xl mx-auto animate-fadeIn">
          {categories.length === 0 ? (
            <div className="col-span-full py-16 text-center text-indigo-950 font-bold text-sm bg-white rounded-3xl border border-indigo-100 shadow-md">
              هنوز دسته‌بندی آموزشی تعریف نشده است.
            </div>
          ) : (
            categories.map((cat) => {
              const catTopicCount = topics.filter((t) => t.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`group text-right rounded-2xl sm:rounded-3xl bg-gradient-to-br ${
                    cat.color || 'from-blue-900 to-slate-900'
                  } p-4 sm:p-5 text-white shadow-lg border-2 border-white/20 hover:border-amber-300 flex flex-col justify-between aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-36 hover:-translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shadow-md shrink-0">
                      {renderCategoryIcon(cat.iconName, 'w-4 h-4 sm:w-5 sm:h-5')}
                    </div>
                    <span className="text-[10px] sm:text-xs bg-black/40 border border-white/20 px-2.5 py-0.5 rounded-full text-white font-black shadow-sm shrink-0">
                      {catTopicCount} سرفصل
                    </span>
                  </div>

                  <div className="mt-auto w-full">
                    <h3 className="text-xs sm:text-sm font-black text-white mb-1 leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-cyan-100/80 font-bold line-clamp-2 leading-tight hidden sm:block">
                      {cat.description || 'مشاهده عناوین آموزشی و دستورالعمل‌ها'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
