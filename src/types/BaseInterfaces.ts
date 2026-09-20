export type InboxItemType =
  | "idea"
  | "note"
  | "study"
  | "finance"
  | "thought";

export type InboxItemStatus = "unprocessed" | "processed";

export interface InboxItem {
  id: string;
  title: string;
  content?: string | null;
  type: InboxItemType;
  status: InboxItemStatus;
  noteId?: string | null;
  note?: Note | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface InboxItemCreateInput {
  title: string;
  content?: string;
  type?: InboxItemType;
}

export interface InboxItemUpdateInput {
  title?: string;
  content?: string | null;
  type?: InboxItemType;
  status?: InboxItemStatus;
  noteId?: string | null;
  convertToNote?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  inboxItems?: InboxItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NoteCreateInput {
  title: string;
  content: string;
  category?: string;
}

export interface NoteUpdateInput {
  title?: string;
  content?: string;
  category?: string | null;
}

export interface PomodoroSession {
  id: string;
  title?: string | null;
  durationMinutes: number;
  focusType: "study";
  startedAt: Date | string;
  endedAt: Date | string;
  notes?: string | null;
  subjectId?: string | null;
  subject?: StudySubject | null;
}

export interface PomodoroSessionCreateInput {
  title: string;
  durationMinutes: number;
  focusType?: "study";
  startedAt: string;
  endedAt: string;
  subjectId: string;
  notes?: string;
}

export interface PomodoroSessionUpdateInput {
  subjectId: string;
  title: string;
}

export interface PomodoroSummaryItem {
  id: string;
  title: string;
  minutes: number;
  color?: string | null;
}

export interface PomodoroDashboardResponse {
  sessions: PomodoroSession[];
  totalMinutes: number;
  studyMinutes: number;
  bySubject: PomodoroSummaryItem[];
}

export interface StudySubject {
  id: string;
  name: string;
  color?: string | null;
  plannedHoursPerWeek: number;
  notes?: string | null;
  scheduleBlocks?: StudyScheduleBlock[];
  planBlocks?: StudyPlanBlock[];
  mistakes?: StudyMistake[];
  sessions?: StudySession[];
  questionPractices?: StudyQuestionPractice[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudySession {
  id: string;
  startedAt: Date | string;
  endedAt: Date | string;
  durationMinutes: number;
  notes?: string | null;
  subjectId: string;
  subject?: StudySubject;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudySessionCreateInput {
  startedAt: string;
  endedAt: string;
  notes?: string | null;
  subjectId: string;
}

export type StudySessionUpdateInput = StudySessionCreateInput;

export interface StudyQuestionPractice {
  id: string;
  practiceDate: Date | string;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  notes?: string | null;
  subjectId: string;
  subject?: StudySubject;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudyQuestionPracticeCreateInput {
  practiceDate: string;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  notes?: string | null;
  subjectId: string;
}

export type StudyQuestionPracticeUpdateInput = StudyQuestionPracticeCreateInput;

export type StudyMistakeStatus = "unresolved" | "reviewed" | "mastered";
export type StudyMistakeResult =
  | "correct"
  | "wrong"
  | "correct_with_doubt";
export type StudyMistakeCorrectionStatus = "pending" | "completed";
export type StudyMistakeErrorLevel = "minor" | "moderate" | "severe";

export interface StudyMistake {
  id: string;
  question: string;
  myAnswer: string;
  correctAnswer: string;
  errorType: string;
  correctRule: string;
  examBoard?: string | null;
  result?: StudyMistakeResult | null;
  initialTopic?: string | null;
  comment?: string | null;
  correctionStatus?: StudyMistakeCorrectionStatus | null;
  generalSubject?: string | null;
  topic?: string | null;
  microTopic?: string | null;
  errorReason?: string | null;
  chargedDetail?: string | null;
  trap?: string | null;
  memorizationPhrase?: string | null;
  correctiveAction?: string | null;
  errorLevel?: StudyMistakeErrorLevel | null;
  trapWord?: string | null;
  reviewDate?: Date | string | null;
  status: StudyMistakeStatus;
  subjectId: string;
  subject?: StudySubject;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudyMistakeCreateInput {
  question: string;
  myAnswer?: string;
  correctAnswer?: string;
  errorType?: string;
  correctRule?: string;
  examBoard?: string | null;
  result?: StudyMistakeResult;
  initialTopic?: string | null;
  comment?: string | null;
  trapWord?: string | null;
  reviewDate?: string | null;
  status?: StudyMistakeStatus;
  subjectId: string;
}

export interface StudyMistakeUpdateInput {
  question?: string;
  myAnswer?: string;
  correctAnswer?: string;
  errorType?: string;
  correctRule?: string;
  examBoard?: string | null;
  result?: StudyMistakeResult;
  initialTopic?: string | null;
  comment?: string | null;
  correctionStatus?: StudyMistakeCorrectionStatus;
  generalSubject?: string | null;
  topic?: string | null;
  microTopic?: string | null;
  errorReason?: string | null;
  chargedDetail?: string | null;
  trap?: string | null;
  memorizationPhrase?: string | null;
  correctiveAction?: string | null;
  errorLevel?: StudyMistakeErrorLevel | null;
  trapWord?: string | null;
  reviewDate?: string | null;
  status?: StudyMistakeStatus;
  subjectId?: string;
}

export interface StudyScheduleBlock {
  id: string;
  dayIndex: number;
  hour: number;
  subjectId: string;
  subject?: StudySubject;
  createdAt: Date | string;
}

export interface StudyPlanBlock {
  id: string;
  dayIndex: number;
  startTime: string;
  durationMinutes: number;
  notes?: string | null;
  boardId: string;
  subjectId: string;
  subject?: StudySubject;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudyPlanBoard {
  id: string | null;
  weekStartKey: string;
  blocks: StudyPlanBlock[];
}

export interface StudySubjectInput {
  name: string;
  color?: string | null;
  plannedHoursPerWeek?: number;
  notes?: string | null;
}

export interface StudyPlanBlockInput {
  weekStartKey: string;
  dayIndex: number;
  startTime: string;
  durationMinutes: number;
  subjectId: string;
  notes?: string | null;
}

export interface StudyScheduleInput {
  dayIndex: number;
  hour: number;
  subjectIds: string[];
}

export type LifeHabitKind = "good" | "bad";

export interface LifeHabit {
  id: string;
  title: string;
  kind: LifeHabitKind;
  color?: string | null;
  notes?: string | null;
  targetDays: number;
  reward?: string | null;
  checkins: string[];
  badEvents: string[];
  lastBadAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LifeHabitCreateInput {
  title: string;
  kind: LifeHabitKind;
  color?: string | null;
  notes?: string | null;
  targetDays?: number;
  reward?: string | null;
}

export interface LifeHabitUpdateInput {
  title?: string;
  kind?: LifeHabitKind;
  color?: string | null;
  notes?: string | null;
  targetDays?: number;
  reward?: string | null;
}

export interface LifeHabitActionInput {
  action: "toggle-checkin" | "reset-bad";
  dayKey?: string;
}

export type FinanceRecordType = "income" | "expense";

export interface FinancialCategory {
  id: string;
  name: string;
  type: FinanceRecordType;
  color?: string | null;
  icon?: string | null;
  isDefault: boolean;
}

export interface FinancialTransaction {
  id: string;
  title: string;
  amount: number | string;
  type: FinanceRecordType;
  date: Date | string;
  notes?: string | null;
  categoryId: string;
  category?: FinancialCategory;
}

export interface FinancePaymentInput {
  date?: string;
}

export interface Budget {
  id: string;
  title: string;
  amount: number | string;
  month: string;
  categoryId: string;
  category?: FinancialCategory;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number | string;
  dueDay: number;
  frequency: string;
  isActive: boolean;
  categoryId: string;
  category?: FinancialCategory;
}

export interface PlannedExpense {
  id: string;
  title: string;
  amount: number | string;
  type: FinanceRecordType;
  plannedDate: Date | string;
  isPaid: boolean;
  notes?: string | null;
  categoryId: string;
  category?: FinancialCategory;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number | string;
  currentAmount: number | string;
  targetDate?: Date | string | null;
  isCompleted: boolean;
  contributions?: SavingsContribution[];
}

export interface SavingsContribution {
  id: string;
  amount: number | string;
  date: Date | string;
  isLegacyBalance?: boolean;
  notes?: string | null;
  goalId: string;
}

export interface FinanceInsight {
  title: string;
  description: string;
  tone: "good" | "warning" | "neutral";
}

export interface FinanceSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  upcomingBillsTotal: number;
  savingsProgress: number;
  budgetUsedPercent: number;
  insights: FinanceInsight[];
}

export interface FinanceDashboardResponse {
  categories: FinancialCategory[];
  transactions: FinancialTransaction[];
  budgets: Budget[];
  recurringBills: RecurringBill[];
  plannedExpenses: PlannedExpense[];
  savingsGoals: SavingsGoal[];
  summary: FinanceSummary;
}

export interface AccountSpendImport {
  id: string;
  name: string;
  month: string;
  sourceType: "extrato" | "fatura";
  rowCount: number;
  createdAt: Date | string;
}

export interface AccountSpendEntry {
  id: string;
  date: Date | string;
  amount: number | string;
  sourceType: "extrato" | "fatura";
  type: string;
  description: string;
  importId: string;
  import?: AccountSpendImport;
}

export interface AccountSpendTrackerResponse {
  entries: AccountSpendEntry[];
  imports: AccountSpendImport[];
  months: string[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    daily: Array<{
      day: string;
      expense: number;
      income: number;
    }>;
    month: string | null;
    netTotal: number;
    rowCount: number;
    importCount: number;
    totalExpense: number;
    totalIncome: number;
  };
}

export interface AccountSpendImportResponse {
  import: AccountSpendImport;
  insertedRows: number;
  month: string;
  sourceType: "extrato" | "fatura";
}

export interface FinancialCategoryCreateInput {
  name: string;
  type: FinanceRecordType;
  color?: string;
}

export interface FinancialTransactionCreateInput {
  title: string;
  amount: number;
  type: FinanceRecordType;
  date: string;
  categoryId: string;
  notes?: string;
}

export interface BudgetCreateInput {
  title: string;
  amount: number;
  month: string;
  categoryId: string;
}

export interface RecurringBillCreateInput {
  title: string;
  amount: number;
  dueDay: number;
  categoryId: string;
}

export interface PlannedExpenseCreateInput {
  title: string;
  amount: number;
  type: FinanceRecordType;
  plannedDate: string;
  categoryId: string;
  isPaid?: boolean;
  notes?: string;
}

export interface SavingsGoalCreateInput {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
}

export interface SavingsContributionCreateInput {
  amount: number;
  date?: string;
  notes?: string;
}
