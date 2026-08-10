export const CLINICAL_DEPARTMENTS = [
  'ICU',
  'CCU',
  'داخلی/جراحی',
  'اورژانس',
  'زنان و زایمان',
  'دیالیز',
  'اطفال',
  'زایشگاه',
  'تالاسمی',
  'اتاق عمل',
] as const;

export type ClinicalDeptType = typeof CLINICAL_DEPARTMENTS[number];

export interface ClinicalIndicatorItem {
  id: string;
  title: string;
  unit: string;
  category: string;
  allowedDepts: ClinicalDeptType[];
  description?: string;
  targetValue?: number;
}

export const CLINICAL_INDICATORS_MATRIX: ClinicalIndicatorItem[] = [
  // 1. سقوط و زخم بستر
  {
    id: 'ind-fall-count',
    title: 'تعداد موارد سقوط',
    unit: 'مورد',
    category: 'سقوط و زخم بستر',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی'],
    description: 'تعداد کل سقوط بیماران بستری در بخش طی ماه',
    targetValue: 0,
  },
  {
    id: 'ind-fall-risk',
    title: 'تعداد بیماران در معرض سقوط',
    unit: 'نفر',
    category: 'سقوط و زخم بستر',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی'],
    description: 'بیماران با ریسک بالا بر اساس مقیاس مورس',
    targetValue: 0,
  },
  {
    id: 'ind-bedsore-new',
    title: 'تعداد موارد جدید زخم بستر درجه ۲ به بالا',
    unit: 'مورد',
    category: 'سقوط و زخم بستر',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی'],
    description: 'زخم فشاری ایجاد شده طی بستری در بخش',
    targetValue: 0,
  },
  {
    id: 'ind-bedsore-risk',
    title: 'تعداد کل بیماران در معرض زخم بستر',
    unit: 'نفر',
    category: 'سقوط و زخم بستر',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی'],
    description: 'ارزیابی ریسک بر اساس مقیاس برادن',
    targetValue: 0,
  },

  // 2. خون و فرآورده‌ها
  {
    id: 'ind-blood-complication',
    title: 'تعداد بیماران دچار عارضه خون',
    unit: 'مورد',
    category: 'خون و فرآورده‌های خونی',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی', 'اتاق عمل'],
    description: 'واکنش‌ها و عوارض ناشی از تزریق خون و فرآورده‌ها',
    targetValue: 0,
  },
  {
    id: 'ind-blood-bags',
    title: 'تعداد کیسه فرآورده‌های مصرف شده',
    unit: 'کیسه',
    category: 'خون و فرآورده‌های خونی',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی', 'اتاق عمل'],
    description: 'مجموع کیسه‌های خون، پلاکت، FFP و...',
    targetValue: 0,
  },

  // 3. قلبی و عروقی
  {
    id: 'ind-mi-cases',
    title: 'تعداد موارد MI (سکته حاد قلبی)',
    unit: 'مورد',
    category: 'امراض قلبی و مغزی',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان'],
    description: 'تعداد رویدادهای سکته قلبی ثبت‌شده',
    targetValue: 0,
  },
  {
    id: 'ind-mi-deaths',
    title: 'تعداد موارد فوت بدلیل MI',
    unit: 'مورد',
    category: 'امراض قلبی و مغزی',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان'],
    description: 'مرگ و میر ناشی از انفارکتوس میوکارد',
    targetValue: 0,
  },
  {
    id: 'ind-cardiac-patients',
    title: 'تعداد کل بیماران بستری شده با مشکل قلبی',
    unit: 'نفر',
    category: 'امراض قلبی و مغزی',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان'],
    description: 'بیماران با تشخیصی اولیه یا ثانویه قلبی',
    targetValue: 0,
  },
  {
    id: 'ind-stroke-cases',
    title: 'تعداد موارد سکته مغزی (CVA)',
    unit: 'مورد',
    category: 'امراض قلبی و مغزی',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس'],
    description: 'سکته‌های مغزی ایسکمیک یا همورژیک',
    targetValue: 0,
  },

  // 4. بستری و تغذیه
  {
    id: 'ind-total-inpatients',
    title: 'تعداد کل بیماران بستری',
    unit: 'نفر',
    category: 'بستری و تغذیه',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی'],
    description: 'مجموع بیماران بستری طی ماه شمسی',
    targetValue: 0,
  },
  {
    id: 'ind-nutrition-consults',
    title: 'تعداد مشاوره تغذیه انجام شده',
    unit: 'مورد',
    category: 'بستری و تغذیه',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال'],
    description: 'مشاوره‌های رژیمی و تغذیه‌ای بالینی ثبت‌شده',
    targetValue: 0,
  },
  {
    id: 'ind-nutrition-eligible',
    title: 'تعداد بیماران مشمول دستورالعمل مشاوره تغذیه',
    unit: 'نفر',
    category: 'بستری و تغذیه',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال'],
    description: 'بیماران نیازمند غربالگری تغذیه طبق پروتکل',
    targetValue: 0,
  },

  // 5. عوارض و ترخیص
  {
    id: 'ind-postop-vte',
    title: 'آمبولی وریدی و ریوی بعد از جراحی',
    unit: 'مورد',
    category: 'عوارض و ترخیص',
    allowedDepts: ['داخلی/جراحی', 'زنان و زایمان', 'اتاق عمل'],
    description: 'ترومبوآمبولی وریدی یا ترومبوز عروق عمقی پس از عمل',
    targetValue: 0,
  },
  {
    id: 'ind-readmissions-30d',
    title: 'تعداد موارد بستری مجدد طی یکماه',
    unit: 'مورد',
    category: 'عوارض و ترخیص',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی'],
    description: 'بازگشت غیرمنتظره بیمار در کمتر از ۳۰ روز',
    targetValue: 0,
  },
  {
    id: 'ind-lama-discharges',
    title: 'تعداد موارد ترخیص با رضایت شخصی',
    unit: 'مورد',
    category: 'عوارض و ترخیص',
    allowedDepts: ['ICU', 'CCU', 'داخلی/جراحی', 'اورژانس', 'زنان و زایمان', 'دیالیز', 'اطفال', 'زایشگاه', 'تالاسمی'],
    description: 'ترخیص قبل از تکمیل درمان با مسئولیت شخصی (LAMA)',
    targetValue: 0,
  },

  // 6. زایمان و زنان
  {
    id: 'ind-nvd-count',
    title: 'تعداد زایمان طبیعی',
    unit: 'مورد',
    category: 'زایمان و زنان',
    allowedDepts: ['زنان و زایمان', 'زایشگاه'],
    description: 'زایمان‌های فیزیولوژیک و طبیعی انجام‌شده',
    targetValue: 0,
  },
  {
    id: 'ind-csection-first',
    title: 'تعداد سزارین نخست',
    unit: 'مورد',
    category: 'زایمان و زنان',
    allowedDepts: ['زنان و زایمان', 'زایشگاه', 'اتاق عمل'],
    description: 'سزارین شکم اول (Primary C-Section)',
    targetValue: 0,
  },
  {
    id: 'ind-csection-total',
    title: 'تعداد سزارین',
    unit: 'مورد',
    category: 'زایمان و زنان',
    allowedDepts: ['زنان و زایمان', 'زایشگاه', 'اتاق عمل'],
    description: 'مجموع سزارین‌های الکتیو و اورژانسی',
    targetValue: 0,
  },

  // 7. جراحی و اتاق عمل
  {
    id: 'ind-surgery-elective',
    title: 'تعداد جراحی الکتیو',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    description: 'عمل‌های برنامه‌ریزی شده',
    targetValue: 0,
  },
  {
    id: 'ind-surgery-emergency',
    title: 'تعداد جراحی اورژانسی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    description: 'عمل‌های اورژانس و حیاتی',
    targetValue: 0,
  },
  {
    id: 'ind-surgery-outpatient',
    title: 'تعداد جراحی سرپایی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    description: 'اعمال جراحی بدون نیاز به بستری شبانه',
    targetValue: 0,
  },
  {
    id: 'ind-surgery-total',
    title: 'تعداد کل جراحی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    description: 'مجموع تمامی اعمال جراحی اتاق عمل',
    targetValue: 0,
  },
  {
    id: 'ind-surg-dept-obgyn',
    title: 'تعداد جراحی به تفکیک - زنان و زایمان',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    targetValue: 0,
  },
  {
    id: 'ind-surg-dept-ortho',
    title: 'تعداد جراحی به تفکیک - ارتوپدی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    targetValue: 0,
  },
  {
    id: 'ind-surg-dept-ent',
    title: 'تعداد جراحی به تفکیک - ENT (گوش و حلق و بینی)',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    targetValue: 0,
  },
  {
    id: 'ind-surg-dept-eye',
    title: 'تعداد جراحی به تفکیک - چشم',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    targetValue: 0,
  },
  {
    id: 'ind-surg-dept-general',
    title: 'تعداد جراحی به تفکیک - عمومی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    targetValue: 0,
  },
  {
    id: 'ind-anesthesia-complications',
    title: 'عوارض بیهوشی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    description: 'عوارض مرتبط با بیهوشی عمومی یا موضعی',
    targetValue: 0,
  },
  {
    id: 'ind-surg-comp-bleeding',
    title: 'عوارض جراحی - خونریزی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    targetValue: 0,
  },
  {
    id: 'ind-surg-comp-burn',
    title: 'عوارض جراحی - سوختگی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    targetValue: 0,
  },
  {
    id: 'ind-surg-comp-retained-body',
    title: 'عوارض جراحی - جاماندن جسم خارجی',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    description: 'جاماندن گاز، شان یا ابزار جراحی در موضع',
    targetValue: 0,
  },
  {
    id: 'ind-surgery-cancelled',
    title: 'تعداد جراحی کنسل شده',
    unit: 'مورد',
    category: 'جراحی و اتاق عمل',
    allowedDepts: ['اتاق عمل'],
    description: 'اعمال جراحی لغوشده پس از برنامه‌ریزی',
    targetValue: 0,
  },
];

// Helper function to normalize user department name to standard clinical department
export function normalizeDepartmentName(deptName?: string): ClinicalDeptType {
  if (!deptName) return 'ICU';
  const name = deptName.trim();
  if (name.includes('ICU') || name.includes('مراقبت‌های ویژه') || name.includes('آی سی یو')) return 'ICU';
  if (name.includes('CCU') || name.includes('سی سی یو')) return 'CCU';
  if (name.includes('اورژانس')) return 'اورژانس';
  if (name.includes('داخلی') || name.includes('جراحی')) return 'داخلی/جراحی';
  if (name.includes('زنان') || name.includes('زایمان')) return 'زنان و زایمان';
  if (name.includes('دیالیز')) return 'دیالیز';
  if (name.includes('اطفال') || name.includes('کودکان')) return 'اطفال';
  if (name.includes('زایشگاه') || name.includes('بلوک زایمان')) return 'زایشگاه';
  if (name.includes('تالاسمی')) return 'تالاسمی';
  if (name.includes('اتاق عمل')) return 'اتاق عمل';
  return 'داخلی/جراحی';
}
