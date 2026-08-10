import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client
  const getGeminiAi = () => {
    const apiKey = process.env.GEMINI_API_KEY || '';
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  const MEDICAL_SYSTEM_INSTRUCTION = `شما یک مشاور ارشد ایمنی بیمار و مدیریت کیفیت بیمارستانی هستید.
پاسخ‌ها و تحلیل‌های شما باید کاملاً تخصصی، شفاف، ساختاریافته و کاربردی برای محیط بیمارستان باشند.
از تکرار غیرضروری اسامی کتاب‌های مرجع یا مقدمه‌های طولانی بپرهیزید و مستقیماً تحلیل، علل ریشه‌ای (RCA/FMEA)، سنجه‌های اعتباربخشی، اقدامات اصلاحی (CAPA) و راهکارهای اجرایی را ارائه دهید.`;

  // Helper to generate content with model fallback and retries
  const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.1-pro-preview'];

  async function generateWithFallback(ai: GoogleGenAI, requestConfig: { contents: any; systemInstruction?: string; temperature?: number }) {
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: requestConfig.contents,
            config: {
              systemInstruction: requestConfig.systemInstruction,
              temperature: requestConfig.temperature,
            },
          });
          if (response && response.text) {
            return response;
          }
        } catch (err: any) {
          console.warn(`[Attempt ${attempt}] Model ${model} failed:`, err?.message || err);
          lastError = err;
          // Short delay before retrying
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
        }
      }
    }
    throw lastError || new Error('سرویس هوش مصنوعی در حال حاضر در دسترس نیست. لطفاً لحظاتی بعد مجدداً تلاش نمایید.');
  }

  // API Endpoint 1: Medical Analysis
  app.post('/api/medical-ai-analyze', async (req, res) => {
    try {
      const { contextType, data, customPrompt } = req.body;
      const ai = getGeminiAi();

      let contextDescription = '';
      if (contextType === 'RCA') {
        contextDescription = `تحلیل علل ریشه‌ای (RCA):
توضیحات رویداد: ${data?.eventDescription || 'ذکر نشده'}
کد/نوع رویداد: ${data?.eventTypeOrCode || 'ذکر نشده'}
اعضای تیم: ${data?.teamMembers || 'ذکر نشده'}
مکان و تاریخ: ${data?.eventLocation || ''} - ${data?.eventDate || ''}
عوامل انسانی و فرآیندی: ${JSON.stringify({
          patientFactors: data?.patientFactors,
          humanFactors: data?.humanFactors,
          processFactors: data?.processFactors,
          equipmentFactors: data?.equipmentFactors,
          organizationalFactors: data?.organizationalFactors,
        })}
علل ریشه‌ای ثبت‌شده: ${JSON.stringify(data?.rootCausesAndActions || [])}`;
      } else if (contextType === 'FMEA') {
        contextDescription = `تحلیل حالات خطا و اثرات آن (FMEA):
عنوان فرآیند / بخش: ${data?.title || ''} - ${data?.departmentOrProcess || ''}
توضیحات: ${data?.description || ''}
حالات خطای بالقوه و RPNها: ${JSON.stringify(data?.items || [])}`;
      } else if (contextType === 'SAFETY_MEETING') {
        contextDescription = `صورتجلسه و مصوبات ایمنی بیمار:
موضوع جلسه: ${data?.subject || ''}
توضیحات: ${data?.description || ''}
مصوبات: ${JSON.stringify(data?.resolutions || [])}`;
      } else if (contextType === 'ERROR_REPORT') {
        contextDescription = `گزارش خطای پزشکی / پرستاری:
عنوان خطا: ${data?.title || ''}
بخش مربوطه: ${data?.departmentName || ''}
نوع خطا: ${data?.errorType || ''}
سطح آسیب: ${data?.severityLevel || ''}
توضیحات خطا: ${data?.description || ''}
اقدامات عاجل: ${data?.immediateAction || ''}`;
      } else {
        contextDescription = `اطلاعات و گزارش ارسالی: ${JSON.stringify(data || {})}`;
      }

      const prompt = `لطفاً تحلیل تخصصی، دقیق و کاربردی بر اساس استانداردهای ایمنی بیمار و اعتباربخشی برای موارد زیر ارائه دهید:

${contextDescription}

${customPrompt ? `سوال یا درخواست خاص کاربر: ${customPrompt}` : ''}

پاسخ را به‌صورت منظم و شفاف با عناوین مشخص جهت استفاده در کمیته‌های بیمارستانی تنظیم نمایید.`;

      const response = await generateWithFallback(ai, {
        contents: prompt,
        systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      });

      const analysisText = response.text || 'پاسخی از مدل هوش مصنوعی دریافت نشد.';
      res.json({ success: true, analysisText });
    } catch (err: any) {
      console.error('Gemini Analysis Error:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'خطا در برقراری ارتباط با سرویس هوش مصنوعی.',
      });
    }
  });

  // API Endpoint 2: Medical AI Chat / Q&A
  app.post('/api/medical-ai-chat', async (req, res) => {
    try {
      const { messages, caseContext } = req.body;
      const ai = getGeminiAi();

      const formattedContents = [
        {
          role: 'user',
          parts: [
            {
              text: `این گفتگو درباره بافتار و کیس زیر در بیمارستان است:
${typeof caseContext === 'string' ? caseContext : JSON.stringify(caseContext || {})}
لطفاً پاسخ‌های بعدی را به‌صورت تخصصی، شفاف و مستقیم بر اساس اصول ایمنی بیمار و استانداردهای اعتباربخشی ارائه دهید.`,
            },
          ],
        },
      ];

      if (Array.isArray(messages)) {
        for (const msg of messages) {
          formattedContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }],
          });
        }
      }

      const response = await generateWithFallback(ai, {
        contents: formattedContents,
        systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      });

      const replyText = response.text || 'پاسخی از هوش مصنوعی دریافت نشد.';
      res.json({ success: true, replyText });
    } catch (err: any) {
      console.error('Gemini Chat Error:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'خطا در پردازش سوال هوش مصنوعی.',
      });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospital Safety App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
