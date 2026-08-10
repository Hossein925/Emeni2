import * as XLSX from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  SectionType,
  PageOrientation,
  TableLayoutType,
} from 'docx';
import { toPersianDigits } from './jalali';
import { QuarterlySelfAssessment, FmeaReport } from '../types';
import { QUARTERLY_STANDARDS } from '../data/quarterlyStandards';

// Export JSON / Objects to XLSX Excel file
export function exportToExcel(
  data: Array<Record<string, any>>,
  fileName: string = 'گزارش_ایمنی_بیمار',
  sheetName: string = 'داده‌ها'
) {
  if (!data || data.length === 0) {
    alert('داده‌ای برای خروجی اکسل وجود ندارد.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

// Generate & Download Word Document for Patient Safety Report Card (کارنامه ایمنی بیمار)
export async function downloadStaffSafetyReportCardDocx(
  staffName: string,
  nationalId: string,
  departmentName: string,
  evaluations: Array<{
    checklistTitle: string;
    monthName: string;
    percentage: number;
    totalScore: number;
    maxScore: number;
    correctiveAction: string;
    createdAt: string;
  }>
) {
  const avgPercentage =
    evaluations.length > 0
      ? Math.round(
          evaluations.reduce((acc, curr) => acc + curr.percentage, 0) /
            evaluations.length
        )
      : 0;

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'اقدام اصلاحی', bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'درصد آگاهی/امتیاز', bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'ماه', bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'عنوان چک‌لیست ارزیابی', bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 35, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
    ...evaluations.map((ev) =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: ev.correctiveAction || '---', alignment: AlignmentType.RIGHT })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `%${toPersianDigits(ev.percentage)} (${toPersianDigits(ev.totalScore)} از ${toPersianDigits(ev.maxScore)})`,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ text: ev.monthName, alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            children: [new Paragraph({ text: ev.checklistTitle, alignment: AlignmentType.RIGHT })],
          }),
        ],
      })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'بسمه تعالی',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: 'کارنامه ایمنی بیمار پرسنل',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'نام و نام خانوادگی: ', bold: true }),
              new TextRun({ text: staffName }),
              new TextRun({ text: '   |   کد ملی: ', bold: true }),
              new TextRun({ text: toPersianDigits(nationalId) }),
              new TextRun({ text: '   |   بخش: ', bold: true }),
              new TextRun({ text: departmentName }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'میانگین نمره آگاهی ایمنی بیمار: ', bold: true }),
              new TextRun({
                text: `%${toPersianDigits(avgPercentage)}`,
                bold: true,
                color: avgPercentage >= 70 ? '008000' : 'CC0000',
              }),
            ],
            spacing: { after: 300 },
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: 'سوابق و نتایج ارزیابی‌های انجام شده:',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 150 },
            alignment: AlignmentType.RIGHT,
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({
            text: '\nتأییدیه دفتر ایمنی بیمار و مدیریت بیمارستان',
            spacing: { before: 500 },
            alignment: AlignmentType.LEFT,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `کارنامه_ایمنی_بیمار_${staffName.replace(/\s+/g, '_')}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Export Full Meeting Minutes to Word (.docx) with Framed RTL Layout
export async function downloadMeetingMinutesDocx(meeting: {
  subject: string;
  meetingDate: string;
  secretary: string;
  description: string;
  attendees: string[];
  followUpPerson?: string;
  deadline?: string;
  resolutions: Array<{ text: string; weight: number; priority: string; responsiblePerson: string; deadline: string; isPublic?: boolean }>;
}) {
  const fontName = 'Tahoma';

  const createText = (text: string, options: { bold?: boolean; color?: string; size?: number } = {}) =>
    new TextRun({
      text: text,
      bold: options.bold || false,
      color: options.color || '0F172A',
      size: options.size || 20,
      font: fontName,
      rightToLeft: true,
    });

  const createPara = (textRuns: TextRun[], options: { alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacingBefore?: number; spacingAfter?: number } = {}) =>
    new Paragraph({
      children: textRuns,
      alignment: options.alignment || AlignmentType.RIGHT,
      bidirectional: true,
      spacing: {
        before: options.spacingBefore ?? 60,
        after: options.spacingAfter ?? 60,
      },
    });

  const cellMarginsSpec = { top: 120, bottom: 120, left: 150, right: 150 };
  const borderIndigo = {
    top: { style: BorderStyle.SINGLE, size: 2, color: '312E81' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: '312E81' },
    left: { style: BorderStyle.SINGLE, size: 2, color: '312E81' },
    right: { style: BorderStyle.SINGLE, size: 2, color: '312E81' },
  };

  const borderLight = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  };

  const headerCellBorder = {
    top: { style: BorderStyle.SINGLE, size: 2, color: '1E1B4B' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: '1E1B4B' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '312E81' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '312E81' },
  };

  // Header Banner Table
  const headerBannerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText('بسمه تعالی', { bold: true, color: 'FFFFFF', size: 22 })], { alignment: AlignmentType.CENTER, spacingAfter: 40 }),
              createPara([createText('صورتجلسه کمیته ایمنی بیمار (Patient Safety Committee)', { bold: true, color: 'FDE047', size: 24 })], { alignment: AlignmentType.CENTER }),
            ],
            shading: { fill: '1E1B4B' },
            margins: { top: 180, bottom: 180, left: 200, right: 200 },
            borders: borderIndigo,
          }),
        ],
      }),
    ],
  });

  // Metadata Table
  const metadataTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('موضوع اصلی جلسه:', { bold: true, color: '1E1B4B', size: 20 })])],
            shading: { fill: 'E0E7FF' },
            width: { size: 25, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: borderLight,
          }),
          new TableCell({
            children: [createPara([createText(meeting.subject, { bold: true, color: '0F172A', size: 20 })])],
            shading: { fill: 'F8FAFC' },
            width: { size: 75, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: borderLight,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('تاریخ برگزاری:', { bold: true, color: '1E1B4B', size: 20 })])],
            shading: { fill: 'E0E7FF' },
            width: { size: 25, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: borderLight,
          }),
          new TableCell({
            children: [
              createPara([
                createText(toPersianDigits(meeting.meetingDate), { bold: true, size: 20 }),
                createText('   |   دبیر کمیته: ', { bold: true, color: '1E1B4B' }),
                createText(meeting.secretary, { bold: true, size: 20 }),
              ]),
            ],
            shading: { fill: 'F8FAFC' },
            width: { size: 75, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: borderLight,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('اسامی حاضرین در جلسه:', { bold: true, color: '1E1B4B', size: 20 })])],
            shading: { fill: 'E0E7FF' },
            width: { size: 25, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: borderLight,
          }),
          new TableCell({
            children: [createPara([createText(meeting.attendees && meeting.attendees.length > 0 ? meeting.attendees.join(' - ') : 'ثبت نشده است', { size: 19 })])],
            shading: { fill: 'F8FAFC' },
            width: { size: 75, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: borderLight,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('مسئول پیگیری کلی / مهلت:', { bold: true, color: '1E1B4B', size: 20 })])],
            shading: { fill: 'E0E7FF' },
            width: { size: 25, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: borderLight,
          }),
          new TableCell({
            children: [
              createPara([
                createText(meeting.followUpPerson || 'ثبت نشده', { size: 19 }),
                createText('   |   مهلت نهایی: ', { bold: true, color: '1E1B4B' }),
                createText(toPersianDigits(meeting.deadline || '---'), { size: 19 }),
              ]),
            ],
            shading: { fill: 'F8FAFC' },
            width: { size: 75, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: borderLight,
          }),
        ],
      }),
    ],
  });

  // Description Framed Table
  const descriptionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('خلاصه مذاکرات و شرح مطالب مطرح‌شده در جلسه:', { bold: true, color: 'FFFFFF', size: 20 })], { alignment: AlignmentType.RIGHT })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: borderIndigo,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(meeting.description || 'شرحی برای این جلسه ثبت نشده است.', { size: 19 })])],
            shading: { fill: 'F0F9FF' },
            margins: { top: 150, bottom: 150, left: 180, right: 180 },
            borders: borderLight,
          }),
        ],
      }),
    ],
  });

  // Resolutions Table
  const resolutionRows = [
    new TableRow({
      children: [
        new TableCell({ children: [createPara([createText('ردیف', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 8, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('شرح مصوبه کمیته', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 42, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('وزن', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 8, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('اولویت', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 12, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('مسئول پیگیری', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 15, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('مهلت اجرا', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 15, type: WidthType.PERCENTAGE } }),
      ],
    }),
    ...(meeting.resolutions || []).map((res, rIdx) =>
      new TableRow({
        children: [
          new TableCell({ children: [createPara([createText(toPersianDigits(rIdx + 1), { bold: true })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: borderLight, shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' } }),
          new TableCell({ children: [createPara([createText(res.text)])], margins: cellMarginsSpec, borders: borderLight, shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' } }),
          new TableCell({ children: [createPara([createText(toPersianDigits(res.weight))], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: borderLight, shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' } }),
          new TableCell({ children: [createPara([createText(res.priority === 'high' ? 'بالا' : res.priority === 'medium' ? 'متوسط' : 'پایین')], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: borderLight, shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' } }),
          new TableCell({ children: [createPara([createText(res.responsiblePerson || '---')], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: borderLight, shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' } }),
          new TableCell({ children: [createPara([createText(toPersianDigits(res.deadline || '---'))], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: borderLight, shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' } }),
        ],
      })
    ),
  ];

  const resolutionTable = new Table({
    rows: resolutionRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // Signatures Table
  const signaturesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText('نام و امضای دبیر کمیته ایمنی بیمار:', { bold: true, color: '1E1B4B', size: 19 })], { alignment: AlignmentType.CENTER, spacingAfter: 300 }),
              createPara([createText('تاریخ و امضا: ............................', { color: '64748B', size: 18 })], { alignment: AlignmentType.CENTER }),
            ],
            shading: { fill: 'F8FAFC' },
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: borderLight,
          }),
          new TableCell({
            children: [
              createPara([createText('نام و امضای رئیس بیمارستان / مدیر کیفیت:', { bold: true, color: '1E1B4B', size: 19 })], { alignment: AlignmentType.CENTER, spacingAfter: 300 }),
              createPara([createText('تاریخ و امضا: ............................', { color: '64748B', size: 18 })], { alignment: AlignmentType.CENTER }),
            ],
            shading: { fill: 'F8FAFC' },
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: borderLight,
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          headerBannerTable,
          createPara([], { spacingBefore: 120, spacingAfter: 120 }),
          metadataTable,
          createPara([], { spacingBefore: 150, spacingAfter: 150 }),
          descriptionTable,
          createPara([], { spacingBefore: 180, spacingAfter: 180 }),
          createPara([createText('جدول مصوبات، اولویت‌ها و مسئولین اجرایی:', { bold: true, color: '1E1B4B', size: 22 })], { spacingAfter: 120 }),
          resolutionTable,
          createPara([], { spacingBefore: 300, spacingAfter: 200 }),
          signaturesTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `صورتجلسه_ایمنی_بیمار_${meeting.subject.replace(/\s+/g, '_')}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Helper for cross-browser canvas rounded rectangles
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, width, height, radius);
    return;
  }
  let r = radius;
  if (width < 2 * r) r = width / 2;
  if (height < 2 * r) r = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

// Canvas Generator for Crisp High-DPI Visual Fishbone Diagram Image in DOCX
export function generateFishboneCanvasImage(rca: any): Uint8Array | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Hospital Frame
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Header Banner
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    drawRoundRect(ctx, 20, 20, canvas.width - 40, 56, 6);
    ctx.fill();

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 22px "Tahoma", "Vazirmatn", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'نمودار تحلیل علل و معلولی استخوان ماهی (Ishikawa Diagram) - کاربرگ RCA بیمارستانی',
      canvas.width / 2,
      48
    );

    // 2. Spine Parameters
    const spineY = 675;
    const spineStartX = 60;
    const spineEndX = 1880;

    // Main Horizontal Spine Line
    ctx.beginPath();
    ctx.moveTo(spineStartX, spineY);
    ctx.lineTo(spineEndX, spineY);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 7.5;
    ctx.stroke();

    // Arrowhead pointing right towards Head Box
    ctx.beginPath();
    ctx.moveTo(spineEndX + 22, spineY);
    ctx.lineTo(spineEndX - 8, spineY - 14);
    ctx.lineTo(spineEndX - 8, spineY + 14);
    ctx.closePath();
    ctx.fillStyle = '#0F172A';
    ctx.fill();

    // 3. Event Head Box (Far Right Side)
    const headBoxX = 1910;
    const headBoxY = 535;
    const headBoxWidth = 430;
    const headBoxHeight = 280;

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    drawRoundRect(ctx, headBoxX, headBoxY, headBoxWidth, headBoxHeight, 12);
    ctx.fill();
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 20px "Tahoma", "Vazirmatn", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯 رویداد / مشکل اصلی', headBoxX + headBoxWidth / 2, headBoxY + 40);

    // Divider Line inside Head Box
    ctx.beginPath();
    ctx.moveTo(headBoxX + 20, headBoxY + 65);
    ctx.lineTo(headBoxX + headBoxWidth - 20, headBoxY + 65);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Event Description Text
    const eventText = rca.eventDescription || rca.title || 'رویداد ناخواسته ثبت شده';
    ctx.font = 'bold 18px "Tahoma", "Vazirmatn", sans-serif';
    ctx.fillStyle = '#FFFFFF';

    const words = eventText.split(' ');
    let line = '';
    let currY = headBoxY + 102;
    const maxTextWidth = headBoxWidth - 40;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        ctx.fillText(line, headBoxX + headBoxWidth / 2, currY);
        line = words[n] + ' ';
        currY += 30;
        if (currY > headBoxY + headBoxHeight - 20) break;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, headBoxX + headBoxWidth / 2, currY);

    // 4. Categories Definition (3 Top, 3 Bottom)
    const categories = [
      {
        title: '۱. عوامل مربوط به بیمار',
        text: rca.patientFactors || '',
        isTop: true,
        spineX: 520,
      },
      {
        title: '۲. عوامل مربوط به پرسنل',
        text: rca.humanFactors || '',
        isTop: true,
        spineX: 1180,
      },
      {
        title: '۳. وظایف و فرآیندها',
        text: rca.processFactors || '',
        isTop: true,
        spineX: 1840,
      },
      {
        title: '۴. تیم کاری و ارتباطات',
        text: rca.teamFactors || '',
        isTop: false,
        spineX: 520,
      },
      {
        title: '۵. محیط کاری و تجهیزات',
        text: [rca.environmentalFactors, rca.equipmentFactors].filter((s) => s && s.trim()).join('\n') || '',
        isTop: false,
        spineX: 1180,
      },
      {
        title: '۶. سازمان و مدیریت',
        text: rca.organizationalFactors || '',
        isTop: false,
        spineX: 1840,
      },
    ];

    const primaryColor = '#1E3A8A'; // Unified Official Hospital Navy Blue

    // Render Each Category Bone
    categories.forEach((cat) => {
      const xSpine = cat.spineX;
      const ySpine = spineY;

      // Elongated main diagonal bones for wide landscape reach
      const dx = -320;
      const dy = cat.isTop ? -480 : 480;

      const xEnd = xSpine + dx;
      const yEnd = ySpine + dy;

      // Main Diagonal Bone Line
      ctx.beginPath();
      ctx.moveTo(xSpine, ySpine);
      ctx.lineTo(xEnd, yEnd);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 5.5;
      ctx.stroke();

      // Sleek Pill Label at bone tip
      const boxW = 230;
      const boxH = 42;
      const boxX = xEnd - boxW / 2;
      const boxY = yEnd - boxH / 2;

      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      drawRoundRect(ctx, boxX, boxY, boxW, boxH, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px "Tahoma", "Vazirmatn", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cat.title, boxX + boxW / 2, boxY + boxH / 2);

      // Extract Causes & Subcauses
      const rawText = cat.text.trim();
      const rawLines = rawText ? rawText.split('\n').map((l: string) => l.trim()).filter(Boolean) : [];
      const validLines = rawLines.length > 0 ? rawLines : ['موردی ثبت نشده است'];
      const maxCauses = Math.min(validLines.length, 5);

      for (let i = 0; i < maxCauses; i++) {
        const t = (i + 1) / (maxCauses + 1);
        const cx = xSpine + dx * t;
        const cy = ySpine + dy * t;

        const branchLen = 250;
        const branchXEnd = cx - branchLen;

        // Horizontal Cause Branch Line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(branchXEnd, cy);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Joint Dot on diagonal bone
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();

        let lineText = validLines[i].replace(/^[-*+>└|–—•\d+\.]\s*/, '').trim();

        // Wrap text cleanly into max 2 lines if long
        const maxCharPerLine = 28;
        let l1 = lineText;
        let l2 = '';

        if (lineText.length > maxCharPerLine) {
          const wordsArr = lineText.split(' ');
          l1 = '';
          for (const w of wordsArr) {
            if ((l1 + ' ' + w).trim().length <= maxCharPerLine) {
              l1 = (l1 + ' ' + w).trim();
            } else {
              l2 = (l2 + ' ' + w).trim();
            }
          }
          if (l2.length > maxCharPerLine) {
            l2 = l2.substring(0, maxCharPerLine - 2) + '...';
          }
        }

        ctx.font = 'bold 16px "Tahoma", "Vazirmatn", "Segoe UI", sans-serif';
        const w1 = ctx.measureText(l1).width;
        const w2 = l2 ? ctx.measureText(l2).width : 0;
        const textWidth = Math.max(w1, w2);

        // Draw Cause Badge Card Box
        const badgeW = Math.max(160, Math.min(270, textWidth + 28));
        const badgeH = l2 ? 48 : 32;
        const badgeX = cx - 12 - badgeW;
        const badgeY = cat.isTop ? cy - badgeH - 6 : cy + 6;

        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
        ctx.fill();
        ctx.stroke();

        // Draw Cause Text inside Badge Card
        ctx.fillStyle = '#0F172A';
        ctx.textAlign = 'right';

        if (l2) {
          ctx.textBaseline = 'top';
          ctx.fillText(`• ${l1}`, badgeX + badgeW - 10, badgeY + 6);
          ctx.fillText(l2, badgeX + badgeW - 22, badgeY + 26);
        } else {
          ctx.textBaseline = 'middle';
          ctx.fillText(`• ${l1}`, badgeX + badgeW - 10, badgeY + badgeH / 2);
        }
      }
    });

    // Convert Canvas to Uint8Array PNG
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.error('Failed to generate Fishbone Canvas Image:', err);
    return null;
  }
}

// Export RCA Worksheet (کاربرگ تحلیل ریشه‌ای خطا) to native Word (.docx) with Fishbone Diagram
export async function exportRcaReportDocx(rca: any) {
  const title = rca.eventDescription ? rca.eventDescription.substring(0, 30) : 'RCA_Report';
  const fileName = `کاربرگ_RCA_${title.replace(/[\s\n\r\/\\?%*:|"<>]+/g, '_')}.docx`;

  const patient = rca.patientFactors || 'ثبت نشده';
  const human = rca.humanFactors || 'ثبت نشده';
  const process = rca.processFactors || 'ثبت نشده';
  const team = rca.teamFactors || 'ثبت نشده';
  const env = rca.environmentalFactors || 'ثبت نشده';
  const equip = rca.equipmentFactors || 'ثبت نشده';
  const org = rca.organizationalFactors || 'ثبت نشده';
  const eventDesc = rca.eventDescription || 'رویداد ثبت نشده';

  const rootCauses = rca.rootCausesAndActions || [];
  const correctivePlans = rca.correctivePlans || [];

  const fontName = 'Tahoma';

  // Helper for text run with Persian support
  const createText = (text: string, options: { bold?: boolean; color?: string; size?: number } = {}) =>
    new TextRun({
      text: text,
      bold: options.bold || false,
      color: options.color || '0F172A',
      size: options.size || 20, // 10pt default
      font: fontName,
      rightToLeft: true,
    });

  // Helper for paragraph with RTL
  const createPara = (textRuns: TextRun[], options: { alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacingBefore?: number; spacingAfter?: number } = {}) =>
    new Paragraph({
      children: textRuns,
      alignment: options.alignment || AlignmentType.RIGHT,
      bidirectional: true,
      spacing: {
        before: options.spacingBefore ?? 60,
        after: options.spacingAfter ?? 60,
      },
    });

  // Cell padding/margins spec (120 dxa ~ 6pt padding)
  const cellMarginsSpec = {
    top: 120,
    bottom: 120,
    left: 150,
    right: 150,
  };

  // Helper for cell borders
  const cellBorderSpec = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  };

  const headerCellBorder = {
    top: { style: BorderStyle.SINGLE, size: 2, color: '1E1B4B' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: '1E1B4B' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '312E81' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '312E81' },
  };

  // Helper for section headings
  const createSectionHeader = (titleText: string) =>
    createPara([createText(titleText, { bold: true, color: 'FFFFFF', size: 22 })], {
      alignment: AlignmentType.RIGHT,
      spacingBefore: 240,
      spacingAfter: 120,
    });

  // STEP 1 TABLE
  const step1Table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.teamMembers || '---')])],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('اعضای تیم / کمیته RCA:', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.eventDescription || '---')])],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('تعریف رویداد (What Happened):', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(toPersianDigits(rca.eventDate || '---'))])],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('تاریخ رویداد:', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.eventLocation || '---')])],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('محل رویداد:', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.eventTypeOrCode || '---')])],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('نوع رویداد / کد خطا:', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
    ],
  });

  // STEP 2 TABLES
  const step2InterviewsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.intervieweeName || '---')])],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('نام مصاحبه‌شونده:', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.interviewerName || '---')])],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('مصاحبه‌کننده:', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(toPersianDigits(rca.interviewDates || '---'))])],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('تاریخ مصاحبه‌ها:', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([
                createText(
                  `زمان متوسط: ${toPersianDigits(rca.avgInterviewTime || '---')} | تعداد جلسات: ${toPersianDigits(rca.interviewCount || '---')} | تعداد گزارشات: ${toPersianDigits(rca.reportsCount || '---')}`
                ),
              ]),
            ],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('زمان متوسط / تعداد جلسات:', { bold: true, color: '1E1B4B' })])],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
    ],
  });

  const step2DocsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('۴. بازدید مکان', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('۳. تجهیزات', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('۲. اسناد و مدارک', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.siteVisitDocs || '---')])],
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText(rca.equipmentDocs || '---')])],
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText(rca.documentsDocs || '---')])],
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
    ],
  });

  // STEP 3 TABLE
  const step3Table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('CDP - مسائل مرتبط با فرد', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('SDP - مسائل مرتبط با سیستم', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.contributorProblemsCDP || '---')])],
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText(rca.systemProblemsSDP || '---')])],
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
    ],
  });

  // Helper to format category causes cleanly in Word tables
  const formatCategoryCausesForDocx = (rawText: string) => {
    if (!rawText || !rawText.trim() || rawText === 'ثبت نشده') {
      return [createPara([createText('• موردی ثبت نشده است', { size: 16, color: '64748B' })])];
    }

    const lines = rawText.split('\n');
    const paragraphs: Paragraph[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isIndented =
        line.startsWith(' ') ||
        line.startsWith('\t') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('+') ||
        trimmed.startsWith('>') ||
        trimmed.startsWith('└') ||
        trimmed.startsWith('|-');

      const cleanText = trimmed.replace(/^[-*+>└|–—•\d+\.]\s*/, '').trim();
      if (!cleanText) return;

      if (isIndented) {
        paragraphs.push(
          createPara([
            createText('    - ', { bold: true, color: '0284C7', size: 16 }),
            createText(cleanText, { size: 17, color: '334155' }),
          ], { spacingAfter: 30 })
        );
      } else {
        paragraphs.push(
          createPara([
            createText('  • ', { bold: true, color: '4338CA', size: 18 }),
            createText(cleanText, { bold: true, size: 18, color: '0F172A' }),
          ], { spacingAfter: 40 })
        );
      }
    });

    return paragraphs.length > 0
      ? paragraphs
      : [createPara([createText('• موردی ثبت نشده است', { size: 16, color: '64748B' })])];
  };

  // STEP 4: FISHBONE DATA TABLE (جدول تفکیکی علل ۶ گانه استخوان ماهی)
  const fishboneTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header Banner
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText('جدول ساختاریافته علل ۶ گانه استخوان ماهی (Ishikawa / RCA 6-Factor Factors)', { bold: true, color: 'FFFFFF', size: 22 })], {
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 3,
            shading: { fill: '1E1B4B' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
        ],
      }),

      // Top Categories Row: Patient, Staff, Task & Process
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText('🏥 ۱. عوامل مربوط به بیمار (Patient)', { bold: true, color: '0369A1', size: 19 })], { spacingAfter: 80 }),
              ...formatCategoryCausesForDocx(patient),
            ],
            shading: { fill: 'F0F9FF' },
            width: { size: 33, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: '0284C7' },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: '0284C7' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'BAE6FD' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'BAE6FD' },
            },
          }),
          new TableCell({
            children: [
              createPara([createText('👤 ۲. عوامل مربوط به پرسنل (Staff)', { bold: true, color: '1D4ED8', size: 19 })], { spacingAfter: 80 }),
              ...formatCategoryCausesForDocx(human),
            ],
            shading: { fill: 'EFF6FF' },
            width: { size: 33, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: '2563EB' },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: '2563EB' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'BFDBFE' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'BFDBFE' },
            },
          }),
          new TableCell({
            children: [
              createPara([createText('⚙️ ۳. وظایف و فرآیندها (Task & Process)', { bold: true, color: '6D28D9', size: 19 })], { spacingAfter: 80 }),
              ...formatCategoryCausesForDocx(process),
            ],
            shading: { fill: 'F5F3FF' },
            width: { size: 34, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: '7C3AED' },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: '7C3AED' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'DDD6FE' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'DDD6FE' },
            },
          }),
        ],
      }),

      // Bottom Categories Row: Team, Environment & Equipment, Organization
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText('👥 ۴. تیم کاری و ارتباطات (Team)', { bold: true, color: 'B45309', size: 19 })], { spacingAfter: 80 }),
              ...formatCategoryCausesForDocx(team),
            ],
            shading: { fill: 'FEF3C7' },
            width: { size: 33, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: 'D97706' },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: 'D97706' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'FDE68A' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'FDE68A' },
            },
          }),
          new TableCell({
            children: [
              createPara([createText('🛠️ ۵. محیط کاری و تجهیزات (Environment/Equipment)', { bold: true, color: '047857', size: 19 })], { spacingAfter: 80 }),
              ...formatCategoryCausesForDocx([env, equip].filter((s) => s && s !== 'ثبت نشده').join('\n') || env),
            ],
            shading: { fill: 'ECFDF5' },
            width: { size: 33, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: '059669' },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: '059669' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'A7F3D0' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'A7F3D0' },
            },
          }),
          new TableCell({
            children: [
              createPara([createText('🏢 ۶. سازمان و مدیریت (Organization)', { bold: true, color: 'BE185D', size: 19 })], { spacingAfter: 80 }),
              ...formatCategoryCausesForDocx(org),
            ],
            shading: { fill: 'FCE7F3' },
            width: { size: 34, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: 'DB2777' },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: 'DB2777' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'FBCFE8' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'FBCFE8' },
            },
          }),
        ],
      }),
    ],
  });

  // STEP 5 TABLE (Root causes)
  const step5Table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('اقدام اصلاحی پیشنهاد شده', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            width: { size: 45, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('علل اصلی بروز واقعه', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            width: { size: 45, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('#', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            width: { size: 10, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
        ],
      }),
      ...(rootCauses.length > 0
        ? rootCauses.map(
            (item: any, idx: number) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [createPara([createText(item.correctiveAction || '---')])],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                  new TableCell({
                    children: [createPara([createText(item.rootCause || '---')])],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                  new TableCell({
                    children: [createPara([createText(toPersianDigits(idx + 1), { bold: true })], { alignment: AlignmentType.CENTER })],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                ],
              })
          )
        : [
            new TableRow({
              children: [
                new TableCell({
                  children: [createPara([createText('موردی ثبت نشده است.')], { alignment: AlignmentType.CENTER })],
                  margins: cellMarginsSpec,
                  borders: cellBorderSpec,
                }),
                new TableCell({
                  children: [createPara([createText('---')], { alignment: AlignmentType.CENTER })],
                  margins: cellMarginsSpec,
                  borders: cellBorderSpec,
                }),
                new TableCell({
                  children: [createPara([createText('۱')], { alignment: AlignmentType.CENTER })],
                  margins: cellMarginsSpec,
                  borders: cellBorderSpec,
                }),
              ],
            }),
          ]),
    ],
  });

  // STEP 6 TABLE (Corrective Plans)
  const step6Table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('گزارش پیشرفت', { bold: true, color: 'FFFFFF', size: 18 })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('تاریخ پایان', { bold: true, color: 'FFFFFF', size: 18 })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('تاریخ شروع', { bold: true, color: 'FFFFFF', size: 18 })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('مسئول اجرا', { bold: true, color: 'FFFFFF', size: 18 })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('شاخص دستیابی', { bold: true, color: 'FFFFFF', size: 18 })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
          new TableCell({
            children: [createPara([createText('اقدام مورد نظر', { bold: true, color: 'FFFFFF', size: 18 })], { alignment: AlignmentType.CENTER })],
            shading: { fill: '312E81' },
            margins: cellMarginsSpec,
            borders: headerCellBorder,
          }),
        ],
      }),
      ...(correctivePlans.length > 0
        ? correctivePlans.map(
            (cp: any) =>
              new TableRow({
                children: [
                  new TableCell({ children: [createPara([createText(cp.progressReport || '---', { size: 18 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
                  new TableCell({ children: [createPara([createText(toPersianDigits(cp.endDate || '---'), { size: 18 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
                  new TableCell({ children: [createPara([createText(toPersianDigits(cp.startDate || '---'), { size: 18 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
                  new TableCell({ children: [createPara([createText(cp.responsible || '---', { size: 18 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
                  new TableCell({ children: [createPara([createText(cp.metric || '---', { size: 18 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
                  new TableCell({ children: [createPara([createText(cp.action || '---', { size: 18 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
                ],
              })
          )
        : [
            new TableRow({
              children: [
                new TableCell({ children: [createPara([createText('---', { size: 18 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
                new TableCell({ children: [createPara([createText('---', { size: 18 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
                new TableCell({ children: [createPara([createText('---', { size: 18 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
                new TableCell({ children: [createPara([createText('---', { size: 18 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
                new TableCell({ children: [createPara([createText('---', { size: 18 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
                new TableCell({ children: [createPara([createText('موردی ثبت نشده است', { size: 18 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
              ],
            }),
          ]),
    ],
  });

  // STEP 7 TABLE (Audit)
  const step7Table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.auditQ1 || '---')])],
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('۱. میزان تحقق اقدامات براساس برنامه تنظیم شده:', { bold: true, color: '1E1B4B' })])],
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.auditQ2 || '---')])],
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('۲. میزان موثر بودن اقدامات در پیشگیری از بروز واقعه مشابه:', { bold: true, color: '1E1B4B' })])],
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.auditQ3 || '---')])],
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('۳. میزان مدیریت و رفع علل وقوع حادثه:', { bold: true, color: '1E1B4B' })])],
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText(rca.auditQ4 || '---')])],
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('۴. نحوه اشتراک‌گذاری اقدامات:', { bold: true, color: '1E1B4B' })])],
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
    ],
  });

  // Generate Fishbone PNG Canvas Image
  const fishboneImageBytes = generateFishboneCanvasImage(rca);

  // Document Header & Footer
  const documentHeader = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: 'کمیته مدیریت ایمنی بیمار و تحلیل حوادث ناخواسته   |   گزارش رسمی تحلیل علل ریشه‌ای (RCA)',
            bold: true,
            color: '475569',
            size: 16,
            font: fontName,
            rightToLeft: true,
          }),
        ],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      }),
    ],
  });

  const documentFooter = new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: 'گزارش تحلیل علل ریشه‌ای (RCA) - صفحه ',
            color: '64748B',
            size: 16,
            font: fontName,
            rightToLeft: true,
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            color: '64748B',
            size: 16,
            font: fontName,
          }),
          new TextRun({
            text: ' از ',
            color: '64748B',
            size: 16,
            font: fontName,
            rightToLeft: true,
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            color: '64748B',
            size: 16,
            font: fontName,
          }),
        ],
        alignment: AlignmentType.CENTER,
        bidirectional: true,
      }),
    ],
  });

  // SIGNATURES TABLE
  const signaturesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText('امضاء و تأییدیه ریاست / مدیریت بیمارستان:', { bold: true, size: 19, color: '1E1B4B' })], { alignment: AlignmentType.CENTER }),
              createPara([createText('\n\nنام و نام خانوادگی: ................................\nامضاء و تاریخ: ................................', { size: 18, color: '475569' })], { alignment: AlignmentType.CENTER }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: cellBorderSpec,
            shading: { fill: 'F8FAFC' },
          }),
          new TableCell({
            children: [
              createPara([createText('امضاء و تأییدیه دبیر کمیته ایمنی بیمار:', { bold: true, size: 19, color: '1E1B4B' })], { alignment: AlignmentType.CENTER }),
              createPara([createText('\n\nنام و نام خانوادگی: ................................\nامضاء و تاریخ: ................................', { size: 18, color: '475569' })], { alignment: AlignmentType.CENTER }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: cellBorderSpec,
            shading: { fill: 'F8FAFC' },
          }),
        ],
      }),
    ],
  });

  // Build Document Elements
  const docChildren: any[] = [
    // Header Title Banner
    createPara([createText('بسمه تعالی', { bold: true, color: '64748B', size: 22 })], { alignment: AlignmentType.CENTER, spacingAfter: 80 }),
    createPara([createText('گزارش جامع تحلیل علل ریشه‌ای خطا (RCA)', { bold: true, color: '1E1B4B', size: 32 })], { alignment: AlignmentType.CENTER, spacingAfter: 60 }),
    createPara([createText('Root Cause Analysis Official Hospital Report', { bold: true, color: '0284C7', size: 20 })], { alignment: AlignmentType.CENTER, spacingAfter: 80 }),
    createPara([createText('کمیته مدیریت ایمنی بیمار و تحلیل حوادث ناخواسته', { bold: true, color: '4338CA', size: 24 })], { alignment: AlignmentType.CENTER, spacingAfter: 180 }),
    createPara([createText(`تاریخ صدور خروجی: ${toPersianDigits(rca.createdAt || new Date().toLocaleDateString('fa-IR'))}`, { color: '64748B', size: 18 })], { alignment: AlignmentType.LEFT, spacingAfter: 200 }),

    // SECTION 1
    createSectionHeader('مرحله اول: تشکیل تیم و تعریف رویداد (Event Details)'),
    createPara([], { spacingAfter: 60 }),
    step1Table,
    createPara([], { spacingAfter: 200 }),

    // SECTION 2
    createSectionHeader('مرحله دوم: جمع‌آوری اطلاعات، مصاحبه‌ها و نگاشت زمانی'),
    createPara([], { spacingAfter: 60 }),
    step2InterviewsTable,
    createPara([], { spacingAfter: 120 }),
    step2DocsTable,
    createPara([], { spacingAfter: 120 }),
    createPara([createText('خط زمانی و شرح تفصیلی رویداد (Information Mapping & Timeline):', { bold: true, color: '1E1B4B', size: 22 })], { spacingBefore: 120, spacingAfter: 80 }),
    createPara([createText(rca.informationMapping || 'شرحی ثبت نشده است.', { size: 20, color: '1E293B' })], { spacingAfter: 200 }),

    // SECTION 3
    createSectionHeader('مرحله سوم: شناسایی مسئله و مشکلات ارائه خدمات (SDP / CDP)'),
    createPara([], { spacingAfter: 60 }),
    createPara(
      [
        createText('روش شناسایی مسئله: ', { bold: true, color: '1E1B4B', size: 20 }),
        createText(rca.problemIdentificationMethod || '---', { size: 20 }),
      ],
      { spacingAfter: 100 }
    ),
    step3Table,
    createPara([], { spacingAfter: 200 }),

    // SECTION 4 - FISHBONE DIAGRAM
    new Paragraph({
      children: [new PageBreak()],
    }),
    createSectionHeader('مرحله چهارم: تحلیل علت و معلولی استخوان ماهی (Ishikawa Fishbone Diagram)'),
    createPara([createText('نمودار تحلیل علت و معلولی شش‌گانه RCA / Ishikawa Fishbone', { bold: true, color: '0284C7', size: 20 })], { alignment: AlignmentType.CENTER, spacingAfter: 100 }),
    createPara([createText('نمودار گرافیکی و پرکیفیت زیر، تحلیل عوامل ۶ گانه موثر در بروز خطا (بیمار، پرسنل، فرایند، تیم، محیط/تجهیزات، سازمان) را به صورت واقعی نشان می‌دهد:', { size: 18, color: '334155' })], { spacingAfter: 120 }),
  ];

  // Insert Visual Canvas Image of Fishbone Diagram if generated successfully
  if (fishboneImageBytes) {
    docChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: fishboneImageBytes,
            transformation: {
              width: 680,
              height: 382,
            },
            type: 'png',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 200 },
      })
    );
  }

  // Followed by Fishbone Category Tree Data Table
  docChildren.push(
    createPara([createText('جدول ساختاریافته و داده‌های درخت علل ۶ گانه استخوان ماهی (قابل ویرایش در Word):', { bold: true, color: '1E1B4B', size: 20 })], { spacingBefore: 120, spacingAfter: 100 }),
    fishboneTable,
    createPara([], { spacingAfter: 200 }),

    // SECTION 5
    createSectionHeader('مرحله پنجم: علل اصلی بروز واقعه و اقدامات پیشنهاد شده'),
    createPara([], { spacingAfter: 60 }),
    step5Table,
    createPara([], { spacingAfter: 200 }),

    // SECTION 6
    createSectionHeader('گام ششم: برنامه اقدامات اصلاحی و پیشگیرانه (CAPA Action Plan)'),
    createPara([], { spacingAfter: 60 }),
    step6Table,
    createPara([], { spacingAfter: 200 }),

    // SECTION 7 & SIGNATURES
    createSectionHeader('گام هفتم: پایش و ممیزی نتایج (RCA Audit & Evaluation)'),
    createPara([], { spacingAfter: 60 }),
    step7Table,
    createPara([], { spacingAfter: 300 }),

    createSectionHeader('تأییدیه‌ها و امضاءهای رسمی کمیته'),
    createPara([], { spacingAfter: 100 }),
    signaturesTable
  );

  const doc = new Document({
    sections: [
      {
        headers: {
          default: documentHeader,
        },
        footers: {
          default: documentFooter,
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Download Word Document for Quarterly Self-Assessment (خودارزیابی فصلی)
export async function downloadQuarterlySelfAssessmentDocx(assessment: QuarterlySelfAssessment) {
  const fileName = `خودارزیابی_فصلی_${assessment.season}_${assessment.year}.docx`;
  const fontName = 'Tahoma';

  const createText = (text: string, options: { bold?: boolean; color?: string; size?: number } = {}) =>
    new TextRun({
      text: text,
      bold: options.bold || false,
      color: options.color || '0F172A',
      size: options.size || 20,
      font: fontName,
      rightToLeft: true,
    });

  const createPara = (
    textRuns: TextRun[],
    options: { alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacingBefore?: number; spacingAfter?: number } = {}
  ) =>
    new Paragraph({
      children: textRuns,
      alignment: options.alignment || AlignmentType.RIGHT,
      bidirectional: true,
      spacing: {
        before: options.spacingBefore ?? 60,
        after: options.spacingAfter ?? 60,
      },
    });

  const cellMarginsSpec = { top: 120, bottom: 120, left: 150, right: 150 };
  const cellBorderSpec = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  };

  const headerCellBorder = {
    top: { style: BorderStyle.SINGLE, size: 2, color: '1E1B4B' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: '1E1B4B' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '312E81' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '312E81' },
  };

  // Hospital Specs Table Rows
  const hospitalSpecsTable = new Table({
    alignment: AlignmentType.RIGHT,
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [createPara([createText('سال و فصل ارزیابی:', { bold: true }), createText(` ${toPersianDigits(assessment.year)} - ${assessment.season}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText('نام بیمارستان:', { bold: true }), createText(` ${assessment.hospitalName}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [createPara([createText('تعداد تخت فعال:', { bold: true }), createText(` ${toPersianDigits(assessment.activeBeds || '---')}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText('تعداد تخت مصوب:', { bold: true }), createText(` ${toPersianDigits(assessment.approvedBeds || '---')}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [createPara([createText('متوسط بستری روزانه:', { bold: true }), createText(` ${toPersianDigits(assessment.avgDailyInpatients || '---')}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText('ضریب اشغال تخت:', { bold: true }), createText(` %${toPersianDigits(assessment.bedOccupancyRate || '---')}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [createPara([createText('متوسط پذیرش سالیانه اورژانس (سطح ۱-۳):', { bold: true }), createText(` ${toPersianDigits(assessment.annualEmergencyL13 || '---')}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText('تعداد ویزیت سرپایی سالیانه درمانگاه:', { bold: true }), createText(` ${toPersianDigits(assessment.annualOutpatientVisits || '---')}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [createPara([createText('تیم ارزیابی:', { bold: true }), createText(` ${assessment.evaluationTeam}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText('پذیرش سالیانه اورژانس (سطح ۴-۵):', { bold: true }), createText(` ${toPersianDigits(assessment.annualEmergencyL45 || '---')}`)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // Standards Table Rows (RTL ordered columns: حیطه -> شماره -> شرح -> امتیاز)
  const standardsRows = [
    new TableRow({
      children: [
        new TableCell({ children: [createPara([createText('حیطه', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '312E81' }, margins: cellMarginsSpec, borders: headerCellBorder }),
        new TableCell({ children: [createPara([createText('شماره', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '312E81' }, margins: cellMarginsSpec, borders: headerCellBorder }),
        new TableCell({ children: [createPara([createText('معیار الزامی (شرح استاندارد)', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '312E81' }, margins: cellMarginsSpec, borders: headerCellBorder }),
        new TableCell({ children: [createPara([createText('امتیاز (۰ ، ۰٫۵ یا ۱)', { bold: true, color: 'FFFFFF' })], { alignment: AlignmentType.CENTER })], shading: { fill: '312E81' }, margins: cellMarginsSpec, borders: headerCellBorder }),
      ],
    }),
    ...QUARTERLY_STANDARDS.map((std) => {
      const scoreVal = assessment.scores[std.code] ?? 0;
      return new TableRow({
        children: [
          new TableCell({ children: [createPara([createText(std.domainCode, { bold: true })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(std.code, { bold: true })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(std.title)])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(toPersianDigits(scoreVal), { bold: true })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
        ],
      });
    }),
    new TableRow({
      children: [
        new TableCell({ children: [createPara([createText('مجموع')], { alignment: AlignmentType.CENTER })], shading: { fill: 'F1F5F9' }, margins: cellMarginsSpec, borders: headerCellBorder }),
        new TableCell({ children: [createPara([createText('---')], { alignment: AlignmentType.CENTER })], shading: { fill: 'F1F5F9' }, margins: cellMarginsSpec, borders: headerCellBorder }),
        new TableCell({
          children: [createPara([createText('جمع امتیازات و درصد موفقیت خودارزیابی', { bold: true, color: '1E1B4B' })], { alignment: AlignmentType.CENTER })],
          shading: { fill: 'F1F5F9' },
          margins: cellMarginsSpec,
          borders: headerCellBorder,
        }),
        new TableCell({
          children: [createPara([createText(`${toPersianDigits(assessment.totalScore)} از ${toPersianDigits(assessment.maxScore)} ( %${toPersianDigits(assessment.percentage.toFixed(1))} )`, { bold: true, color: '1E1B4B' })], { alignment: AlignmentType.CENTER })],
          shading: { fill: 'F1F5F9' },
          margins: cellMarginsSpec,
          borders: headerCellBorder,
        }),
      ],
    }),
  ];

  const standardsTable = new Table({
    alignment: AlignmentType.RIGHT,
    rows: standardsRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const ev = assessment.evaluatorNames || {};

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          createPara([createText('بسمه تعالی', { bold: true, color: '1E1B4B', size: 24 })], { alignment: AlignmentType.CENTER, spacingAfter: 100 }),
          createPara([createText('دانشگاه علوم پزشکی و خدمات بهداشتی درمانی جندی شاپور اهواز - معاونت درمان', { bold: true, color: '1E1B4B', size: 22 })], { alignment: AlignmentType.CENTER, spacingAfter: 80 }),
          createPara([createText('چشم انداز: ما برآنیم تا به عنوان تنها بیمارستان دولتی دانشگاه علوم پزشکی جندی شاپور در شهرستان امیدیه خدمات مورد نیاز بیماران را در کمترین زمان ممکن با هدف حفظ ایمنی بیمار و بهبود مستمر کیفیت بطور موثر ارائه کنیم.', { size: 18, color: '334155' })], { alignment: AlignmentType.CENTER, spacingAfter: 150 }),
          createPara([createText(`فرم خودارزیابی فصلی ایمنی بیمار - ${assessment.season} ${toPersianDigits(assessment.year)}`, { bold: true, color: '1E1B4B', size: 28 })], { alignment: AlignmentType.CENTER, spacingAfter: 200 }),

          createPara([createText('مشخصات بیمارستان', { bold: true, color: '1E1B4B', size: 22 })], { spacingAfter: 100 }),
          hospitalSpecsTable,

          createPara([createText('جدول نمره‌دهی استانداردهای الزامی ایمنی بیمار', { bold: true, color: '1E1B4B', size: 22 })], { spacingBefore: 200, spacingAfter: 100 }),
          standardsTable,

          createPara([createText('اعضای تیم ارزیابی و تأییدکنندگان:', { bold: true, color: '1E1B4B', size: 22 })], { spacingBefore: 250, spacingAfter: 150 }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      createPara([createText('مسئول ایمنی بیمار و ریاست بیمارستان:', { bold: true })], { alignment: AlignmentType.CENTER }),
                      createPara([createText(ev.safetyOfficerAndPresident || '-----------------------')], { alignment: AlignmentType.CENTER }),
                    ],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                  new TableCell({
                    children: [
                      createPara([createText('مدیر داخلی بیمارستان:', { bold: true })], { alignment: AlignmentType.CENTER }),
                      createPara([createText(ev.internalManager || 'هاشم دیلمی کیا')], { alignment: AlignmentType.CENTER }),
                    ],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      createPara([createText('مترون بیمارستان:', { bold: true })], { alignment: AlignmentType.CENTER }),
                      createPara([createText(ev.metron || 'زینب چرغان')], { alignment: AlignmentType.CENTER }),
                    ],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                  new TableCell({
                    children: [
                      createPara([createText('مسئول بهبود کیفیت:', { bold: true })], { alignment: AlignmentType.CENTER }),
                      createPara([createText(ev.qualityManager || 'فاطمه فرحی')], { alignment: AlignmentType.CENTER }),
                    ],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      createPara([createText('کارشناس هماهنگ‌کننده ایمنی بیمار:', { bold: true })], { alignment: AlignmentType.CENTER }),
                      createPara([createText(ev.safetyCoordinator || 'مهلا عریضی')], { alignment: AlignmentType.CENTER }),
                    ],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                  new TableCell({
                    children: [
                      createPara([createText('تاریخ تأیید نهایی:', { bold: true })], { alignment: AlignmentType.CENTER }),
                      createPara([createText(toPersianDigits(assessment.createdAt || new Date().toLocaleDateString('fa-IR')))], { alignment: AlignmentType.CENTER }),
                    ],
                    margins: cellMarginsSpec,
                    borders: cellBorderSpec,
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Export FMEA Worksheet (آنالیز حالت‌های خطا و اثرات آن) to native Word (.docx)
export async function exportFmeaReportDocx(fmea: FmeaReport) {
  const title = fmea.title ? fmea.title.substring(0, 30) : 'FMEA_Report';
  const fileName = `کاربرگ_FMEA_${title.replace(/[\s\n\r\/\\?%*:|"<>]+/g, '_')}.docx`;
  const fontName = 'Tahoma';

  const createText = (text: string, options: { bold?: boolean; color?: string; size?: number } = {}) =>
    new TextRun({
      text: text,
      bold: options.bold || false,
      color: options.color || '0F172A',
      size: options.size || 20,
      font: fontName,
      rightToLeft: true,
    });

  const createPara = (
    textRuns: TextRun[],
    options: { alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacingBefore?: number; spacingAfter?: number } = {}
  ) =>
    new Paragraph({
      children: textRuns,
      alignment: options.alignment || AlignmentType.RIGHT,
      bidirectional: true,
      spacing: {
        before: options.spacingBefore ?? 60,
        after: options.spacingAfter ?? 60,
      },
    });

  const cellMarginsSpec = { top: 120, bottom: 120, left: 150, right: 150 };
  const cellBorderSpec = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  };

  const headerCellBorder = {
    top: { style: BorderStyle.SINGLE, size: 2, color: '1E1B4B' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: '1E1B4B' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '312E81' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '312E81' },
  };

  // Header Banner
  const headerBannerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText('بسمه تعالی', { bold: true, color: 'FFFFFF', size: 22 })], { alignment: AlignmentType.CENTER, spacingAfter: 40 }),
              createPara([createText('آنالیز حالت‌های خطا و اثرات آن (FMEA - Failure Mode and Effects Analysis)', { bold: true, color: 'FDE047', size: 24 })], { alignment: AlignmentType.CENTER, spacingAfter: 30 }),
              createPara([createText('کمیته مدیریت ایمنی بیمار و سنجش ریسک‌های بالینی', { bold: true, color: 'E2E8F0', size: 20 })], { alignment: AlignmentType.CENTER }),
            ],
            shading: { fill: '1E1B4B' },
            margins: { top: 180, bottom: 180, left: 200, right: 200 },
            borders: headerCellBorder,
          }),
        ],
      }),
    ],
  });

  // Metadata Table
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('عنوان فرایند / آنالیز: ', { bold: true, color: '1E1B4B' }), createText(fmea.title || '---')])],
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('بخش / واحد مربوطه: ', { bold: true, color: '1E1B4B' }), createText(fmea.departmentOrProcess || '---')])],
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('رهبر / دبیر تیم FMEA: ', { bold: true, color: '1E1B4B' }), createText(fmea.teamLeader || '---')])],
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText('تاریخ ارزیابی: ', { bold: true, color: '1E1B4B' }), createText(toPersianDigits(fmea.assessmentDate || '---'))])],
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('اعضای تیم FMEA: ', { bold: true, color: '1E1B4B' }), createText(fmea.teamMembers || '---')])],
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createPara([createText('اهداف و شرح فرایند: ', { bold: true, color: '1E1B4B' }), createText(fmea.description || 'توضیحاتی ثبت نشده است.')])],
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
        ],
      }),
    ],
  });

  // FMEA Table Headers & Items
  const fmeaTableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [createPara([createText('اقدامات پیشنهادی و مسئول اجرا', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 18, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('RPN', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 6, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('کشف (D)', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 5, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('کنترلهای جاری', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 10, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('وقوع (O)', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 5, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('علل بالقوه خطا', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 13, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('شدت (S)', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 5, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('اثرات خطا', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 13, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('حالت خطای بالقوه', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 13, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('گام فرایند', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 9, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [createPara([createText('ردیف', { bold: true, color: 'FFFFFF', size: 17 })], { alignment: AlignmentType.CENTER })], shading: { fill: '1E1B4B' }, margins: cellMarginsSpec, borders: headerCellBorder, width: { size: 3, type: WidthType.PERCENTAGE } }),
      ],
    }),
    ...fmea.items.map((item, idx) => {
      const calculatedRpn = item.rpn || item.severity * item.occurrence * item.detection;
      const rpnColor = calculatedRpn >= 100 || item.severity >= 8 ? 'DC2626' : calculatedRpn >= 40 ? 'D97706' : '16A34A';
      return new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText(item.recommendedActions || '---', { size: 17 })]),
              createPara([createText(`مسئول و مهلت: ${item.responsiblePerson || '---'}`, { bold: true, color: '475569', size: 16 })], { spacingBefore: 40 }),
              item.actionTaken ? createPara([createText(`اقدام انجام شده: ${item.actionTaken}`, { color: '0284C7', size: 16 })], { spacingBefore: 30 }) : new Paragraph({ children: [] }),
            ],
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [createPara([createText(toPersianDigits(calculatedRpn), { bold: true, color: rpnColor, size: 18 })], { alignment: AlignmentType.CENTER })],
            shading: { fill: calculatedRpn >= 100 ? 'FEE2E2' : 'F8FAFC' },
            margins: cellMarginsSpec,
            borders: cellBorderSpec,
          }),
          new TableCell({ children: [createPara([createText(toPersianDigits(item.detection), { size: 17 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(item.currentControls || '---', { size: 17 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(toPersianDigits(item.occurrence), { size: 17 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(item.potentialCauses || '---', { size: 17 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(toPersianDigits(item.severity), { bold: true, color: item.severity >= 8 ? 'DC2626' : '0F172A', size: 17 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(item.potentialEffects || '---', { size: 17 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(item.potentialFailureMode || '---', { bold: true, size: 17 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(item.processStep || '---', { size: 17 })])], margins: cellMarginsSpec, borders: cellBorderSpec }),
          new TableCell({ children: [createPara([createText(toPersianDigits(idx + 1), { bold: true, size: 17 })], { alignment: AlignmentType.CENTER })], margins: cellMarginsSpec, borders: cellBorderSpec }),
        ],
      });
    }),
  ];

  const fmeaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: fmeaTableRows,
  });

  // Signatures Table
  const signaturesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              createPara([createText('نام و امضای دبیر تیم FMEA / کمیته ایمنی:', { bold: true, color: '1E1B4B', size: 19 })], { alignment: AlignmentType.CENTER, spacingAfter: 300 }),
              createPara([createText('تاریخ و امضا: ............................', { color: '64748B', size: 18 })], { alignment: AlignmentType.CENTER }),
            ],
            shading: { fill: 'F8FAFC' },
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: cellBorderSpec,
          }),
          new TableCell({
            children: [
              createPara([createText('نام و امضای رئیس بیمارستان / مدیر کیفیت:', { bold: true, color: '1E1B4B', size: 19 })], { alignment: AlignmentType.CENTER, spacingAfter: 300 }),
              createPara([createText('تاریخ و امضا: ............................', { color: '64748B', size: 18 })], { alignment: AlignmentType.CENTER }),
            ],
            shading: { fill: 'F8FAFC' },
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: cellBorderSpec,
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          headerBannerTable,
          createPara([], { spacingBefore: 120, spacingAfter: 120 }),
          metaTable,
          createPara([], { spacingBefore: 180, spacingAfter: 180 }),
          createPara([createText('جدول آنالیز حالت‌های خطا و اثرات آن (FMEA Matrix):', { bold: true, color: '1E1B4B', size: 22 })], { spacingAfter: 120 }),
          fmeaTable,
          createPara([], { spacingBefore: 300, spacingAfter: 200 }),
          signaturesTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}


