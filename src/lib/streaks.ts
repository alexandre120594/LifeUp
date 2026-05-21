export function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

function dayDifference(currentKey: string, previousKey: string) {
  const current = new Date(`${currentKey}T00:00:00.000Z`);
  const previous = new Date(`${previousKey}T00:00:00.000Z`);

  return (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
}

function getTodayKey() {
  return toDayKey(new Date());
}

function getYesterdayKey() {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return toDayKey(yesterday);
}

export function calculateProjectStreak(
  dates: Date[],
  dailyTarget = 1
): {
  streakGlobal: number;
  lastActivityDate: Date | null;
} {
  const minimum = Math.max(1, Math.floor(dailyTarget || 1));
  const countsByDay = new Map<string, number>();

  dates.filter(isValidDate).forEach((date) => {
    const key = toDayKey(date);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  });

  const qualifyingDays = Array.from(countsByDay.entries())
    .filter(([, count]) => count >= minimum)
    .map(([key]) => key)
    .sort();

  if (qualifyingDays.length === 0) {
    return {
      streakGlobal: 0,
      lastActivityDate: null,
    };
  }

  const latestKey = qualifyingDays[qualifyingDays.length - 1];
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  if (latestKey !== todayKey && latestKey !== yesterdayKey) {
    return {
      streakGlobal: 0,
      lastActivityDate: new Date(`${latestKey}T00:00:00.000Z`),
    };
  }

  let streakGlobal = 1;

  for (let index = qualifyingDays.length - 1; index > 0; index -= 1) {
    if (dayDifference(qualifyingDays[index], qualifyingDays[index - 1]) === 1) {
      streakGlobal += 1;
    } else {
      break;
    }
  }

  return {
    streakGlobal,
    lastActivityDate: new Date(`${latestKey}T00:00:00.000Z`),
  };
}

export function calculateHabitState(dates: Date[]): {
  history: string[];
  streak: number;
} {
  const history = Array.from(new Set(dates.filter(isValidDate).map(toDayKey))).sort();

  if (history.length === 0) {
    return {
      history: [],
      streak: 0,
    };
  }

  const todayKey = getTodayKey();
  const latestKey = history[history.length - 1];
  let streak = 0;

  if (latestKey === todayKey) {
    streak = 1;

    for (let index = history.length - 1; index > 0; index -= 1) {
      if (dayDifference(history[index], history[index - 1]) === 1) {
        streak += 1;
      } else {
        break;
      }
    }
  }

  return {
    history,
    streak,
  };
}
