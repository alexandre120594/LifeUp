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
export interface LifeHabitActionInput { action: "toggle-checkin" | "reset-bad"; dayKey?: string; }
