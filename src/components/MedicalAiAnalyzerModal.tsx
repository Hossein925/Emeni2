import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  Send,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  RefreshCw,
  Award,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  FileText,
  Printer,
  HelpCircle,
  BrainCircuit,
} from 'lucide-react';
import { toPersianDigits } from '../utils/jalali';

export type MedicalAiContextType = 'RCA' | 'FMEA' | 'SAFETY_MEETING' | 'ERROR_REPORT' | 'GENERAL';

interface MedicalAiAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: MedicalAiContextType;
  title: string;
  data: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const MedicalAiAnalyzerModal: React.FC<MedicalAiAnalyzerModalProps> = ({
  isOpen,
  onClose,
  contextType,
  title,
  data,
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string>('');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto trigger analysis on open
  useEffect(() => {
    if (isOpen) {
      runAiAnalysis();
    } else {
      setAnalysis('');
      setMessages([]);
      setAnalysisError('');
    }
  }, [isOpen, data, contextType]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const runAiAnalysis = async (customPrompt?: string) => {
    setLoadingAnalysis(true);
    setAnalysisError('');
    try {
      const res = await fetch('/api/medical-ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextType,
          data,
          customPrompt,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setAnalysis(result.analysisText);
      } else {
        setAnalysisError(result.error || 'خطا در دریافت تحلیل هوش مصنوعی');
      }
    } catch (err: any) {
      setAnalysisError('برقراری ارتباط با سرور هوش مصنوعی ناموفق بود.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleSendMessage = async (customQuestion?: string) => {
    const textToSend = customQuestion || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuestion) setChatInput('');
    setChatLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/medical-ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          caseContext: { title, contextType, data, initialAnalysis: analysis },
        }),
      });

      const result = await res.json();
      if (result.success) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: result.replyText,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: `⚠️ خطا: ${result.error || 'متأسفانه مشکلی در پاسخ‌دهی پیش آمد.'}`,
            timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: '⚠️ عدم پاسخگویی سرور هوش مصنوعی. لطفاً مجدداً تلاش نمایید.',
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl" lang="fa">
        <head>
          <title>تحلیل هوش مصنوعی - ${title}</title>
          <style>
            body { font-family: Tahoma, sans-serif; padding: 25px; direction: rtl; line-height: 1.8; color: #0f172a; }
            h1 { color: #0284c7; font-size: 20px; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }
            .badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 12px; margin-bottom: 15px; display: inline-block; }
            .content { white-space: pre-wrap; background: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 12px; }
            .footer { margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; pt: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>تحلیل تخصصی هوش مصنوعی بیمارستانی (مستند به منابع مرجع)</h1>
          <div class="badge">عنوان کیس / گزارش: ${title}</div>
          <div class="content">${analysis}</div>
          <div class="footer">گزارش استخراج شده از سامانه جامع ایمنی و کیفیت بیمارستانی • تحلیل مبتنی بر منابع مرجع هاریسون، پوترپری، برونرسودارث، ویلیامز و اعتباربخشی ویرایش ۵</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  if (!isOpen) return null;

  // Suggested contextual questions
  const suggestedQuestions = [
    'سنجه‌های الزامی اعتباربخشی مرتبط با این گزارش کدامند؟',
    'مداخلات پرستاری و بالینی برای پیشگیری از بروز مجدد چیست؟',
    'دستورالعمل‌های مدیریتی و اجرایی مرتبط چطور است؟',
    'اصول ایمنی بیمار جهت آموزش پرسنل شامل چه نکاتی است؟',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn text-right" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden relative">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black shadow-md">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  تحلیل و دستیار هوش مصنوعی
                </h3>
                <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  هوش مصنوعی بیمارستانی
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                ارائه پیشنهادهای بالینی، تحلیل RCA/FMEA و پاسخ به پرسش‌های ایمنی بیمار
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          
          {/* Target Title Banner */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">موضوع/عنوان گزارش:</span>
                <span className="text-sm font-black text-slate-100">{title || 'گزارش ثبت‌شده'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => runAiAnalysis()}
                disabled={loadingAnalysis}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalysis ? 'animate-spin' : ''}`} />
                <span>تحلیل مجدد</span>
              </button>
              {analysis && (
                <>
                  <button
                    onClick={handleCopyAnalysis}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition border border-slate-700 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'کپی شد' : 'کپی'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition border border-amber-500/30 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>چاپ</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* AI Analysis Result Section */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-inner min-h-[160px] relative">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
              <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                نتیجه تحلیل هوش مصنوعی:
              </h4>
            </div>

            {loadingAnalysis ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-cyan-300">
                <div className="w-10 h-10 rounded-full border-3 border-cyan-500/30 border-t-cyan-400 animate-spin flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-xs font-bold text-slate-300">
                  در حال بررسی داده‌ها و نگارش تحلیل...
                </p>
              </div>
            ) : analysisError ? (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs leading-relaxed flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <strong className="block text-sm mb-1 font-bold">خطا در دریافت تحلیل:</strong>
                  {analysisError}
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-cyan-500 selection:text-slate-950">
                {analysis}
              </div>
            )}
          </div>

          {/* Interactive Q&A Chat Section */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-400" />
                پرسش و پاسخ با هوش مصنوعی
              </h4>
            </div>

            {/* Quick Suggested Prompts */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                سوالات پیشنهادی:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={chatLoading}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-200 text-xs font-medium border border-slate-800 hover:border-slate-700 text-right transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="text-amber-400 font-black text-xs">•</span>
                    <span className="truncate">{q}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Stream */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 max-h-[240px] min-h-[90px] overflow-y-auto space-y-3 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="py-5 text-center text-xs text-slate-500">
                  سوال خود را بپرسید یا از سوالات پیشنهادی استفاده نمایید.
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 text-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-cyan-600 text-slate-950 font-semibold rounded-tl-none shadow-md'
                          : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-tr-none whitespace-pre-wrap'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 border-b border-black/10 pb-1 text-[10px] opacity-75">
                        <span className="font-black">{m.role === 'user' ? 'شما' : 'هوش مصنوعی'}</span>
                        <span>{toPersianDigits(m.timestamp)}</span>
                      </div>
                      {m.text}
                    </div>
                    {m.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 text-xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-amber-300 p-2 bg-slate-800/60 rounded-xl animate-pulse">
                  <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>در حال نگارش پاسخ...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="سوال خود را بنویسید..."
                disabled={chatLoading}
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>ارسال</span>
              </button>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-end text-xs text-slate-400 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition border border-slate-700 cursor-pointer"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
