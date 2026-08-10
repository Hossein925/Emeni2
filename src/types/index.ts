export type UserRole = 'super_admin' | 'department_manager' | 'public';

export interface User {
  id: string;
  userCode: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
}

export interface Department {
  id: string;
  name: string;
  managerName: string;
  managerCode: string;
  managerPassword?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string;
  departmentId: string;
  departmentName: string;
  position?: string;
  personnelCode?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SafetyIndicatorDefinition {
  id: string;
  title: string;
  targetValue?: number;
  unit: string;
  description?: string;
}

export interface SafetyIndicatorRecord {
  id: string;
  departmentId: string;
  departmentName: string;
  indicatorId: string;
  indicatorTitle: string;
  value: number;
  year: number;
  month: number;
  monthName: string;
  createdAt: string;
  notes?: string;
}

export interface StaffEvaluation {
  id: string;
  staffName: string;
  nationalId: string;
  departmentId: string;
  departmentName: string;
  checklistId: string;
  checklistTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  year: number;
  month: number;
  monthName: string;
  correctiveAction: string;
  createdAt: string;
  evaluatedBy: string;
  answers: Record<string, any>;
}

export interface MeetingResolution {
  id: string;
  meetingId?: string;
  meetingSubject?: string;
  text: string;
  weight: number; // 1 to 5
  priority: 'high' | 'medium' | 'low';
  isPublic: boolean; // Show on main public page
  responsiblePerson: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface SafetyMeeting {
  id: string;
  subject: string;
  secretary: string;
  description: string;
  meetingDate: string;
  attendees: string[];
  resolutions: MeetingResolution[];
  followUpPerson: string;
  deadline: string;
  createdAt: string;
}

export interface ChecklistField {
  id: string;
  label: string;
  type: 'mc' | 'yesno' | 'rating' | 'text';
  options?: string[];
  required?: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  category: 'head_nurse' | 'staff_eval' | 'error_report';
  description?: string;
  fields: ChecklistField[];
  createdAt: string;
}

export interface ChecklistResponse {
  id: string;
  checklistId: string;
  checklistTitle: string;
  departmentId?: string;
  departmentName?: string;
  submittedBy: string;
  submittedAt: string;
  answers: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  reporterName: string;
  departmentId: string;
  departmentName: string;
  reportDate: string;
  answers: Record<string, any>;
  status: 'received' | 'investigating' | 'resolved';
  createdAt: string;
}

export interface EducationCategory {
  id: string;
  title: string;
  description?: string;
  color?: string;
  iconName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationTopic {
  id: string;
  categoryId: string;
  categoryTitle?: string;
  title: string;
  summary?: string;
  color?: string;
  iconName?: string;
  content: string;
  readingTime?: string;
  updatedAt: string;
  createdAt?: string;
}

export interface SafetyScenario {
  id: string;
  title: string;
  scenarioDate: string;
  summary: string;
  fullContent: string;
  category?: string;
  lessonsLearned?: string;
}

export interface SafetyVisit {
  id: string;
  departmentId: string;
  departmentName: string;
  visitDate: string;
  teamMembers: string[];
  observations: string;
  resolutions: string;
  followUpPerson: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string; // Rich Text HTML
  isActive: boolean;
  priority: 'high' | 'normal';
  createdAt: string;
  speed?: number; // scroll duration in seconds
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'multiple_choice' | 'true_false' | 'descriptive';
  options?: string[];
  correctOptionIndex?: number;
  shuffleOptions?: boolean;
  points?: number;
}

export interface QuizExam {
  id: string;
  title: string;
  targetGroup: string;
  description?: string;
  durationMinutes?: number;
  displayQuestionCount: number;
  questions: QuizQuestion[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface QuizSubmission {
  id: string;
  examId: string;
  examTitle: string;
  staffName: string;
  nationalId: string;
  departmentId: string;
  departmentName: string;
  answers: Record<string, any>;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
}

export interface RcaReport {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;

  // Step 1: تشکیل تیم و تعریف مشکل
  teamMembers: string;
  eventDescription: string;
  eventDate: string;
  eventLocation: string;
  eventTypeOrCode: string;

  // Step 2-A: جمع‌آوری اطلاعات - مصاحبه
  intervieweeName: string;
  interviewerName: string;
  interviewDates: string;
  avgInterviewTime: string;
  interviewCount: string;
  reportsCount: string;

  // Step 2-A: سایر مستندات
  documentsDocs: string;
  equipmentDocs: string;
  siteVisitDocs: string;

  // Step 2-B: نگاشت اطلاعات
  informationMapping: string;

  // Step 3: شناسایی مسئله و مشکل
  problemIdentificationMethod: string;
  systemProblemsSDP: string;
  contributorProblemsCDP: string;

  // Step 4: تحلیل اطلاعات (Fishbone Diagram - 6 Contributory Factors)
  patientFactors?: string;
  humanFactors: string;
  processFactors: string;
  teamFactors?: string;
  environmentalFactors: string;
  equipmentFactors: string;
  organizationalFactors?: string;

  // Step 5: طراحی اقدامات / بهبود کیفیت
  rootCausesAndActions: Array<{
    id: string;
    rootCause: string;
    correctiveAction: string;
  }>;

  // Step 6: نمونه برنامه اصلاحی
  correctivePlans: Array<{
    id: string;
    action: string;
    metric: string;
    responsible: string;
    startDate: string;
    endDate: string;
    progressReport: string;
  }>;

  // Step 6: نمونه برنامه عملیاتی / بهبود کیفیت
  operationalPlans: Array<{
    id: string;
    programTitle: string;
    metric: string;
    activity: string;
    responsible: string;
    startDate: string;
    endDate: string;
    targetMetric: string;
    estimatedCost: string;
    monthlyProgress: Record<string, number>;
    goalRealization: string;
  }>;

  // Step 7: پایش و ممیزی نتایج
  auditQ1: string;
  auditQ2: string;
  auditQ3: string;
  auditQ4: string;
}

export interface QuarterlySelfAssessment {
  id: string;
  title: string;
  year: number;
  season: string; // 'بهار' | 'تابستان' | 'پاییز' | 'زمستان'
  hospitalName: string;
  approvedBeds: string;
  activeBeds: string;
  bedOccupancyRate: string;
  avgDailyInpatients: string;
  annualOutpatientVisits: string;
  annualEmergencyL13: string;
  annualEmergencyL45: string;
  scores: Record<string, number>; // Standard code (e.g. 'A.1.1.1') -> 0 | 0.5 | 1
  totalScore: number;
  maxScore: number;
  percentage: number;
  evaluationTeam: string;
  evaluatorNames: {
    safetyOfficerAndPresident?: string;
    internalManager?: string;
    metron?: string;
    qualityManager?: string;
    safetyCoordinator?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface FmeaFailureModeItem {
  id: string;
  processStep: string; // گام / مرحله فرایند
  potentialFailureMode: string; // حالت خطای بالقوه
  potentialEffects: string; // اثرات بالقوه خطا
  severity: number; // شدت اثر (S: 1-10)
  potentialCauses: string; // علل بالقوه خطا
  occurrence: number; // احتمال وقوع (O: 1-10)
  currentControls: string; // کنترلهای جاری
  detection: number; // قابلیت کشف (D: 1-10)
  rpn: number; // نمره اولویت ریسک (S * O * D)
  recommendedActions: string; // اقدامات پیشنهادی / اصلاحی
  responsiblePerson: string; // مسئول اجرا و مهلت
  actionTaken?: string; // اقدامات انجام شده
  newSeverity?: number; // S جدید
  newOccurrence?: number; // O جدید
  newDetection?: number; // D جدید
  newRpn?: number; // RPN جدید
}

export interface FmeaReport {
  id: string;
  title: string; // عنوان آنالیز FMEA
  departmentOrProcess: string; // فرایند / بخش مورد بررسی
  teamLeader: string; // رهبر / دبیر تیم FMEA
  teamMembers: string; // اعضای تیم
  assessmentDate: string; // تاریخ آنالیز
  description?: string; // اهداف و شرح فرایند
  items: FmeaFailureModeItem[];
  createdAt: string;
  updatedAt?: string;
}

