// src/types/index.ts

export interface Task {
  id: string;
  title?: string;
  completed?: boolean;
  date?: Date | string;
  projectId?: string;
  habitId?: string | null;
  dateFinish?: Date | string;
  time?: string | null;
  project?: Project;
  habit?: Habit | null;
  pomodoroSessions?: PomodoroSession[];
  inboxItems?: InboxItem[];
  notes?: Note[];
}

export type InboxItemType =
  | "idea"
  | "task"
  | "note"
  | "study"
  | "finance"
  | "habit"
  | "project"
  | "thought";

export type InboxItemStatus = "unprocessed" | "processed";

export interface InboxItem {
  id: string;
  title: string;
  content?: string | null;
  type: InboxItemType;
  status: InboxItemStatus;
  projectId?: string | null;
  project?: Project | null;
  habitId?: string | null;
  habit?: Habit | null;
  taskId?: string | null;
  task?: Task | null;
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
  projectId?: string | null;
  habitId?: string | null;
  taskId?: string | null;
  noteId?: string | null;
  convertToNote?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  projectId?: string | null;
  project?: Project | null;
  habitId?: string | null;
  habit?: Habit | null;
  taskId?: string | null;
  task?: Task | null;
  inboxItems?: InboxItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NoteCreateInput {
  title: string;
  content: string;
  category?: string;
  projectId?: string | null;
  habitId?: string | null;
  taskId?: string | null;
}

export interface NoteUpdateInput {
  title?: string;
  content?: string;
  category?: string | null;
  projectId?: string | null;
  habitId?: string | null;
  taskId?: string | null;
}

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  focusType: "work" | "study";
  startedAt: Date | string;
  endedAt: Date | string;
  notes?: string | null;
  taskId: string;
  task?: Task;
}

export interface PomodoroSessionCreateInput {
  durationMinutes: number;
  focusType: "work" | "study";
  startedAt: string;
  endedAt: string;
  taskId: string;
  notes?: string;
}

export interface PomodoroSummaryItem {
  id: string;
  title: string;
  minutes: number;
}

export interface PomodoroDashboardResponse {
  sessions: PomodoroSession[];
  totalMinutes: number;
  workMinutes: number;
  studyMinutes: number;
  byProject: PomodoroSummaryItem[];
  byHabit: PomodoroSummaryItem[];
}

export interface Habit {
  id: string;
  title: string;
  projectId: string;
  streak: number;
  history: string[];
  frequency: string;
  reminderTime?: string | null;
  tasks?: Task[];
  project?: Project; 
  inboxItems?: InboxItem[];
  notes?: Note[];
  weeklyPlanSlotHabits?: WeeklyPlanSlotHabit[];
}

export interface WeeklyPlanSlotHabit {
  id: string;
  slotId: string;
  habitId: string;
  habit?: Habit;
  createdAt: Date | string;
}

export interface WeeklyPlanSlotTask {
  id: string;
  slotId: string;
  taskId: string;
  task?: Task;
  createdAt: Date | string;
}

export interface WeeklyPlanSlot {
  id: string;
  dayIndex: number;
  hour: number;
  boardId: string;
  habits: WeeklyPlanSlotHabit[];
  tasks?: WeeklyPlanSlotTask[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudySubject {
  id: string;
  name: string;
  color?: string | null;
  plannedHoursPerWeek: number;
  notes?: string | null;
  scheduleBlocks?: StudyScheduleBlock[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudyScheduleBlock {
  id: string;
  dayIndex: number;
  hour: number;
  subjectId: string;
  subject?: StudySubject;
  createdAt: Date | string;
}

export interface StudySubjectInput {
  name: string;
  color?: string | null;
  plannedHoursPerWeek?: number;
  notes?: string | null;
}

export interface StudyScheduleInput {
  dayIndex: number;
  hour: number;
  subjectIds: string[];
}

export interface WeeklyPlanBoard {
  id: string | null;
  weekStartKey: string;
  slots: WeeklyPlanSlot[];
}

export interface WeeklyPlanSlotInput {
  weekStartKey: string;
  dayIndex: number;
  hour: number;
  habitIds: string[];
  taskIds?: string[];
}

export interface Project {
  id: string;
  title: string;  
  color: string | null;
  userId: number;
  lastActivityDate?: Date | string;
  streakGlobal?:number
  dailyStreakTarget?: number;
  createdAt: Date | string;
  habits?: Habit[]; 
  tasks?: Task[]; 
  inboxItems?: InboxItem[];
  notes?: Note[];
}
export interface ProjectRequest {
  title: string;
  color: string | null;
  userId: number;
  createdAt: Date | string;
  lastActivityDate?: Date | string;
  streakGlobal?:number
  dailyStreakTarget?: number;
  habits?: Habit[]; 
  tasks?: Task[]; 
}

export interface ProjectCreateInput {
  title?: string;
  color?: string | null;
  dailyStreakTarget?: number;
}

export interface HabitCreateInput {
  title: string;
  projectId?: string;
  frequency?: string;
  history?: string[];
  reminderTime?: string;
  streak?: number;
}

export interface TaskCreateInput {
  title: string;
  projectId: string;
  habitId: string;
  date?: string;
  time?: string;
}

export type ProjectsResponse = Project[];

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
