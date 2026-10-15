export type InboxItemType = "idea" | "note" | "study" | "finance" | "thought";
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

export interface InboxItemCreateInput { title: string; content?: string; type?: InboxItemType; }
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
export interface NoteCreateInput { title: string; content: string; category?: string; }
export interface NoteUpdateInput { title?: string; content?: string; category?: string | null; }

export interface PomodoroSubject { id: string; name: string; color?: string | null; }
export interface PomodoroSession {
  id: string;
  title?: string | null;
  durationMinutes: number;
  focusType: "study";
  startedAt: Date | string;
  endedAt: Date | string;
  notes?: string | null;
  subjectId?: string | null;
  subject?: PomodoroSubject | null;
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
export interface PomodoroSessionUpdateInput { subjectId: string; title: string; }
export interface PomodoroSummaryItem { id: string; title: string; minutes: number; color?: string | null; }
export interface PomodoroDashboardResponse {
  sessions: PomodoroSession[];
  totalMinutes: number;
  studyMinutes: number;
  bySubject: PomodoroSummaryItem[];
}

export type LifeHabitKind = "positive" | "negative" | "quantitative";
export type LifeHabitInterval = "daily" | "weekly" | "monthly" | "weekdays" | "everyXDays";
export type LifeHabitScheduleUnit = "days" | "weeks" | "months";
export type LifeHabitQuantKind = "generic" | "water" | "reading" | "time";
export interface LifeHabitSubstep { id: string; title: string; }
export interface LifeHabitCompletion { count: number; steps: string[]; }
export interface LifeHabit {
  id: string;
  title: string;
  kind: LifeHabitKind;
  color?: string | null;
  icon: string;
  category?: string | null;
  notes?: string | null;
  position: number;
  perDayTarget: number;
  interval: LifeHabitInterval;
  targetFrequency: number;
  scheduleWeekdays: number[];
  scheduleEvery: number;
  scheduleUnit: LifeHabitScheduleUnit;
  scheduleStart?: Date | string | null;
  unitLabel?: string | null;
  incrementAmount: number;
  quantKind: LifeHabitQuantKind;
  dailyCost: number;
  difficulty: number;
  startMinute: number;
  durationMinutes: number;
  focusMinutes: number;
  focusBreakMinutes: number;
  focusOnly: boolean;
  tracking: boolean;
  anyAmount: boolean;
  anySteps: boolean;
  substeps: LifeHabitSubstep[];
  reminders: unknown[];
  vacations: Array<{ start: string; end?: string | null }>;
  restDays: number[];
  completions: Record<string, LifeHabitCompletion>;
  archivedAt?: Date | string | null;
  // Contrato legado, removivel apos a migracao do Android.
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
  icon?: string;
  category?: string | null;
  notes?: string | null;
  perDayTarget?: number;
  interval?: LifeHabitInterval;
  targetFrequency?: number;
  scheduleWeekdays?: number[];
  scheduleEvery?: number;
  scheduleUnit?: LifeHabitScheduleUnit;
  scheduleStart?: string | null;
  unitLabel?: string | null;
  incrementAmount?: number;
  quantKind?: LifeHabitQuantKind;
  dailyCost?: number;
  difficulty?: number;
  startMinute?: number;
  durationMinutes?: number;
  restDays?: number[];
  focusMinutes?: number;
  focusBreakMinutes?: number;
  focusOnly?: boolean;
  anyAmount?: boolean;
  anySteps?: boolean;
  substeps?: LifeHabitSubstep[];
}
export interface LifeHabitUpdateInput {
  title?: string;
  kind?: LifeHabitKind;
  color?: string | null;
  icon?: string;
  category?: string | null;
  notes?: string | null;
  perDayTarget?: number;
  interval?: LifeHabitInterval;
  targetFrequency?: number;
  scheduleWeekdays?: number[];
  scheduleEvery?: number;
  scheduleUnit?: LifeHabitScheduleUnit;
  scheduleStart?: string | null;
  unitLabel?: string | null;
  incrementAmount?: number;
  quantKind?: LifeHabitQuantKind;
  dailyCost?: number;
  difficulty?: number;
  startMinute?: number;
  durationMinutes?: number;
  restDays?: number[];
  focusMinutes?: number;
  focusBreakMinutes?: number;
  focusOnly?: boolean;
  anyAmount?: boolean;
  anySteps?: boolean;
  substeps?: LifeHabitSubstep[];
  archivedAt?: string | null;
}
export interface LifeHabitActionInput {
  action: "toggle-checkin" | "reset-bad" | "set-amount" | "increment" | "toggle-step";
  amount?: number;
  dayKey?: string;
  stepId?: string;
}
