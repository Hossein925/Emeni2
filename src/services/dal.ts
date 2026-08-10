import {
  User,
  Department,
  StaffMember,
  SafetyIndicatorDefinition,
  SafetyIndicatorRecord,
  StaffEvaluation,
  SafetyMeeting,
  MeetingResolution,
  Checklist,
  ChecklistResponse,
  ErrorReport,
  EducationCategory,
  EducationTopic,
  SafetyScenario,
  SafetyVisit,
  Announcement,
  QuizExam,
  QuizSubmission,
  QuizQuestion,
  RcaReport,
  QuarterlySelfAssessment,
  FmeaReport,
  FmeaFailureModeItem,
} from '../types';
import { getCurrentJalaliYear, getCurrentJalaliMonth, JALALI_MONTHS } from '../utils/jalali';
import { CLINICAL_INDICATORS_MATRIX } from '../data/indicators';
import { supabase, isSupabaseConfigured } from './supabase';

// Real-time Event System & Background Refresh
type DALChangeListener = () => void;
const dalListeners = new Set<DALChangeListener>();

export function subscribeToDALChanges(listener: DALChangeListener): () => void {
  dalListeners.add(listener);
  return () => {
    dalListeners.delete(listener);
  };
}

function notifyDALChange(): void {
  dalListeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error('DAL change listener error:', err);
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dal_data_changed'));
  }
}

// Background Auto-Refresh Loop (Every 1000ms seamlessly in background)
if (typeof window !== 'undefined') {
  setInterval(() => {
    notifyDALChange();
  }, 1000);
}

// Keys for LocalStorage persistence
const STORAGE_KEYS = {
  USERS: 'ps_users_v1',
  DEPARTMENTS: 'ps_departments_v1',
  INDICATORS_DEF: 'ps_indicators_def_v1',
  INDICATOR_RECORDS: 'ps_indicator_records_v1',
  EVALUATIONS: 'ps_evaluations_v1',
  MEETINGS: 'ps_meetings_v1',
  CHECKLISTS: 'ps_checklists_v1',
  CHECKLIST_RESPONSES: 'ps_checklist_responses_v1',
  ERROR_REPORTS: 'ps_error_reports_v1',
  EDUCATION_CATEGORIES: 'ps_edu_categories_v2',
  EDUCATION: 'ps_education_v2',
  SCENARIOS: 'ps_scenarios_v1',
  VISITS: 'ps_visits_v1',
  CURRENT_USER: 'ps_current_user_v1',
  ANNOUNCEMENTS: 'ps_announcements_v1',
  QUIZ_EXAMS: 'ps_quiz_exams_v1',
  QUIZ_SUBMISSIONS: 'ps_quiz_submissions_v1',
  RCA_REPORTS: 'ps_rca_reports_v1',
  QUARTERLY_ASSESSMENTS: 'ps_quarterly_assessments_v1',
  FMEA_REPORTS: 'ps_fmea_reports_v1',
  STAFF_MEMBERS: 'ps_staff_members_v1',
};

// Initial Default Seed Data
const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'بخش اورژانس', managerName: 'خانم دکتر رضایی', managerCode: '1010', managerPassword: '1010password', createdAt: '1403/01/10' },
  { id: 'dept-2', name: 'بخش مراقبت‌های ویژه (ICU)', managerName: 'آقای دکتر احمدی', managerCode: '1020', managerPassword: '1020password', createdAt: '1403/01/10' },
  { id: 'dept-3', name: 'بخش جراحی عمومی', managerName: 'سرپرستار کاظمی', managerCode: '1030', managerPassword: '1030password', createdAt: '1403/01/10' },
  { id: 'dept-4', name: 'بخش داخلی و اطفال', managerName: 'خانم مرادی', managerCode: '1040', managerPassword: '1040password', createdAt: '1403/01/10' },
];

// Combine standard clinical matrix with initial default definitions
const INITIAL_INDICATOR_DEFS: SafetyIndicatorDefinition[] = [
  ...CLINICAL_INDICATORS_MATRIX.map((c) => ({
    id: c.id,
    title: c.title,
    targetValue: c.targetValue ?? 0,
    unit: c.unit,
    description: c.description || c.category,
    category: c.category,
  })),
  { id: 'ind-1', title: 'میزان سقوط بیمار (دست‌کم ۱ بار در ماه)', targetValue: 0, unit: 'مورد', description: 'تعداد موارد سقوط بیماران بستری در بخش' },
  { id: 'ind-2', title: 'درصد شیوع زخم بستر (زخم فشاری)', targetValue: 2, unit: 'درصد', description: 'نسبت بیماران دارای زخم بستر به کل بیماران مقیم بخش' },
  { id: 'ind-3', title: 'تعداد خطاهای دارویی ثبت‌شده', targetValue: 0, unit: 'مورد', description: 'انواع خطاهای دارویی شامل دوز اشتباه، داروی اشتباه و بیمار اشتباه' },
  { id: 'ind-4', title: 'درصد رعایت بهداشت دست توسط پرسنل', targetValue: 85, unit: 'درصد', description: 'میزان پایبندی کادر درمان به ۵ موقعیت بهداشت دست WHO' },
  { id: 'ind-5', title: 'موارد مواجهه شغلی (Needle Stick)', targetValue: 0, unit: 'مورد', description: 'تعداد جراحات ناشی از سرسوزن و اجسام تیز برنده در پرسنل' },
];

const INITIAL_INDICATOR_RECORDS: SafetyIndicatorRecord[] = [
  { id: 'rec-1', departmentId: 'dept-1', departmentName: 'بخش اورژانس', indicatorId: 'ind-1', indicatorTitle: 'میزان سقوط بیمار', value: 1, year: 1403, month: 4, monthName: 'تیر', createdAt: '1403/04/30', notes: 'سقوط از برانکارد بدون آسیب شدید' },
  { id: 'rec-2', departmentId: 'dept-1', departmentName: 'بخش اورژانس', indicatorId: 'ind-3', indicatorTitle: 'تعداد خطاهای دارویی ثبت‌شده', value: 2, year: 1403, month: 4, monthName: 'تیر', createdAt: '1403/04/30', notes: 'کشف خطا قبل از تزریق' },
  { id: 'rec-3', departmentId: 'dept-2', departmentName: 'بخش مراقبت‌های ویژه (ICU)', indicatorId: 'ind-2', indicatorTitle: 'درصد شیوع زخم بستر', value: 1.5, year: 1403, month: 4, monthName: 'تیر', createdAt: '1403/04/28', notes: 'انجام تغییر پوزیشن هر ۲ ساعت' },
  { id: 'rec-4', departmentId: 'dept-2', departmentName: 'بخش مراقبت‌های ویژه (ICU)', indicatorId: 'ind-4', indicatorTitle: 'درصد رعایت بهداشت دست', value: 92, year: 1403, month: 4, monthName: 'تیر', createdAt: '1403/04/28' },
  { id: 'rec-5', departmentId: 'dept-3', departmentName: 'بخش جراحی عمومی', indicatorId: 'ind-1', indicatorTitle: 'میزان سقوط بیمار', value: 0, year: 1403, month: 4, monthName: 'تیر', createdAt: '1403/04/25' },
];

const INITIAL_EDUCATION_CATEGORIES: EducationCategory[] = [
  {
    id: 'cat-1',
    title: 'شناسایی بیمار',
    description: 'دستورالعمل‌ها و پروتکل‌های انطباق هویت و دستبند شناسه بیمار',
    color: 'from-blue-600 to-indigo-700',
    iconName: 'UserCheck',
    createdAt: '1403/01/10',
    updatedAt: '1403/04/15',
  },
  {
    id: 'cat-2',
    title: 'داروهای پرخطر و ایمنی دارویی',
    description: 'اصول ۷ گانه تحویل دارو و مدیریت داروهای با هشدار بالا (LASA)',
    color: 'from-emerald-600 to-teal-700',
    iconName: 'Pill',
    createdAt: '1403/01/10',
    updatedAt: '1403/04/18',
  },
  {
    id: 'cat-3',
    title: 'پیشگیری از سقوط بیمار',
    description: 'ارزیابی مقیاس مورس و اقدامات پیشگیرانه سقوط بیماران بستری',
    color: 'from-cyan-600 to-blue-700',
    iconName: 'ShieldAlert',
    createdAt: '1403/01/10',
    updatedAt: '1403/04/20',
  },
  {
    id: 'cat-4',
    title: 'ارتباطات ایمن و تحویل بیمار (SBAR)',
    description: 'تکنیک استاندارد SBAR در تبادل اطلاعات بالینی و شفاهی',
    color: 'from-indigo-600 to-purple-700',
    iconName: 'MessageSquareText',
    createdAt: '1403/01/10',
    updatedAt: '1403/04/22',
  },
  {
    id: 'cat-5',
    title: 'کنترل عفونت و بهداشت دست',
    description: '۵ موقعیت بهداشت دست WHO و پروتکل‌های ضدعفونی بخش‌ها',
    color: 'from-amber-600 to-orange-700',
    iconName: 'Hand',
    createdAt: '1403/01/10',
    updatedAt: '1403/04/25',
  },
];

const INITIAL_EDUCATION_TOPICS: EducationTopic[] = [
  {
    id: 'edu-1',
    categoryId: 'cat-1',
    categoryTitle: 'شناسایی بیمار',
    title: 'دستبند شناسایی بیمار (نحوه صدور، کنترل و الصاق)',
    summary: 'پروتکل الزامی صدور دستبند شناسه دارای ۲ شناسه منحصر‌به‌فرد بیمار در بدو ورود',
    content: `
      <h2>۱. اصول کلی شناسایی بیمار</h2>
      <p>تمام بیماران بستری در تمامی بخش‌های بیمارستان از لحظه پذیرش تا زمان ترخیص باید دارای دستبند شناسه استاندارد باشند.</p>
      
      <h2>۲. شناسه‌های استاندارد (۲ Identifier)</h2>
      <p>بر اساس استانداردهای اعتباربخشی ملی، شناسایی بیمار باید بر اساس حداقل ۲ عنصر اصلی صورت گیرد:</p>
      <ul>
        <li>نام و نام خانوادگی کامل بیمار</li>
        <li>شماره پرونده (پرونده پزشکی یا کدملی)</li>
      </ul>
      <p><strong>نکته مهم:</strong> هرگز شماره تخت یا شماره اتاق نباید به‌عنوان شناسه بیمار استفاده شود!</p>

      <h2>۳. کنترل دستبند قبل از هرگونه اقدام بالینی</h2>
      <p>قبل از خونگیری، تزریق دارو، انتقال به اتاق عمل و رادیولوژی، کنترل چشمی دستبند و سوال فعالانه از بیمار الزامی است.</p>
    `,
    readingTime: '۳ دقیقه',
    updatedAt: '1403/04/15',
  },
  {
    id: 'edu-2',
    categoryId: 'cat-1',
    categoryTitle: 'شناسایی بیمار',
    title: 'شناسایی فعال (Active Identification) قبل از پروسه درمانی',
    summary: 'نحوه پرسش مستقیم نام کامل و تاریخ تولد از بیمار یا همراه وی قبل از هر اقدام',
    content: `
      <h2>شناسایی فعال چیست؟</h2>
      <p>شناسایی فعال به معنای پرسیدن سوال باز از بیمار است. برای مثال پرستار باید بگوید: «لطفاً نام و نام خانوادگی خود را بفرمایید» نه اینکه بگوید «شما آقای احمدی هستید؟»</p>
      <p>در بیماران نوزاد، بیهوش یا دارای اختلال هوشیاری، کنترل شناسه با همراه قانونی و تطبیق مستقیم با دستبند بیمار صورت می‌گیرد.</p>
    `,
    readingTime: '۲ دقیقه',
    updatedAt: '1403/04/16',
  },
  {
    id: 'edu-3',
    categoryId: 'cat-2',
    categoryTitle: 'داروهای پرخطر و ایمنی دارویی',
    title: 'اصول ۷‌گانه تحویل و تحویل ایمن داروها (Right 7)',
    summary: 'چک‌لیست کنترل ۷ مرحله‌ای تجویز و تزریق داروی بیماران بستری',
    content: `
      <h2>قانون ۷ Right در تجویز داروها</h2>
      <ol>
        <li><strong>بیمار درست (Right Patient):</strong> استعلام نام و بررسی دستبند شناسه بیمار</li>
        <li><strong>داروی درست (Right Drug):</strong> چک کردن نام دارو با کاردکس دارویی</li>
        <li><strong>دوز درست (Right Dose):</strong> محاسبه دقیق مقدار دوز تجویزی</li>
        <li><strong>راه درست (Right Route):</strong> بررسی مسیر تزریق (خوراکی، تزریقی، پوستی)</li>
        <li><strong>زمان درست (Right Time):</strong> تزریق در زمان دقیق اعلام شده</li>
        <li><strong>ثبت درست (Right Documentation):</strong> ثبت بلافاصله پس از تزریق در پرونده</li>
        <li><strong>پاسخ درست (Right Response):</strong> پایش بیمار از نظر عوارض جانبی احتمالی</li>
      </ol>
    `,
    readingTime: '۴ دقیقه',
    updatedAt: '1403/04/18',
  },
  {
    id: 'edu-4',
    categoryId: 'cat-2',
    categoryTitle: 'داروهای پرخطر و ایمنی دارویی',
    title: 'مدیریت داروهای LASA و داروهای با هشدار بالا (High Alert)',
    summary: 'روش برچسب‌گذاری قرمز و جداسازی داروهای با تشابه اسمی و ظاهری در ترالی',
    content: `
      <h2>داروهای LASA چیست؟</h2>
      <p>داروهایی که دارای ظاهر مشابه (Look-Alike) یا اسامی مشابه (Sound-Alike) هستند LASA نامیده می‌شوند (مانند پوکه پتاسیم کلراید و نرمال سالین).</p>
      <h3>اقدامات الزامی:</h3>
      <ul>
        <li>جداسازی فیزیکی در ترالی دارویی</li>
        <li>نصب برچسب هشدار رنگی مجزا</li>
        <li>اجرای چک دونفره (Double Check) قبل از تزریق</li>
      </ul>
    `,
    readingTime: '۳ دقیقه',
    updatedAt: '1403/04/19',
  },
  {
    id: 'edu-5',
    categoryId: 'cat-3',
    categoryTitle: 'پیشگیری از سقوط بیمار',
    title: 'پروتکل‌های پیشگیری از سقوط و مقیاس مورس (Morse Fall Scale)',
    summary: 'نحوه ارزیابی خطرات محیطی و جسمی سقوط و تنظیم نرده‌های تخت',
    content: `
      <h2>۱. ارزیابی اولیه و روزانه</h2>
      <p>ارزیابی خطر سقوط کلیه بیماران بستری در بدو ورود و در هر شیفت بر اساس مقیاس مورس الزامی است.</p>
      <h2>۲. اقدامات پیشگیرانه</h2>
      <ul>
        <li>همواره نرده‌های محافظ تخت (Side Rails) بالا قرار گیرد.</li>
        <li>قفل چرخ‌های تخت و برانکارد چک شود.</li>
        <li>روشنایی کافی شبانه در اتاق بیمار و سرویس بهداشتی برقرار باشد.</li>
      </ul>
    `,
    readingTime: '۳ دقیقه',
    updatedAt: '1403/04/20',
  },
  {
    id: 'edu-6',
    categoryId: 'cat-4',
    categoryTitle: 'ارتباطات ایمن و تحویل بیمار (SBAR)',
    title: 'تکنیک SBAR در ارتباطات شفاهی و تحویل شیفت کادر درمان',
    summary: 'چهارچوب ۴ مرحله‌ای SBAR جهت تبادل سریع و دقیق اطلاعات بیمار',
    content: `
      <h2>اجزای ۴‌گانه SBAR:</h2>
      <ul>
        <li><strong>S - Situation (موقعیت):</strong> بیان نام خود، بخش، نام بیمار و مشکل فعلی</li>
        <li><strong>B - Background (پیشینه):</strong> سابقه بیماری، علائم حیاتی و وضعیت بستری</li>
        <li><strong>A - Assessment (ارزیابی):</strong> ارزیابی بالینی شما از وضعیت فعلی بیمار</li>
        <li><strong>R - Recommendation (پیشنهاد):</strong> درخواست یا پیشنهاد اقدام فوری</li>
      </ul>
    `,
    readingTime: '۳ دقیقه',
    updatedAt: '1403/04/22',
  },
  {
    id: 'edu-7',
    categoryId: 'cat-5',
    categoryTitle: 'کنترل عفونت و بهداشت دست',
    title: '۵ موقعیت طلایی بهداشت دست بر اساس استاندارد WHO',
    summary: 'راهنمای موقعیت‌های ۵ گانه الزامی هندراب و شستشوی دست کادر درمان',
    content: `
      <h2>مواقع ضروری بهداشت دست:</h2>
      <ol>
        <li>قبل از لمس بیمار</li>
        <li>قبل از انجام تمیزکاری یا اقدام استریل</li>
        <li>بعد از مواجهه با مایعات بدن بیمار</li>
        <li>بعد از لمس بیمار</li>
        <li>بعد از لمس محیط اطراف بیمار</li>
      </ol>
    `,
    readingTime: '۲ دقیقه',
    updatedAt: '1403/04/25',
  },
];

const INITIAL_SCENARIOS: SafetyScenario[] = [
  {
    id: 'scen-1',
    title: 'تشابه اسمی و دوز دارویی در بخش اورژانس',
    scenarioDate: '1403/04/12',
    summary: 'خطای نزدیک به وقوع (Near Miss) در تزریق آمپول پتاسیم کلراید به جای سدیم کلراید',
    fullContent: `
      <h3>شرح سناریو:</h3>
      <p>پرستار مسئول بخش اورژانس در حین شلوغی شیفت شب، قصد برداشتن سرم نرمال سالین را داشت. پوکه دارویی پتاسیم کلراید غلیظ به دلیل ظاهر مشابه در ترالی دارویی در کنار سدیم کلراید قرار گرفته بود.</p>
      <h3>اقدام هوشمندانه کادر درمان:</h3>
      <p>پرستار قبل از تزریق، پروتکل «بررسی مضاعف (Double Check)» را اجرا کرد و متوجه اشتباه بودن دارو شد و از یک حادثه ناگوار فوت بیمار جلوگیری گردید.</p>
      <h3>درس‌های آموخته شده:</h3>
      <ul>
        <li>جداسازی کامل داروهای با هشدار بالا (High Alert) و داروهای مشابه (LASA) در ترالی دارویی با برچسب قرمز</li>
        <li>الزامی بودن چک دو نفره داروی پتاسیم قبل از تزریق</li>
      </ul>
    `,
    category: 'خطای دارویی',
    lessonsLearned: 'جداسازی داروهای LASA و برچسب‌گذاری ترالی با رنگ متمایز',
  },
  {
    id: 'scen-2',
    title: 'عدم نصب دستبند شناسه بیمار در جراحی بستری',
    scenarioDate: '1403/04/05',
    summary: 'انتقال بیمار بدون شناسه استاندارد به اتاق عمل و بازگرداندن وی قبل از بیهوشی',
    fullContent: `
      <h3>شرح سناریو:</h3>
      <p>بیمار کاندید جراحی آپاندکتومی بدون دستبند شناسه توسط لنبربر به اتاق عمل منتقل شد. در بخش ریکاوری، تکنسین بیهوشی قبل از شروع القای بیهوشی نام و مشخصات و نوع جراحی را صراحتاً از خود بیمار پرسید.</p>
      <h3>درس‌های آموخته شده:</h3>
      <ul>
        <li>هرگز نباید بیماری بدون دستبند شناسه خوانا از بخش خارج شود.</li>
        <li>چک‌لیست ایمنی اتاق عمل (WHO Surgical Safety Checklist) مانع خطای جراحی شد.</li>
      </ul>
    `,
    category: 'شناسایی بیمار',
    lessonsLearned: 'کنترل دوگانه دستبند شناسه قبل از خروج از بخش',
  },
];

const INITIAL_MEETINGS: SafetyMeeting[] = [
  {
    id: 'meet-1',
    subject: 'بررسی حوادث ناخواسته فصل بهار و ارتقای استانداردها',
    secretary: 'آقای دکتر موسوی (مدیر ایمنی بیمار)',
    description: 'در این جلسه تحلیل علل ریشه‌ای (RCA) سقوط بیمار در اورژانس و بازبینی ترالی‌های دارویی بخش جراحی مورد بحث و تصمیم‌گیری قرار گرفت.',
    meetingDate: '1403/04/10',
    attendees: ['دکتر موسوی', 'خانم دکتر رضایی', 'سرپرستار کاظمی', 'مهندس علوی (تجهیزات پزشکی)'],
    followUpPerson: 'سرپرستار کاظمی',
    deadline: '1403/05/15',
    createdAt: '1403/04/10',
    resolutions: [
      {
        id: 'res-1',
        meetingId: 'meet-1',
        meetingSubject: 'بررسی حوادث ناخواسته فصل بهار',
        text: 'الصاق برچسب هشدار خطای دارویی بر روی تمامی ترالی‌های دارویی بخش‌های بستری',
        weight: 5,
        priority: 'high',
        isPublic: true,
        responsiblePerson: 'سوپروایزر آموزشی',
        deadline: '1403/05/01',
        status: 'in_progress',
      },
      {
        id: 'res-2',
        meetingId: 'meet-1',
        meetingSubject: 'بررسی حوادث ناخواسته فصل بهار',
        text: 'تجهیز تخت‌های بخش اورژانس به حفاظ کنار تخت (Side Rails) استاندارد دوطرفه',
        weight: 4,
        priority: 'high',
        isPublic: true,
        responsiblePerson: 'واحد تجهیزات پزشکی',
        deadline: '1403/05/10',
        status: 'completed',
      },
      {
        id: 'res-3',
        meetingId: 'meet-1',
        meetingSubject: 'بررسی حوادث ناخواسته فصل بهار',
        text: 'برگزاری کارگاه آموزشی تکنیک SBAR برای کلیه پرسنل پرستاری جدیدالورود',
        weight: 3,
        priority: 'medium',
        isPublic: true,
        responsiblePerson: 'دفتر پرستاری',
        deadline: '1403/05/20',
        status: 'pending',
      },
    ],
  },
];

const INITIAL_CHECKLISTS: Checklist[] = [
  {
    id: 'chk-1',
    title: 'چک‌لیست ارزیابی ایمنی ترالی کد و دارو در بخش',
    category: 'head_nurse',
    description: 'چک‌لیست ماهیانه سرپرستاران جهت بررسی ایمنی تجهیزات و داروهای بخش',
    createdAt: '1403/01/15',
    fields: [
      { id: 'f1', label: 'آیا کلیه داروهای تاریخ گذشته از ترالی خارج شده‌اند؟', type: 'yesno', required: true },
      { id: 'f2', label: 'آیا پلمپ ترالی کد سالم و دارای شماره ثبت است؟', type: 'yesno', required: true },
      { id: 'f3', label: 'وضعیت آمادگی کپسول اکسیژن و ساکشن بخش', type: 'rating', required: true },
      { id: 'f4', label: 'توضیحات و نقائص مشاهده شده', type: 'text', required: false },
    ],
  },
  {
    id: 'chk-2',
    title: 'چک‌لیست ارزیابی دانش ایمنی بیمار پرسنل',
    category: 'staff_eval',
    description: 'چک‌لیست سنجش میزان آگاهی پرسنل از کدهای ایمنی و گزارش خطا',
    createdAt: '1403/01/20',
    fields: [
      { id: 'f10', label: 'آیا پرسنل با ۵ موقعیت بهداشت دست آشنایی کامل دارد؟', type: 'yesno', required: true },
      { id: 'f11', label: 'آیا پرسنل نحوه ثبت گزارش خطا در سامانه را می‌داند؟', type: 'yesno', required: true },
      { id: 'f12', label: 'آگاهی از کدهای بحران (کد ۱۲۴، کد ۹۹)', type: 'rating', required: true },
      { id: 'f13', label: 'میزان تسلط بر پروتکل پیشگیری از سقوط', type: 'mc', options: ['عالی', 'خوب', 'متوسط', 'نیازمند آموزش'], required: true },
    ],
  },
  {
    id: 'chk-3',
    title: 'فرم عمومی گزارش خطای پزشکی و ایمنی بیمار',
    category: 'error_report',
    description: 'فرم ثبت خطاهای دارویی، سقوط، شناسایی بیمار و تجهیزات توسط پرسنل',
    createdAt: '1403/01/01',
    fields: [
      { id: 'ef1', label: 'نوع خطای رخ داده یا نزدیک به وقوع (Near Miss)', type: 'mc', options: ['خطای دارویی', 'سقوط بیمار', 'اشتباه در شناسایی بیمار', 'اشتباه در آزمایشگاه/گرافي', 'نقص تجهیزات پزشکی', 'سایر موارد'], required: true },
      { id: 'ef2', label: 'آیا خطا به بیمار صدمه وارد کرده است؟', type: 'yesno', required: true },
      { id: 'ef3', label: 'شرح کامل نحوه وقوع حادثه', type: 'text', required: true },
      { id: 'ef4', label: 'ارزیابی کیفی شدت حادثه', type: 'rating', required: true },
    ],
  },
];

const INITIAL_EVALUATIONS: StaffEvaluation[] = [
  {
    id: 'eval-1',
    staffName: 'مریم حسینی',
    nationalId: '0012345678',
    departmentId: 'dept-1',
    departmentName: 'بخش اورژانس',
    checklistId: 'chk-2',
    checklistTitle: 'چک‌لیست ارزیابی دانش ایمنی بیمار پرسنل',
    totalScore: 18,
    maxScore: 20,
    percentage: 90,
    year: 1403,
    month: 4,
    monthName: 'تیر',
    correctiveAction: 'شرکت در کارگاه بازآموزی تکنیک SBAR جهت ارتقای ارتباطات',
    createdAt: '1403/04/18',
    evaluatedBy: 'سرپرستار بخش',
    answers: {},
  },
  {
    id: 'eval-2',
    staffName: 'علی محمدی',
    nationalId: '0087654321',
    departmentId: 'dept-1',
    departmentName: 'بخش اورژانس',
    checklistId: 'chk-2',
    checklistTitle: 'چک‌لیست ارزیابی دانش ایمنی بیمار پرسنل',
    totalScore: 14,
    maxScore: 20,
    percentage: 70,
    year: 1403,
    month: 4,
    monthName: 'تیر',
    correctiveAction: 'آموزش چهره به چهره پروتکل پیشگیری از سقوط',
    createdAt: '1403/04/19',
    evaluatedBy: 'سوپروایزر ایمنی',
    answers: {},
  },
];

const INITIAL_ERROR_REPORTS: ErrorReport[] = [
  {
    id: 'err-1',
    reporterName: 'پرستار نوری',
    departmentId: 'dept-1',
    departmentName: 'بخش اورژانس',
    reportDate: '1403/04/14',
    answers: {
      ef1: 'خطای دارویی',
      ef2: 'خیر',
      ef3: 'دوز داروی سرم آنتی‌بیوتیک روی کاردکس با دستخط ناخوانا نوشته شده بود که قبل از تزریق مجدداً از پزشک استعلام گردید.',
      ef4: 4,
    },
    status: 'investigating',
    createdAt: '1403/04/14',
  },
];

const INITIAL_SAFETY_VISITS: SafetyVisit[] = [
  {
    id: 'vis-1',
    departmentId: 'dept-1',
    departmentName: 'بخش اورژانس',
    visitDate: '1403/04/08',
    teamMembers: ['دکتر موسوی', 'خانم مهندس صادقی', 'سوپروایزر ایمنی'],
    observations: 'شناسه بیماران کاندید بستری به موقع نصب گردیده بود اما سیستم فرآیند تحویل تحویل نیازمند ارتقا است.',
    resolutions: 'نصب تابلوی راهنمای SBAR در ایستگاه پرستاری اورژانس',
    followUpPerson: 'سرپرستار اورژانس',
    createdAt: '1403/04/08',
  },
];

// Helper to safely load data from LocalStorage
function loadData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading key ${key} from storage:`, e);
    return defaultValue;
  }
}

// Helper to save data to LocalStorage & Supabase
function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyDALChange();

    // Async sync with Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const tableName = key.replace('ps_', '').replace('_v1', '').replace('_v2', '');
      supabase.from(tableName).upsert({ id: key, payload: data }).catch((err) => {
        console.warn('Supabase sync error:', err);
      });
    }
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

// Data Access Layer Object
export const DataAccessLayer = {
  // Authentication
  async authenticateUser(userCode: string, passwordHash: string): Promise<User | null> {
    // Super Admin check
    if (userCode.trim() === '5850008985' && passwordHash.trim() === '64546') {
      const superAdminUser: User = {
        id: 'super-admin-1',
        userCode: '5850008985',
        passwordHash: '64546',
        name: 'مدیر سامانه',
        role: 'super_admin',
      };
      saveData(STORAGE_KEYS.CURRENT_USER, superAdminUser);
      return superAdminUser;
    }

    // Department Managers check
    const depts = await this.getDepartments();
    const deptMatch = depts.find(
      (d) => d.managerCode.trim() === userCode.trim() && (d.managerPassword || '').trim() === passwordHash.trim()
    );

    if (deptMatch) {
      const deptManagerUser: User = {
        id: `dept-mgr-${deptMatch.id}`,
        userCode: deptMatch.managerCode,
        passwordHash: deptMatch.managerPassword || '',
        name: deptMatch.managerName,
        role: 'department_manager',
        departmentId: deptMatch.id,
        departmentName: deptMatch.name,
      };
      saveData(STORAGE_KEYS.CURRENT_USER, deptManagerUser);
      return deptManagerUser;
    }

    return null;
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  logoutUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    return loadData<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  async addDepartment(dept: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
    const list = await this.getDepartments();
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    list.push(newDept);
    saveData(STORAGE_KEYS.DEPARTMENTS, list);
    return newDept;
  },

  async updateDepartment(updated: Department): Promise<Department> {
    const list = await this.getDepartments();
    const idx = list.findIndex((d) => d.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      saveData(STORAGE_KEYS.DEPARTMENTS, list);
    }
    return updated;
  },

  async deleteDepartment(id: string): Promise<void> {
    let list = await this.getDepartments();
    list = list.filter((d) => d.id !== id);
    saveData(STORAGE_KEYS.DEPARTMENTS, list);
  },

  // Indicator Definitions & Records
  async getIndicatorDefinitions(): Promise<SafetyIndicatorDefinition[]> {
    return loadData<SafetyIndicatorDefinition[]>(STORAGE_KEYS.INDICATORS_DEF, INITIAL_INDICATOR_DEFS);
  },

  async saveIndicatorDefinition(def: Omit<SafetyIndicatorDefinition, 'id'> & { id?: string }): Promise<SafetyIndicatorDefinition> {
    const list = await this.getIndicatorDefinitions();
    if (def.id) {
      const idx = list.findIndex((i) => i.id === def.id);
      if (idx !== -1) list[idx] = def as SafetyIndicatorDefinition;
    } else {
      const newDef: SafetyIndicatorDefinition = {
        ...def,
        id: `ind-${Date.now()}`,
      };
      list.push(newDef);
      def = newDef;
    }
    saveData(STORAGE_KEYS.INDICATORS_DEF, list);
    return def as SafetyIndicatorDefinition;
  },

  async getIndicatorRecords(departmentId?: string): Promise<SafetyIndicatorRecord[]> {
    const records = loadData<SafetyIndicatorRecord[]>(STORAGE_KEYS.INDICATOR_RECORDS, INITIAL_INDICATOR_RECORDS);
    if (departmentId) {
      return records.filter((r) => r.departmentId === departmentId);
    }
    return records;
  },

  async saveIndicatorRecord(record: Omit<SafetyIndicatorRecord, 'id' | 'createdAt'>): Promise<SafetyIndicatorRecord> {
    const list = loadData<SafetyIndicatorRecord[]>(STORAGE_KEYS.INDICATOR_RECORDS, INITIAL_INDICATOR_RECORDS);
    const existingIndex = list.findIndex(
      (r) =>
        (r.departmentId === record.departmentId || r.departmentName === record.departmentName) &&
        (r.indicatorId === record.indicatorId || r.indicatorTitle === record.indicatorTitle) &&
        r.year === record.year &&
        r.month === record.month
    );

    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...record,
        value: Number(record.value) || 0,
      };
      saveData(STORAGE_KEYS.INDICATOR_RECORDS, list);
      return list[existingIndex];
    }

    const newRec: SafetyIndicatorRecord = {
      ...record,
      value: Number(record.value) || 0,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    list.push(newRec);
    saveData(STORAGE_KEYS.INDICATOR_RECORDS, list);
    return newRec;
  },

  // Staff Evaluations
  async getEvaluations(departmentId?: string): Promise<StaffEvaluation[]> {
    const evals = loadData<StaffEvaluation[]>(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS);
    if (departmentId) {
      return evals.filter((e) => e.departmentId === departmentId);
    }
    return evals;
  },

  async saveEvaluation(evaluation: Omit<StaffEvaluation, 'id' | 'createdAt'>): Promise<StaffEvaluation> {
    const list = loadData<StaffEvaluation[]>(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS);
    const newEval: StaffEvaluation = {
      ...evaluation,
      id: `eval-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    list.push(newEval);
    saveData(STORAGE_KEYS.EVALUATIONS, list);
    return newEval;
  },

  // Meetings & Resolutions
  async getMeetings(): Promise<SafetyMeeting[]> {
    return loadData<SafetyMeeting[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
  },

  async saveMeeting(meeting: Omit<SafetyMeeting, 'id' | 'createdAt'> & { id?: string }): Promise<SafetyMeeting> {
    const list = await this.getMeetings();
    let savedMeeting: SafetyMeeting;
    if (meeting.id) {
      const idx = list.findIndex((m) => m.id === meeting.id);
      savedMeeting = {
        ...(meeting as SafetyMeeting),
        createdAt: list[idx]?.createdAt || new Date().toLocaleDateString('fa-IR'),
      };
      if (idx !== -1) list[idx] = savedMeeting;
    } else {
      savedMeeting = {
        ...meeting,
        id: `meet-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(savedMeeting);
    }
    saveData(STORAGE_KEYS.MEETINGS, list);
    return savedMeeting;
  },

  async toggleResolutionPublicStatus(meetingId: string, resolutionId: string, isPublic: boolean): Promise<void> {
    const list = await this.getMeetings();
    const meeting = list.find((m) => m.id === meetingId);
    if (meeting) {
      const res = meeting.resolutions.find((r) => r.id === resolutionId);
      if (res) {
        res.isPublic = isPublic;
        saveData(STORAGE_KEYS.MEETINGS, list);
      }
    }
  },

  async deleteMeeting(meetingId: string): Promise<void> {
    const list = await this.getMeetings();
    const updated = list.filter((m) => m.id !== meetingId);
    saveData(STORAGE_KEYS.MEETINGS, updated);
  },

  async getPublicResolutions(): Promise<MeetingResolution[]> {
    const meetings = await this.getMeetings();
    const publicResolutions: MeetingResolution[] = [];
    meetings.forEach((m) => {
      m.resolutions.forEach((r) => {
        if (r.isPublic) {
          publicResolutions.push({
            ...r,
            meetingId: m.id,
            meetingSubject: m.subject,
          });
        }
      });
    });
    // Sort by weight/priority descending
    return publicResolutions.sort((a, b) => b.weight - a.weight);
  },

  // Checklists
  async getChecklists(category?: 'head_nurse' | 'staff_eval' | 'error_report'): Promise<Checklist[]> {
    const lists = loadData<Checklist[]>(STORAGE_KEYS.CHECKLISTS, INITIAL_CHECKLISTS);
    if (category) {
      return lists.filter((c) => c.category === category);
    }
    return lists;
  },

  async saveChecklist(checklist: Omit<Checklist, 'id' | 'createdAt'> & { id?: string }): Promise<Checklist> {
    const list = loadData<Checklist[]>(STORAGE_KEYS.CHECKLISTS, INITIAL_CHECKLISTS);
    let result: Checklist;
    if (checklist.id) {
      const idx = list.findIndex((c) => c.id === checklist.id);
      result = {
        ...(checklist as Checklist),
        createdAt: list[idx]?.createdAt || new Date().toLocaleDateString('fa-IR'),
      };
      if (idx !== -1) list[idx] = result;
    } else {
      result = {
        ...checklist,
        id: `chk-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(result);
    }
    saveData(STORAGE_KEYS.CHECKLISTS, list);
    return result;
  },

  async deleteChecklist(id: string): Promise<void> {
    let list = loadData<Checklist[]>(STORAGE_KEYS.CHECKLISTS, INITIAL_CHECKLISTS);
    list = list.filter((c) => c.id !== id);
    saveData(STORAGE_KEYS.CHECKLISTS, list);
  },

  // Checklist Responses
  async getChecklistResponses(departmentId?: string): Promise<ChecklistResponse[]> {
    const list = loadData<ChecklistResponse[]>(STORAGE_KEYS.CHECKLIST_RESPONSES, []);
    if (departmentId) {
      return list.filter((r) => r.departmentId === departmentId);
    }
    return list;
  },

  async saveChecklistResponse(resp: Omit<ChecklistResponse, 'id' | 'submittedAt'>): Promise<ChecklistResponse> {
    const list = loadData<ChecklistResponse[]>(STORAGE_KEYS.CHECKLIST_RESPONSES, []);
    const newResp: ChecklistResponse = {
      ...resp,
      id: `resp-${Date.now()}`,
      submittedAt: new Date().toLocaleDateString('fa-IR'),
    };
    list.push(newResp);
    saveData(STORAGE_KEYS.CHECKLIST_RESPONSES, list);
    return newResp;
  },

  // Error Reports
  async getErrorReports(departmentId?: string): Promise<ErrorReport[]> {
    const reports = loadData<ErrorReport[]>(STORAGE_KEYS.ERROR_REPORTS, INITIAL_ERROR_REPORTS);
    if (departmentId) {
      return reports.filter((r) => r.departmentId === departmentId);
    }
    return reports;
  },

  async saveErrorReport(report: Omit<ErrorReport, 'id' | 'createdAt' | 'status'>): Promise<ErrorReport> {
    const list = loadData<ErrorReport[]>(STORAGE_KEYS.ERROR_REPORTS, INITIAL_ERROR_REPORTS);
    const newReport: ErrorReport = {
      ...report,
      id: `err-${Date.now()}`,
      status: 'received',
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    list.push(newReport);
    saveData(STORAGE_KEYS.ERROR_REPORTS, list);
    return newReport;
  },

  // Education Categories
  async getEducationCategories(): Promise<EducationCategory[]> {
    return loadData<EducationCategory[]>(STORAGE_KEYS.EDUCATION_CATEGORIES, INITIAL_EDUCATION_CATEGORIES);
  },

  async saveEducationCategory(cat: Omit<EducationCategory, 'id' | 'updatedAt'> & { id?: string }): Promise<EducationCategory> {
    const list = await this.getEducationCategories();
    let result: EducationCategory;
    if (cat.id) {
      const idx = list.findIndex((c) => c.id === cat.id);
      result = {
        ...(cat as EducationCategory),
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      };
      if (idx !== -1) list[idx] = result;
    } else {
      result = {
        ...cat,
        id: `cat-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(result);
    }
    saveData(STORAGE_KEYS.EDUCATION_CATEGORIES, list);
    return result;
  },

  async deleteEducationCategory(id: string): Promise<void> {
    let list = await this.getEducationCategories();
    list = list.filter((c) => c.id !== id);
    saveData(STORAGE_KEYS.EDUCATION_CATEGORIES, list);

    // Also delete all topics in this category
    let topics = await this.getEducationTopics();
    topics = topics.filter((t) => t.categoryId !== id);
    saveData(STORAGE_KEYS.EDUCATION, topics);
  },

  // Education Topics
  async getEducationTopics(categoryId?: string): Promise<EducationTopic[]> {
    const topics = loadData<EducationTopic[]>(STORAGE_KEYS.EDUCATION, INITIAL_EDUCATION_TOPICS);
    if (categoryId) {
      return topics.filter((t) => t.categoryId === categoryId);
    }
    return topics;
  },

  async saveEducationTopic(topic: Omit<EducationTopic, 'id' | 'updatedAt'> & { id?: string }): Promise<EducationTopic> {
    const list = await this.getEducationTopics();
    let result: EducationTopic;
    if (topic.id) {
      const idx = list.findIndex((t) => t.id === topic.id);
      result = {
        ...(topic as EducationTopic),
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      };
      if (idx !== -1) list[idx] = result;
    } else {
      result = {
        ...topic,
        id: `edu-${Date.now()}`,
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(result);
    }
    saveData(STORAGE_KEYS.EDUCATION, list);
    return result;
  },

  async deleteEducationTopic(id: string): Promise<void> {
    let list = await this.getEducationTopics();
    list = list.filter((t) => t.id !== id);
    saveData(STORAGE_KEYS.EDUCATION, list);
  },

  // Safety Scenarios
  async getScenarios(): Promise<SafetyScenario[]> {
    return loadData<SafetyScenario[]>(STORAGE_KEYS.SCENARIOS, INITIAL_SCENARIOS);
  },

  async saveScenario(scen: Omit<SafetyScenario, 'id'> & { id?: string }): Promise<SafetyScenario> {
    const list = await this.getScenarios();
    let result: SafetyScenario;
    if (scen.id) {
      const idx = list.findIndex((s) => s.id === scen.id);
      result = scen as SafetyScenario;
      if (idx !== -1) list[idx] = result;
    } else {
      result = {
        ...scen,
        id: `scen-${Date.now()}`,
      };
      list.push(result);
    }
    saveData(STORAGE_KEYS.SCENARIOS, list);
    return result;
  },

  async deleteScenario(id: string): Promise<void> {
    let list = await this.getScenarios();
    list = list.filter((s) => s.id !== id);
    saveData(STORAGE_KEYS.SCENARIOS, list);
  },

  // Safety Visits
  async getSafetyVisits(departmentId?: string): Promise<SafetyVisit[]> {
    const visits = loadData<SafetyVisit[]>(STORAGE_KEYS.VISITS, INITIAL_SAFETY_VISITS);
    if (departmentId) {
      return visits.filter((v) => v.departmentId === departmentId);
    }
    return visits;
  },

  async saveSafetyVisit(visit: Omit<SafetyVisit, 'id' | 'createdAt'>): Promise<SafetyVisit> {
    const list = loadData<SafetyVisit[]>(STORAGE_KEYS.VISITS, INITIAL_SAFETY_VISITS);
    const newVisit: SafetyVisit = {
      ...visit,
      id: `vis-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    list.push(newVisit);
    saveData(STORAGE_KEYS.VISITS, list);
    return newVisit;
  },

  // Announcements / Ticker Bar
  async getAnnouncements(): Promise<Announcement[]> {
    const defaults: Announcement[] = [
      {
        id: 'ann-1',
        title: 'اطلاعیه مهم ایمنی بیمار',
        content: '<p><strong>اطلاعیه مهم ایمنی بیمار:</strong> تمامی کادر محترم درمان موظف به رعایت اصول ۷‌گانه تحویل ایمن داروها و ثبت دقیق گزارش خطاهای دارویی در سامانه می‌باشند. | <strong>کنترل عفونت:</strong> رعایت بهداشت دست در ۵ موقعیت الزامی است.</p>',
        isActive: true,
        priority: 'high',
        createdAt: '1403/05/01',
        speed: 25,
      },
    ];
    return loadData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, defaults);
  },

  async saveAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt'> & { id?: string }): Promise<Announcement> {
    const list = await this.getAnnouncements();
    let result: Announcement;
    if (ann.id) {
      const idx = list.findIndex((a) => a.id === ann.id);
      result = {
        ...(list[idx] || {}),
        ...ann,
        id: ann.id,
      } as Announcement;
      if (idx !== -1) list[idx] = result;
      else list.push(result);
    } else {
      result = {
        ...ann,
        id: `ann-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(result);
    }
    saveData(STORAGE_KEYS.ANNOUNCEMENTS, list);
    return result;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    let list = await this.getAnnouncements();
    list = list.filter((a) => a.id !== id);
    saveData(STORAGE_KEYS.ANNOUNCEMENTS, list);
  },

  // Quiz / Exam Management
  async getQuizExams(): Promise<QuizExam[]> {
    const defaults: QuizExam[] = [
      {
        id: 'exam-1',
        title: 'آزمون جامع استانداردهای الزامی ایمنی بیمار',
        targetGroup: 'کادر پرستاری و مامایی',
        description: 'سنجش دانش بالینی در زمینه شناسایی بیمار، داروهای پرخطر، تکنیک SBAR و بهداشت دست',
        durationMinutes: 15,
        displayQuestionCount: 5,
        isActive: true,
        createdAt: '1403/05/01',
        questions: [
          {
            id: 'q-1',
            questionText: 'شناسایی فعال بیمار قبل از ارائه هرگونه خدمت بالینی با چند شناسه استاندارد انجام می‌شود؟',
            type: 'multiple_choice',
            options: ['حداقل ۱ شناسه (نام و نام خانوادگی)', 'حداقل ۲ شناسه (نام و نام خانوادگی + شماره پرونده یا کدملی)', '۳ شناسه شامل شماره تخت و نام', 'فقط شماره اتاق و تخت'],
            correctOptionIndex: 1,
            shuffleOptions: true,
            points: 2,
          },
          {
            id: 'q-2',
            questionText: 'کدام روش برای تحویل شفاهی بیماران بدحال و گزارش تغییرات حاد بالینی استاندارد بین‌المللی است؟',
            type: 'multiple_choice',
            options: ['روش SOAP', 'تکنیک SBAR (Situation, Background, Assessment, Recommendation)', 'تکنیک ISBAR', 'روش شفاهی بدون فرمت خاص'],
            correctOptionIndex: 1,
            shuffleOptions: true,
            points: 2,
          },
          {
            id: 'q-3',
            questionText: 'رنگ دستبند شناسه بیمار برای بیماران دارای سابقه حساسیت دارویی یا غذایی شدید کدام است؟',
            type: 'multiple_choice',
            options: ['دستبند سفید', 'دستبند قرمز', 'دستبند زرد', 'دستبند آبی'],
            correctOptionIndex: 1,
            shuffleOptions: true,
            points: 2,
          },
          {
            id: 'q-4',
            questionText: 'داروهای با تشابه ظاهری و صوتی (LASA) باید در قفسه دارویی بخش چگونه نگهداری شوند؟',
            type: 'multiple_choice',
            options: ['کنار هم جهت دسترسی سریعتر', 'جدا از هم با برچسب مشخص‌کننده و رنگی LASA', 'در یخچال بخش', 'در ترالی تریاژ'],
            correctOptionIndex: 1,
            shuffleOptions: true,
            points: 2,
          },
          {
            id: 'q-5',
            questionText: 'پنج موقعیت اصلی بهداشت دست سازمان جهانی بهداشت (WHO) را به طور خلاصه شرح دهید.',
            type: 'descriptive',
            points: 4,
          },
          {
            id: 'q-6',
            questionText: 'در صورت وقوع نیدل‌استیک (Needle Stick)، اولین اقدام فوری شستشوی محل با آب و صابون بدون فشار است.',
            type: 'true_false',
            options: ['صحیح', 'غلط'],
            correctOptionIndex: 0,
            shuffleOptions: false,
            points: 2,
          },
          {
            id: 'q-7',
            questionText: 'کدام گزینه در مورد فرم‌های گزارش خطای ایمنی بیمار درست است؟',
            type: 'multiple_choice',
            options: ['گزارش‌دهی تنبیهی است', 'گزارش‌دهی داوطلبانه، محرمانه و بدون توبیخ است', 'فقط توسط سرپرستار قابل ثبت است', 'فقط خطاهای منجر به فوت ثبت می‌شوند'],
            correctOptionIndex: 1,
            shuffleOptions: true,
            points: 2,
          },
        ],
      },
    ];
    return loadData<QuizExam[]>(STORAGE_KEYS.QUIZ_EXAMS, defaults);
  },

  async saveQuizExam(examData: Partial<QuizExam> & { id?: string }): Promise<QuizExam> {
    const list = await this.getQuizExams();
    let result: QuizExam;

    if (examData.id) {
      const idx = list.findIndex((e) => e.id === examData.id);
      result = {
        ...(list[idx] || {}),
        ...examData,
        id: examData.id,
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      } as QuizExam;
      if (idx !== -1) list[idx] = result;
      else list.push(result);
    } else {
      result = {
        title: examData.title || 'آزمون ارزیابی جدید',
        targetGroup: examData.targetGroup || 'تمامی پرسنل',
        description: examData.description || '',
        durationMinutes: examData.durationMinutes || 15,
        displayQuestionCount: examData.displayQuestionCount || 10,
        questions: examData.questions || [],
        isActive: examData.isActive !== undefined ? examData.isActive : true,
        id: `exam-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(result);
    }

    saveData(STORAGE_KEYS.QUIZ_EXAMS, list);
    return result;
  },

  async deleteQuizExam(id: string): Promise<void> {
    let list = await this.getQuizExams();
    list = list.filter((e) => e.id !== id);
    saveData(STORAGE_KEYS.QUIZ_EXAMS, list);
  },

  async getQuizSubmissions(examId?: string): Promise<QuizSubmission[]> {
    const subs = loadData<QuizSubmission[]>(STORAGE_KEYS.QUIZ_SUBMISSIONS, []);
    if (examId) {
      return subs.filter((s) => s.examId === examId);
    }
    return subs;
  },

  async saveQuizSubmission(subData: Partial<QuizSubmission>): Promise<QuizSubmission> {
    const subs = await this.getQuizSubmissions();
    const newSub: QuizSubmission = {
      id: `sub-${Date.now()}`,
      examId: subData.examId || '',
      examTitle: subData.examTitle || 'آزمون ایمنی',
      staffName: subData.staffName || 'نامشخص',
      nationalId: subData.nationalId || '',
      departmentId: subData.departmentId || '',
      departmentName: subData.departmentName || 'نامشخص',
      answers: subData.answers || {},
      score: subData.score || 0,
      maxScore: subData.maxScore || 10,
      percentage: subData.percentage || 0,
      submittedAt: new Date().toLocaleDateString('fa-IR'),
    };
    subs.push(newSub);
    saveData(STORAGE_KEYS.QUIZ_SUBMISSIONS, subs);
    return newSub;
  },

  async getRcaReports(): Promise<RcaReport[]> {
    return loadData<RcaReport[]>(STORAGE_KEYS.RCA_REPORTS, []);
  },

  async saveRcaReport(data: Partial<RcaReport> & { id?: string }): Promise<RcaReport> {
    const list = await this.getRcaReports();
    let result: RcaReport;

    if (data.id) {
      const idx = list.findIndex((r) => r.id === data.id);
      result = {
        ...(list[idx] || {}),
        ...data,
        id: data.id,
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      } as RcaReport;
      if (idx !== -1) list[idx] = result;
      else list.push(result);
    } else {
      result = {
        title: data.title || data.eventDescription || 'کاربرگ تحلیل ریشه‌ای خطا (RCA)',
        createdAt: new Date().toLocaleDateString('fa-IR'),
        id: `rca-${Date.now()}`,
        teamMembers: data.teamMembers || '',
        eventDescription: data.eventDescription || '',
        eventDate: data.eventDate || '',
        eventLocation: data.eventLocation || '',
        eventTypeOrCode: data.eventTypeOrCode || '',
        intervieweeName: data.intervieweeName || '',
        interviewerName: data.interviewerName || '',
        interviewDates: data.interviewDates || '',
        avgInterviewTime: data.avgInterviewTime || '',
        interviewCount: data.interviewCount || '',
        reportsCount: data.reportsCount || '',
        documentsDocs: data.documentsDocs || '',
        equipmentDocs: data.equipmentDocs || '',
        siteVisitDocs: data.siteVisitDocs || '',
        informationMapping: data.informationMapping || '',
        problemIdentificationMethod: data.problemIdentificationMethod || '',
        systemProblemsSDP: data.systemProblemsSDP || '',
        contributorProblemsCDP: data.contributorProblemsCDP || '',
        environmentalFactors: data.environmentalFactors || '',
        humanFactors: data.humanFactors || '',
        processFactors: data.processFactors || '',
        equipmentFactors: data.equipmentFactors || '',
        rootCausesAndActions: data.rootCausesAndActions || [],
        correctivePlans: data.correctivePlans || [],
        operationalPlans: data.operationalPlans || [],
        auditQ1: data.auditQ1 || '',
        auditQ2: data.auditQ2 || '',
        auditQ3: data.auditQ3 || '',
        auditQ4: data.auditQ4 || '',
      };
      list.push(result);
    }

    saveData(STORAGE_KEYS.RCA_REPORTS, list);
    return result;
  },

  async deleteRcaReport(id: string): Promise<void> {
    let list = await this.getRcaReports();
    list = list.filter((r) => r.id !== id);
    saveData(STORAGE_KEYS.RCA_REPORTS, list);
  },

  // Quarterly Self Assessments (خودارزیابی فصلی)
  async getQuarterlySelfAssessments(): Promise<QuarterlySelfAssessment[]> {
    return loadData<QuarterlySelfAssessment[]>(STORAGE_KEYS.QUARTERLY_ASSESSMENTS, []);
  },

  async saveQuarterlySelfAssessment(data: Partial<QuarterlySelfAssessment> & { id?: string }): Promise<QuarterlySelfAssessment> {
    const list = await this.getQuarterlySelfAssessments();
    let result: QuarterlySelfAssessment;

    const currentYear = getCurrentJalaliYear();

    if (data.id) {
      const idx = list.findIndex((q) => q.id === data.id);
      result = {
        ...(list[idx] || {}),
        ...data,
        id: data.id,
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      } as QuarterlySelfAssessment;
      if (idx !== -1) list[idx] = result;
      else list.push(result);
    } else {
      result = {
        id: `qsa-${Date.now()}`,
        title: data.title || `خودارزیابی فصلی - ${data.season || 'بهار'} ${data.year || currentYear}`,
        year: data.year || currentYear,
        season: data.season || 'بهار',
        hospitalName: data.hospitalName || 'امام رضا (ع)',
        approvedBeds: data.approvedBeds || '',
        activeBeds: data.activeBeds || '',
        bedOccupancyRate: data.bedOccupancyRate || '',
        avgDailyInpatients: data.avgDailyInpatients || '',
        annualOutpatientVisits: data.annualOutpatientVisits || '',
        annualEmergencyL13: data.annualEmergencyL13 || '',
        annualEmergencyL45: data.annualEmergencyL45 || '',
        scores: data.scores || {},
        totalScore: data.totalScore || 0,
        maxScore: data.maxScore || 25,
        percentage: data.percentage || 0,
        evaluationTeam: data.evaluationTeam || 'تیم بهبود کیفیت و ایمنی بیمار',
        evaluatorNames: data.evaluatorNames || {
          safetyOfficerAndPresident: '',
          internalManager: 'هاشم دیلمی کیا',
          metron: 'زینب چرغان',
          qualityManager: 'فاطمه فرحی',
          safetyCoordinator: 'مهلا عریضی',
        },
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(result);
    }

    saveData(STORAGE_KEYS.QUARTERLY_ASSESSMENTS, list);
    return result;
  },

  async deleteQuarterlySelfAssessment(id: string): Promise<void> {
    let list = await this.getQuarterlySelfAssessments();
    list = list.filter((q) => q.id !== id);
    saveData(STORAGE_KEYS.QUARTERLY_ASSESSMENTS, list);
  },

  // FMEA Reports (آنالیز حالت‌های خطا و اثرات آن)
  async getFmeaReports(): Promise<FmeaReport[]> {
    const data = loadData<FmeaReport[]>(STORAGE_KEYS.FMEA_REPORTS, []);
    if (data.length === 0) {
      const defaultSeed: FmeaReport[] = [
        {
          id: 'fmea-sample-1',
          title: 'آنالیز FMEA فرایند مدیریت و تجویز داروی بیماران بستری',
          departmentOrProcess: 'بخش اورژانس و داروخانه سرپایی/بستری',
          teamLeader: 'دکتر موسوی (دبیر کمیته ایمنی)',
          teamMembers: 'خانم دکتر رضایی، سرپرستار کاظمی، داروساز مسئول',
          assessmentDate: new Date().toLocaleDateString('fa-IR'),
          description: 'شناسایی و ارزیابی پیشگیرانه خطاهای بالقوه دارویی در مراحل نسخه‌نویسی، تلفیق، تحویل و تزریق دارو',
          items: [
            {
              id: 'fm-1',
              processStep: 'اخذ و تلفیق دارویی در بدو بستری',
              potentialFailureMode: 'عدم ثبت دقیق سابقه حساسیت دارویی بیمار در پرونده',
              potentialEffects: 'بروز شوک آنافیلاکسی یا واکنش شدید حساسیت دارویی',
              severity: 9,
              potentialCauses: 'شلوغی اورژانس و عدم پرسش فعالانه از بیمار/همراه',
              occurrence: 4,
              currentControls: 'فرم کاغذی تلفیق دارویی (بدون اجبار در سیستم)',
              detection: 5,
              rpn: 180, // 9 * 4 * 5 = 180
              recommendedActions: 'اجباری کردن فیلد حساسیت دارویی در سامانه HIS قبل از ثبت اولین دستور دارویی',
              responsiblePerson: 'مسئول IT و مسئول تلفیق دارویی - مهلت: ۲ هفته',
              actionTaken: 'فیلد قفل‌شونده در HIS ایجاد گردید.',
              newSeverity: 9,
              newOccurrence: 2,
              newDetection: 2,
              newRpn: 36, // 9 * 2 * 2 = 36
            },
            {
              id: 'fm-2',
              processStep: 'تحویل و تزریق دارو توسط پرستار',
              potentialFailureMode: 'اشتباه در شناسایی بیمار به علت شباهت اسمی',
              potentialEffects: 'تزریق داروی اشتباه به بیمار دیگر و بروز عوارض ناخواسته',
              severity: 8,
              potentialCauses: 'عدم اسکن یا عدم چک چشمی ۲ شناسه دستبند بیمار',
              occurrence: 3,
              currentControls: 'بازرسی‌های دوره‌ای سرپرستار',
              detection: 4,
              rpn: 96, // 8 * 3 * 4 = 96
              recommendedActions: 'اجرای دقیق ۵ موقعیت ایمنی دارو و آموزش شناسایی فعال بیمار',
              responsiblePerson: 'سرپرستار بخش - مهلت: فوری',
              actionTaken: 'کارگاه آموزشی برگزار شد و چک‌لیست پایش روزانه فعال گردید.',
              newSeverity: 8,
              newOccurrence: 1,
              newDetection: 2,
              newRpn: 16,
            },
          ],
          createdAt: new Date().toLocaleDateString('fa-IR'),
        },
      ];
      saveData(STORAGE_KEYS.FMEA_REPORTS, defaultSeed);
      return defaultSeed;
    }
    return data;
  },

  async saveFmeaReport(data: Partial<FmeaReport> & { id?: string }): Promise<FmeaReport> {
    const list = await this.getFmeaReports();
    let result: FmeaReport;

    if (data.id) {
      const idx = list.findIndex((f) => f.id === data.id);
      result = {
        ...(list[idx] || {}),
        ...data,
        id: data.id,
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      } as FmeaReport;
      if (idx !== -1) list[idx] = result;
      else list.push(result);
    } else {
      result = {
        id: `fmea-${Date.now()}`,
        title: data.title || 'آنالیز FMEA جدید',
        departmentOrProcess: data.departmentOrProcess || '',
        teamLeader: data.teamLeader || '',
        teamMembers: data.teamMembers || '',
        assessmentDate: data.assessmentDate || new Date().toLocaleDateString('fa-IR'),
        description: data.description || '',
        items: data.items || [],
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(result);
    }

    saveData(STORAGE_KEYS.FMEA_REPORTS, list);
    return result;
  },

  async deleteFmeaReport(id: string): Promise<void> {
    let list = await this.getFmeaReports();
    list = list.filter((f) => f.id !== id);
    saveData(STORAGE_KEYS.FMEA_REPORTS, list);
  },

  // Staff Members Management (مدیریت پرسنل بخش‌ها)
  async getStaffMembers(): Promise<StaffMember[]> {
    const data = loadData<StaffMember[]>(STORAGE_KEYS.STAFF_MEMBERS, []);
    if (data.length === 0) {
      const initialSeed: StaffMember[] = [
        { id: 'staff-1', firstName: 'رضا', lastName: 'احمدی', fullName: 'رضا احمدی', nationalId: '0012345678', departmentId: 'dept-1', departmentName: 'بخش اورژانس', position: 'پرستار', personnelCode: '98001', phoneNumber: '09121112233', createdAt: '1403/01/10' },
        { id: 'staff-2', firstName: 'مریم', lastName: 'حسینی', fullName: 'مریم حسینی', nationalId: '0023456789', departmentId: 'dept-1', departmentName: 'بخش اورژانس', position: 'سرپرستار', personnelCode: '98002', phoneNumber: '09122223344', createdAt: '1403/01/10' },
        { id: 'staff-3', firstName: 'علی', lastName: 'کاظمی', fullName: 'علی کاظمی', nationalId: '0034567890', departmentId: 'dept-2', departmentName: 'بخش مراقبت‌های ویژه (ICU)', position: 'پرستار ICU', personnelCode: '98003', phoneNumber: '09123334455', createdAt: '1403/01/10' },
        { id: 'staff-4', firstName: 'زهرا', lastName: 'محمدی', fullName: 'زهرا محمدی', nationalId: '0045678901', departmentId: 'dept-3', departmentName: 'بخش جراحی عمومی', position: 'بهیار', personnelCode: '98004', phoneNumber: '09124445566', createdAt: '1403/01/10' },
        { id: 'staff-5', firstName: 'حسین', lastName: 'رضایی', fullName: 'حسین رضایی', nationalId: '0056789012', departmentId: 'dept-4', departmentName: 'بخش داخلی و اطفال', position: 'کمک‌پرستار', personnelCode: '98005', phoneNumber: '09125556677', createdAt: '1403/01/10' },
      ];
      saveData(STORAGE_KEYS.STAFF_MEMBERS, initialSeed);
      return initialSeed;
    }
    return data;
  },

  async getStaffMembersByDepartment(deptIdOrName: string): Promise<StaffMember[]> {
    const all = await this.getStaffMembers();
    if (!deptIdOrName || deptIdOrName === 'all') return all;
    return all.filter(
      (s) =>
        s.departmentId === deptIdOrName ||
        s.departmentName === deptIdOrName ||
        s.departmentName.includes(deptIdOrName) ||
        deptIdOrName.includes(s.departmentName)
    );
  },

  async getStaffMemberByNationalId(nationalId: string): Promise<StaffMember | null> {
    const all = await this.getStaffMembers();
    const cleaned = nationalId.trim();
    if (!cleaned) return null;
    return all.find((s) => s.nationalId.trim() === cleaned) || null;
  },

  async saveStaffMember(data: Partial<StaffMember> & { firstName: string; lastName: string; nationalId: string }): Promise<StaffMember> {
    const list = await this.getStaffMembers();
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    let result: StaffMember;

    if (data.id) {
      const idx = list.findIndex((s) => s.id === data.id);
      result = {
        ...(list[idx] || {}),
        ...data,
        fullName,
        id: data.id,
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      } as StaffMember;
      if (idx !== -1) list[idx] = result;
      else list.push(result);
    } else {
      result = {
        id: `staff-${Date.now()}`,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        fullName,
        nationalId: data.nationalId.trim(),
        departmentId: data.departmentId || 'dept-1',
        departmentName: data.departmentName || 'بخش اورژانس',
        position: data.position || 'پرستار',
        personnelCode: data.personnelCode || '',
        phoneNumber: data.phoneNumber || '',
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      list.push(result);
    }

    saveData(STORAGE_KEYS.STAFF_MEMBERS, list);
    return result;
  },

  async deleteStaffMember(id: string): Promise<void> {
    let list = await this.getStaffMembers();
    list = list.filter((s) => s.id !== id);
    saveData(STORAGE_KEYS.STAFF_MEMBERS, list);
  },
};
