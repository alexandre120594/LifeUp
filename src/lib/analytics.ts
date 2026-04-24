import { Habit, Project, Task } from "@/types/BaseInterfaces";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function normalizeDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDaysWindow(days: number) {
  const result: { key: string; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const current = new Date(today);
    current.setDate(today.getDate() - index);
    result.push({
      key: toDayKey(current),
      label: DAY_LABELS[current.getDay()],
    });
  }

  return result;
}

export function getTaskSummary(tasks: Task[] = []) {
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const completionRate =
    tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return {
    total: tasks.length,
    completed,
    pending,
    completionRate,
  };
}

export function buildActivityTrend(tasks: Task[] = [], habits: Habit[] = [], days = 7) {
  const window = buildDaysWindow(days);

  return window.map(({ key, label }) => {
    const tasksCompleted = tasks.filter((task) => {
      if (!task.completed) {
        return false;
      }

      const completedAt = normalizeDate(task.dateFinish ?? task.date);
      return completedAt ? toDayKey(completedAt) === key : false;
    }).length;

    const habitCheckIns = habits.reduce((total, habit) => {
      return total + (habit.history?.includes(key) ? 1 : 0);
    }, 0);

    return {
      date: label,
      tasksCompleted,
      habitCheckIns,
    };
  });
}

export function buildProjectPerformance(projects: Project[] = []) {
  return projects.map((project) => {
    const tasks = project.tasks ?? [];
    const completed = tasks.filter((task) => task.completed).length;
    const pending = tasks.length - completed;

    return {
      name: project.title,
      completed,
      pending,
      habits: project.habits?.length ?? 0,
    };
  });
}

export function buildHabitPerformance(habits: Habit[] = [], tasks: Task[] = []) {
  return habits.map((habit) => {
    const relatedTasks = tasks.filter((task) => task.habitId === habit.id);
    const completedTasks = relatedTasks.filter((task) => task.completed).length;
    const recentCheckIns = habit.history?.filter((date) => {
      const parsed = normalizeDate(date);
      if (!parsed) {
        return false;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lowerBound = new Date(today);
      lowerBound.setDate(today.getDate() - 6);

      return parsed >= lowerBound && parsed <= today;
    }).length;

    return {
      name: habit.title,
      streak: habit.streak ?? 0,
      completedTasks,
      recentCheckIns,
    };
  });
}
