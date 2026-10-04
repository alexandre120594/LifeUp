import type { LifeHabit } from "@/types/BaseInterfaces";

const DAY_IN_MS = 86_400_000;

export type HabitDay = {
  dayKey: string;
  isCompleted: boolean;
  isRelapse: boolean;
  isToday: boolean;
  label: string;
};

export type HabitMetrics = {
  bestStreak: number;
  checkedToday: boolean;
  completionRate: number;
  currentStreak: number;
  nextMilestone: number;
  progress: number;
  targetDays: number;
  targetReached: boolean;
};

export type HabitWeekSummary = {
  availableDays: number;
  completedDays: number;
  label: string;
  rate: number;
  relapseCount: number;
};

export function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayKey() {
  return getDayKey(new Date());
}

export function shiftDayKey(dayKey: string, days: number) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getDayKey(date);
}

export function normalizeTargetDays(value: number | null | undefined) {
  if (!value || !Number.isFinite(value)) return 30;
  return Math.min(Math.max(Math.round(value), 10), 365);
}

export function getLastRelapseKey(habit: LifeHabit) {
  const lastEvent = [...new Set(habit.badEvents)].sort().at(-1);
  if (lastEvent) return lastEvent;
  return habit.lastBadAt ? getDayKey(new Date(habit.lastBadAt)) : null;
}

function uniqueSortedDayKeys(dayKeys: string[]) {
  return [...new Set(dayKeys)].sort();
}

function getStreakEndingNearToday(dayKeys: string[], todayKey: string) {
  const checkins = new Set(dayKeys);
  let cursor = checkins.has(todayKey) ? todayKey : shiftDayKey(todayKey, -1);
  let streak = 0;

  while (checkins.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }

  return streak;
}

function getBestRun(dayKeys: string[]) {
  let best = 0;
  let current = 0;
  let previous: string | null = null;

  for (const dayKey of uniqueSortedDayKeys(dayKeys)) {
    current = previous && shiftDayKey(dayKey, -1) === previous ? current + 1 : 1;
    best = Math.max(best, current);
    previous = dayKey;
  }

  return best;
}

function getBadHabitSegments(habit: LifeHabit) {
  const lastBadKey = habit.lastBadAt ? getDayKey(new Date(habit.lastBadAt)) : null;
  const events = uniqueSortedDayKeys([
    ...habit.badEvents,
    ...(lastBadKey ? [lastBadKey] : []),
  ]);
  if (!events.length) return [uniqueSortedDayKeys(habit.checkins)];

  const segments: string[][] = Array.from({ length: events.length + 1 }, () => []);
  for (const dayKey of uniqueSortedDayKeys(habit.checkins)) {
    let segmentIndex = 0;
    while (segmentIndex < events.length && dayKey >= events[segmentIndex]) {
      segmentIndex += 1;
    }
    segments[segmentIndex].push(dayKey);
  }
  return segments;
}

export function getCurrentStreak(habit: LifeHabit, todayKey = getTodayKey()) {
  if (habit.kind === "good") {
    return getStreakEndingNearToday(habit.checkins, todayKey);
  }

  const lastRelapseKey = getLastRelapseKey(habit);
  const currentCheckins = uniqueSortedDayKeys(habit.checkins).filter(
    (dayKey) => !lastRelapseKey || dayKey >= lastRelapseKey,
  );
  return getStreakEndingNearToday(currentCheckins, todayKey);
}

export function getBestStreak(habit: LifeHabit) {
  if (habit.kind === "good") return getBestRun(habit.checkins);
  return Math.max(0, ...getBadHabitSegments(habit).map(getBestRun));
}

export function getCompletionRate(
  habit: LifeHabit,
  days = 28,
  todayKey = getTodayKey(),
) {
  const createdKey = getDayKey(new Date(habit.createdAt));
  const availableDays = Math.max(
    1,
    Math.min(days, Math.floor((new Date(`${todayKey}T12:00:00`).getTime() - new Date(`${createdKey}T12:00:00`).getTime()) / DAY_IN_MS) + 1),
  );
  const startKey = shiftDayKey(todayKey, -(availableDays - 1));
  const completed = new Set(habit.checkins);
  let completedDays = 0;

  for (let offset = 0; offset < availableDays; offset += 1) {
    if (completed.has(shiftDayKey(startKey, offset))) completedDays += 1;
  }

  return Math.round((completedDays / availableDays) * 100);
}

export function getHabitMetrics(
  habit: LifeHabit,
  todayKey = getTodayKey(),
): HabitMetrics {
  const targetDays = normalizeTargetDays(habit.targetDays);
  const currentStreak = getCurrentStreak(habit, todayKey);

  return {
    bestStreak: getBestStreak(habit),
    checkedToday: habit.checkins.includes(todayKey),
    completionRate: getCompletionRate(habit, 28, todayKey),
    currentStreak,
    nextMilestone: Math.ceil((currentStreak + 1) / 10) * 10,
    progress: Math.min(100, Math.round((currentStreak / targetDays) * 100)),
    targetDays,
    targetReached: currentStreak >= targetDays,
  };
}

export function getHabitDays(
  habit: LifeHabit,
  count: number,
  todayKey = getTodayKey(),
): HabitDay[] {
  const checkins = new Set(habit.checkins);
  const relapses = new Set(habit.badEvents);
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "narrow" });

  return Array.from({ length: count }, (_, index) => {
    const dayKey = shiftDayKey(todayKey, index - count + 1);
    const [year, month, day] = dayKey.split("-").map(Number);
    return {
      dayKey,
      isCompleted: checkins.has(dayKey),
      isRelapse: relapses.has(dayKey),
      isToday: dayKey === todayKey,
      label: formatter.format(new Date(year, month - 1, day)).toUpperCase(),
    };
  });
}

export function getLastSevenDays(habit: LifeHabit, todayKey = getTodayKey()) {
  return getHabitDays(habit, 7, todayKey);
}

export function getHabitWeekSummaries(
  habit: LifeHabit,
  todayKey = getTodayKey(),
): HabitWeekSummary[] {
  const days = getHabitDays(habit, 28, todayKey);
  const createdKey = getDayKey(new Date(habit.createdAt));

  return Array.from({ length: 4 }, (_, index) => {
    const weekDays = days.slice(index * 7, index * 7 + 7);
    const availableDays = weekDays.filter((day) => day.dayKey >= createdKey).length;
    const completedDays = weekDays.filter(
      (day) => day.dayKey >= createdKey && day.isCompleted,
    ).length;
    const relapseCount = weekDays.filter(
      (day) => day.dayKey >= createdKey && day.isRelapse,
    ).length;
    const weeksAgo = 3 - index;

    return {
      availableDays,
      completedDays,
      label: weeksAgo === 0 ? "Esta semana" : weeksAgo === 1 ? "Semana anterior" : `${weeksAgo} semanas atrás`,
      rate: availableDays ? Math.round((completedDays / availableDays) * 100) : 0,
      relapseCount,
    };
  });
}

export function getStreakMessage(streak: number) {
  if (streak === 0) return "Comece hoje";
  if (streak >= 30) return "1 mês de consistência";
  if (streak >= 10) return "Primeiro marco";
  if (streak >= 7) return "1 semana";
  return "Sequência iniciada";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function rewardLooksRisky(title: string, reward: string) {
  const normalizedTitle = normalizeText(title.trim());
  const normalizedReward = normalizeText(reward.trim());
  if (!normalizedTitle || !normalizedReward) return false;
  if (normalizedReward.includes(normalizedTitle)) return true;

  const ignoredWords = new Set(["nao", "sem", "evitar", "parar", "de", "a", "o"]);
  const titleWords = normalizedTitle
    .split(/\W+/)
    .filter((word) => word.length >= 4 && !ignoredWords.has(word));
  if (titleWords.some((word) => normalizedReward.includes(word))) return true;

  const riskyGroups = [
    ["fumar", "cigarro", "tabaco", "nicotina"],
    ["refrigerante", "refri"],
    ["alcool", "cerveja", "vinho", "bebida"],
    ["delivery", "entrega", "fast food"],
  ];
  return riskyGroups.some(
    (group) =>
      group.some((term) => normalizedTitle.includes(term)) &&
      group.some((term) => normalizedReward.includes(term)),
  );
}
