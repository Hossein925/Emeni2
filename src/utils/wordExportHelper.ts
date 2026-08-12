// Helper utility for generating and downloading structured Microsoft Word (.doc / .docx) documents

export interface WordExportOptions {
  title: string;
  subtitle?: string;
  content: string;
  filename?: string;
  metadata?: {
    department?: string;
    author?: string;
    date?: string;
  };
}

/**
 * Converts markdown/text formatting into styled Word-compatible HTML
 */
function convertTextToWordHtml(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (let line of lines) {
    line = line.trim();

    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += '<p style="margin: 6pt 0; height: 6pt;"></p>';
      continue;
    }

    // Bold text formatting
    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0369a1; font-weight: bold;">$1</strong>');

    // Headers
    if (line.startsWith('### ') || line.startsWith('📌') || line.startsWith('🔍') || line.startsWith('⚡') || line.startsWith('📋') || line.startsWith('💡')) {
      if (inList) { html += '</ul>'; inList = false; }
      const headerText = line.replace(/^###\s*/, '');
      html += `
        <h3 style="
          color: #0284c7;
          font-family: Tahoma, Arial, sans-serif;
          font-size: 14pt;
          font-weight: bold;
          margin-top: 14pt;
          margin-bottom: 6pt;
          padding-bottom: 4pt;
          border-bottom: 1.5pt solid #bae6fd;
          direction: rtl;
          text-align: right;
        ">
          ${headerText}
        </h3>
      `;
    } else if (line.startsWith('## ') || line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      const headerText = line.replace(/^#+\s*/, '');
      html += `
        <h2 style="
          color: #0f172a;
          font-family: Tahoma, Arial, sans-serif;
          font-size: 16pt;
          font-weight: bold;
          margin-top: 18pt;
          margin-bottom: 8pt;
          padding: 6pt 10pt;
          background-color: #f0f9ff;
          border-right: 4pt solid #0284c7;
          direction: rtl;
          text-align: right;
        ">
          ${headerText}
        </h2>
      `;
    } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      if (!inList) {
        html += '<ul style="margin: 6pt 0; padding-right: 20pt; direction: rtl; text-align: right;">';
        inList = true;
      }
      const itemText = formattedLine.replace(/^[-*•]\s*/, '');
      html += `<li style="font-family: Tahoma, Arial, sans-serif; font-size: 11pt; line-height: 1.8; color: #1e293b; margin-bottom: 4pt;">${itemText}</li>`;
    } else if (/^\d+\.\s/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p style="font-family: Tahoma, Arial, sans-serif; font-size: 11pt; line-height: 1.8; color: #1e293b; margin: 4pt 0; direction: rtl; text-align: right; padding-right: 10pt;">${formattedLine}</p>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p style="font-family: Tahoma, Arial, sans-serif; font-size: 11pt; line-height: 1.8; color: #334155; margin: 6pt 0; direction: rtl; text-align: right;">${formattedLine}</p>`;
    }
  }

  if (inList) { html += '</ul>'; }

  return html;
}

/**
 * Downloads formatted Microsoft Word (.doc) file
 */
export function exportToWordDocument(options: WordExportOptions): void {
  const { title, subtitle, content, filename, metadata } = options;

  const formattedContentHtml = convertTextToWordHtml(content);
  const currentDate = metadata?.date || new Date().toLocaleDateString('fa-IR');

  const fullWordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'
          dir='rtl' lang='fa'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page WordSection1 {
            size: 595.3pt 841.9pt; /* A4 size */
            margin: 54.0pt 54.0pt 54.0pt 54.0pt;
            mso-header-margin: 36.0pt;
            mso-footer-margin: 36.0pt;
            mso-paper-source: 0;
          }
          div.WordSection1 { page: WordSection1; }
          body {
            font-family: 'B Nazanin', 'IRANSans', Tahoma, Arial, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.8;
            color: #0f172a;
            background-color: #ffffff;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border-bottom: 2pt solid #0284c7;
            padding-bottom: 10px;
          }
          .header-title {
            font-size: 18pt;
            font-weight: bold;
            color: #0369a1;
            margin: 0;
            padding: 0;
          }
          .header-subtitle {
            font-size: 11pt;
            color: #64748b;
            margin-top: 4px;
          }
          .meta-box {
            background-color: #f8fafc;
            border: 1pt solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 15px;
            margin-bottom: 20px;
            font-size: 10pt;
            color: #334155;
          }
          .footer {
            margin-top: 40px;
            padding-top: 10px;
            border-top: 1pt solid #cbd5e1;
            font-size: 9pt;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          <!-- Header Banner -->
          <table class="header-table">
            <tr>
              <td style="text-align: right; vertical-align: middle;">
                <div class="header-title">${title}</div>
                <div class="header-subtitle">${subtitle || 'گزارش و تحلیل تخصصی هوش مصنوعی بیمارستانی'}</div>
              </td>
            </tr>
          </table>

          <!-- Metadata Box -->
          <div class="meta-box">
            <table style="width: 100%; font-size: 10pt;">
              <tr>
                <td style="text-align: right; width: 50%;"><strong>تاریخ صدور گزارش:</strong> ${currentDate}</td>
                <td style="text-align: left; width: 50%;"><strong>منبع:</strong> سامانه جامع مدیریت کیفیت و ایمنی بیمار</td>
              </tr>
              ${metadata?.department ? `
              <tr>
                <td style="text-align: right; colspan: 2; padding-top: 4px;"><strong>بخش مربوطه:</strong> ${metadata.department}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- Main Content -->
          <div class="content-body">
            ${formattedContentHtml}
          </div>

          <!-- Footer -->
          <div class="footer">
            این گزارش بر اساس استانداردهای اعتباربخشی بیمارستانی و تحلیل هوش مصنوعی استخراج گردیده است.
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + fullWordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  const safeFileName = (filename || title || 'گزارش_تحلیل_هوش_مصنوعی').replace(/[/\\?%*:|"<>]/g, '_');
  a.download = `${safeFileName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
