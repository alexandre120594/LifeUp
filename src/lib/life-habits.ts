import type { LifeHabit, LifeHabitCompletion, LifeHabitKind } from "@/types/BaseInterfaces";

const DAY_IN_MS = 86_400_000;
const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type HabitDay = { amount: number; dayKey: string; isCompleted: boolean; isPaused: boolean; isRelapse: boolean; isScheduled: boolean; isToday: boolean; label: string };
export type HabitMetrics = { bestStreak: number; checkedToday: boolean; completionRate: number; consistency: number; currentStreak: number; moneySaved: number; progress: number; todayAmount: number; totalCompletions: number };
export type HabitWeekSummary = { availableDays: number; completedDays: number; label: string; rate: number; relapseCount: number };

export function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayKey() { return getDayKey(new Date()); }

export function parseDayKey(dayKey: string) {
  if (!DAY_KEY_PATTERN.test(dayKey)) return new Date(Number.NaN);
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function shiftDayKey(dayKey: string, days: number) {
  const date = parseDayKey(dayKey);
  date.setDate(date.getDate() + days);
  return getDayKey(date);
}

export function normalizeHabitKind(kind: string): LifeHabitKind {
  if (kind === "bad") return "negative";
  if (kind === "good") return "positive";
  return kind === "negative" || kind === "quantitative" ? kind : "positive";
}

export function getHabitCompletions(habit: LifeHabit) {
  if (habit.completions && Object.keys(habit.completions).length) return habit.completions;
  const completions: Record<string, LifeHabitCompletion> = {};
  const legacyDays = normalizeHabitKind(habit.kind) === "negative" ? habit.badEvents ?? [] : habit.checkins ?? [];
  for (const dayKey of legacyDays) completions[dayKey] = { count: 1, steps: [] };
  if (normalizeHabitKind(habit.kind) === "negative" && habit.lastBadAt) {
    completions[getDayKey(new Date(habit.lastBadAt))] = { count: 1, steps: [] };
  }
  return completions;
}

export function isHabitPausedOn(habit: LifeHabit, dayKey: string) {
  const weekday = parseDayKey(dayKey).getDay() || 7;
  if (habit.restDays.includes(weekday)) return true;
  return habit.vacations.some(({ end, start }) => dayKey >= start && dayKey <= (end ?? getTodayKey()));
}

export function isHabitScheduledOn(habit: LifeHabit, dayKey: string) {
  const date = parseDayKey(dayKey);
  const weekday = date.getDay() || 7;
  if (habit.interval === "weekdays") return habit.scheduleWeekdays.includes(weekday);
  if (habit.interval !== "everyXDays") return true;

  const startKey = habit.scheduleStart ? getDayKey(new Date(habit.scheduleStart)) : getDayKey(new Date(habit.createdAt));
  if (dayKey < startKey) return false;
  const start = parseDayKey(startKey);
  if (habit.scheduleUnit === "months") {
    const months = (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return months % Math.max(1, habit.scheduleEvery) === 0 && date.getDate() === Math.min(start.getDate(), lastDay);
  }
  const span = Math.max(1, habit.scheduleEvery) * (habit.scheduleUnit === "weeks" ? 7 : 1);
  return Math.round((date.getTime() - start.getTime()) / DAY_IN_MS) % span === 0;
}

function completionReachesTarget(habit: LifeHabit, entry?: LifeHabitCompletion) {
  if (!entry) return false;
  if (habit.substeps.length) {
    const completed = new Set(entry.steps);
    return habit.anySteps ? habit.substeps.some((step) => completed.has(step.id)) : habit.substeps.every((step) => completed.has(step.id));
  }
  if (normalizeHabitKind(habit.kind) === "quantitative" && habit.anyAmount) return entry.count > 0;
  return entry.count >= Math.max(0.0001, habit.perDayTarget);
}

export function isHabitCompletedOn(habit: LifeHabit, dayKey: string) {
  if (dayKey > getTodayKey()) return false;
  const entry = getHabitCompletions(habit)[dayKey];
  if (normalizeHabitKind(habit.kind) === "negative") return dayKey >= getHabitStartKey(habit) && !entry;
  return completionReachesTarget(habit, entry);
}

export function getHabitStartKey(habit: LifeHabit) {
  const keys = Object.keys(getHabitCompletions(habit)).sort();
  const created = getDayKey(new Date(habit.createdAt));
  return keys[0] && keys[0] < created ? keys[0] : created;
}

function isNeutral(habit: LifeHabit, dayKey: string) { return isHabitPausedOn(habit, dayKey) || !isHabitScheduledOn(habit, dayKey); }

function periodKey(dayKey: string, interval: LifeHabit["interval"]) {
  const date = parseDayKey(dayKey);
  if (interval === "monthly") return `${date.getFullYear()}-${date.getMonth() + 1}`;
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return getDayKey(monday);
}

function getPeriodRuns(habit: LifeHabit, todayKey: string) {
  const counts = new Map<string, number>();
  const order: string[] = [];
  let cursor = getHabitStartKey(habit);
  while (cursor <= todayKey) {
    const key = periodKey(cursor, habit.interval);
    if (!counts.has(key)) { counts.set(key, 0); order.push(key); }
    if (isHabitCompletedOn(habit, cursor)) counts.set(key, (counts.get(key) ?? 0) + 1);
    cursor = shiftDayKey(cursor, 1);
  }
  let best = 0;
  let run = 0;
  for (const key of order) {
    run = (counts.get(key) ?? 0) >= habit.targetFrequency ? run + 1 : 0;
    best = Math.max(best, run);
  }
  let current = 0;
  let index = order.length - 1;
  if (index >= 0 && (counts.get(order[index]) ?? 0) < habit.targetFrequency) index -= 1;
  while (index >= 0 && (counts.get(order[index]) ?? 0) >= habit.targetFrequency) {
    current += 1;
    index -= 1;
  }
  return { best, current };
}

export function getCurrentStreak(habit: LifeHabit, todayKey = getTodayKey()) {
  if (habit.interval === "weekly" || habit.interval === "monthly") return getPeriodRuns(habit, todayKey).current;
  const startKey = getHabitStartKey(habit);
  let cursor = todayKey;
  let streak = 0;
  while (cursor >= startKey) {
    if (isNeutral(habit, cursor)) { cursor = shiftDayKey(cursor, -1); continue; }
    if (isHabitCompletedOn(habit, cursor)) streak += 1;
    else if (cursor !== todayKey) break;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}

export function getBestStreak(habit: LifeHabit, todayKey = getTodayKey()) {
  if (habit.interval === "weekly" || habit.interval === "monthly") return getPeriodRuns(habit, todayKey).best;
  let cursor = getHabitStartKey(habit);
  let best = 0;
  let run = 0;
  while (cursor <= todayKey) {
    if (!isNeutral(habit, cursor)) {
      run = isHabitCompletedOn(habit, cursor) ? run + 1 : 0;
      best = Math.max(best, run);
    }
    cursor = shiftDayKey(cursor, 1);
  }
  return best;
}

export function getHabitDays(habit: LifeHabit, count: number, todayKey = getTodayKey()): HabitDay[] {
  const completions = getHabitCompletions(habit);
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "narrow" });
  return Array.from({ length: count }, (_, index) => {
    const dayKey = shiftDayKey(todayKey, index - count + 1);
    const entry = completions[dayKey];
    return { amount: entry?.count ?? 0, dayKey, isCompleted: isHabitCompletedOn(habit, dayKey), isPaused: isHabitPausedOn(habit, dayKey), isRelapse: normalizeHabitKind(habit.kind) === "negative" && Boolean(entry), isScheduled: isHabitScheduledOn(habit, dayKey), isToday: dayKey === todayKey, label: formatter.format(parseDayKey(dayKey)).toUpperCase() };
  });
}

export function getLastSevenDays(habit: LifeHabit, todayKey = getTodayKey()) { return getHabitDays(habit, 7, todayKey); }

export function getCompletionRate(habit: LifeHabit, days = 28, todayKey = getTodayKey()) {
  const startKey = getHabitStartKey(habit);
  let available = 0;
  let completed = 0;
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayKey = shiftDayKey(todayKey, -offset);
    if (dayKey < startKey || isNeutral(habit, dayKey)) continue;
    available += 1;
    if (isHabitCompletedOn(habit, dayKey)) completed += 1;
  }
  return available ? Math.round((completed / available) * 100) : 0;
}

export function getConsistency(habit: LifeHabit, todayKey = getTodayKey()) {
  const startKey = getHabitStartKey(habit);
  let score = 0;
  let norm = 0;
  for (let offset = 0; offset < 90; offset += 1) {
    const dayKey = shiftDayKey(todayKey, -offset);
    if (dayKey < startKey || isNeutral(habit, dayKey)) continue;
    const weight = Math.pow(0.5, offset / 12);
    norm += weight;
    const entry = getHabitCompletions(habit)[dayKey];
    const value = normalizeHabitKind(habit.kind) === "negative" ? entry ? 0 : 1 : Math.min(1, (entry?.count ?? 0) / Math.max(1, habit.substeps.length || habit.perDayTarget));
    score += weight * value;
  }
  return norm ? Math.round((score / norm) * 100) : 0;
}

export function getHabitMetrics(habit: LifeHabit, todayKey = getTodayKey()): HabitMetrics {
  const completions = getHabitCompletions(habit);
  const todayAmount = completions[todayKey]?.count ?? 0;
  const kind = normalizeHabitKind(habit.kind);
  const daysSinceStart = Math.max(1, Math.floor((parseDayKey(todayKey).getTime() - parseDayKey(getHabitStartKey(habit)).getTime()) / DAY_IN_MS) + 1);
  return { bestStreak: getBestStreak(habit, todayKey), checkedToday: isHabitCompletedOn(habit, todayKey), completionRate: getCompletionRate(habit, 28, todayKey), consistency: getConsistency(habit, todayKey), currentStreak: getCurrentStreak(habit, todayKey), moneySaved: kind === "negative" ? Math.max(0, daysSinceStart - Object.keys(completions).length) * habit.dailyCost : 0, progress: kind === "quantitative" ? Math.min(100, Math.round((todayAmount / Math.max(0.0001, habit.perDayTarget)) * 100)) : isHabitCompletedOn(habit, todayKey) ? 100 : 0, todayAmount, totalCompletions: kind === "negative" ? Object.keys(completions).length : Object.keys(completions).filter((key) => isHabitCompletedOn(habit, key)).length };
}

export function getHabitWeekSummaries(habit: LifeHabit, todayKey = getTodayKey()): HabitWeekSummary[] {
  const days = getHabitDays(habit, 28, todayKey);
  const startKey = getHabitStartKey(habit);
  return Array.from({ length: 4 }, (_, index) => {
    const weekDays = days.slice(index * 7, index * 7 + 7).filter((day) => day.dayKey >= startKey && day.isScheduled && !day.isPaused);
    const completedDays = weekDays.filter((day) => day.isCompleted).length;
    const weeksAgo = 3 - index;
    return { availableDays: weekDays.length, completedDays, label: weeksAgo === 0 ? "Esta semana" : weeksAgo === 1 ? "Semana anterior" : `${weeksAgo} semanas atrás`, rate: weekDays.length ? Math.round((completedDays / weekDays.length) * 100) : 0, relapseCount: weekDays.filter((day) => day.isRelapse).length };
  });
}

export function getScheduleLabel(habit: LifeHabit) {
  if (habit.interval === "daily") return "Todos os dias";
  if (habit.interval === "weekly") return `${habit.targetFrequency}× por semana`;
  if (habit.interval === "monthly") return `${habit.targetFrequency}× por mês`;
  if (habit.interval === "weekdays") return habit.scheduleWeekdays.map((day) => ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"][day - 1]).join(", ");
  const unit = habit.scheduleUnit === "days" ? "dia(s)" : habit.scheduleUnit === "weeks" ? "semana(s)" : "mês(es)";
  return `A cada ${habit.scheduleEvery} ${unit}`;
}

export function getStreakMessage(streak: number) {
  if (streak === 0) return "Comece hoje";
  if (streak >= 30) return "Um mês de consistência";
  if (streak >= 7) return "Uma semana";
  return "Sequência iniciada";
}
