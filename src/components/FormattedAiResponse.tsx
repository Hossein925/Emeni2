import React from 'react';
import { FileText, Download, CheckCircle2, AlertCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { exportToWordDocument } from '../utils/wordExportHelper';

interface FormattedAiResponseProps {
  text: string;
  title?: string;
  contextType?: string;
}

export const FormattedAiResponse: React.FC<FormattedAiResponseProps> = ({
  text,
  title = 'گزارش تحلیل هوش مصنوعی',
  contextType = 'گزارش تخصصی',
}) => {
  if (!text) return null;

  const handleDownloadWord = () => {
    exportToWordDocument({
      title,
      subtitle: `تحلیل هوش مصنوعی • ${contextType}`,
      content: text,
      filename: `${title}_تحلیل_هوش_مصنوعی`,
    });
  };

  // Split text into structured sections
  const lines = text.split('\n');

  return (
    <div className="space-y-4 text-slate-200">
      {/* Top Action Bar for Word Download */}
      <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-2xl border border-indigo-500/30 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-amber-300">
            پاسخ ساختاریافته و استاندارد هوش مصنوعی
          </span>
        </div>

        <button
          onClick={handleDownloadWord}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer border border-indigo-400/30"
          title="دانلود فایل Microsoft Word (.doc)"
        >
          <Download className="w-4 h-4 text-cyan-300" />
          <span>دانلود بصورت فایل Word</span>
        </button>
      </div>

      {/* Main Formatted Content Body */}
      <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5 space-y-3.5 text-xs sm:text-sm leading-relaxed font-sans shadow-inner">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Section Titles (### or numbered emojis)
          if (
            trimmed.startsWith('###') ||
            trimmed.startsWith('📌') ||
            trimmed.startsWith('🔍') ||
            trimmed.startsWith('⚡') ||
            trimmed.startsWith('📋') ||
            trimmed.startsWith('💡') ||
            /^\d+\.\s/.test(trimmed)
          ) {
            const cleanTitle = trimmed.replace(/^###\s*/, '');
            return (
              <div
                key={idx}
                className="mt-4 mb-2 p-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/80 border-r-4 border-cyan-400 border-y border-l border-slate-800 flex items-center gap-2 text-cyan-300 font-black text-xs sm:text-sm shadow-sm"
              >
                <span className="text-amber-400 font-bold">•</span>
                <span>{cleanTitle}</span>
              </div>
            );
          }

          // List Items (- or *)
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const listContent = trimmed.replace(/^[-*•]\s*/, '');
            // Process **bold**
            const parts = listContent.split(/(\*\*.*?\*\*)/g);

            return (
              <div key={idx} className="flex items-start gap-2.5 pr-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <div className="text-slate-300 leading-relaxed flex-1">
                  {parts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={pIdx} className="text-amber-300 font-bold px-1 bg-amber-400/10 rounded">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </div>
              </div>
            );
          }

          // Normal Paragraph with **bold** formatting
          const parts = trimmed.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="text-cyan-300 font-bold px-1 bg-cyan-400/10 rounded">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    </div>
  );
};
