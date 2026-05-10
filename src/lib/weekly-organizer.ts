import type { Habit, Project, Task } from "@/types/BaseInterfaces";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type WeekDayPlan = {
  key: string;
  label: string;
  dateLabel: string;
  isToday: boolean;
  tasks: Task[];
  projects: Project[];
  dailyHabits: Habit[];
  weeklyHabits: Habit[];
};

export type WeeklyProjectPlan = {
  project: Project;
  tasks: Task[];
  habits: Habit[];
  pendingTasks: number;
};

function normalizeDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toLocalDayKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentWeek(referenceDate = new Date()) {
  const selectedDate = new Date(referenceDate);
  selectedDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mondayOffset =
    selectedDate.getDay() === 0 ? -6 : 1 - selectedDate.getDay();
  const start = new Date(selectedDate);
  start.setDate(selectedDate.getDate() + mondayOffset);

  return DAY_NAMES.map((label, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      key: toLocalDayKey(date),
      label,
      dateLabel: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      isToday: toLocalDayKey(date) === toLocalDayKey(today),
    };
  });
}

export function isTaskInWeek(task: Task, weekKeys: string[]) {
  const taskDate = normalizeDate(task.date);
  return taskDate ? weekKeys.includes(toLocalDayKey(taskDate)) : false;
}

export function buildWeekDayPlans(
  tasks: Task[] = [],
  habits: Habit[] = [],
  projects: Project[] = [],
  referenceDate = new Date()
): WeekDayPlan[] {
  const week = getCurrentWeek(referenceDate);

  return week.map((day, index) => {
    const dayTasks = tasks
      .filter((task) => {
        const taskDate = normalizeDate(task.date);
        return taskDate ? toLocalDayKey(taskDate) === day.key : false;
      })
      .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
    const dayProjects = projects.filter(
      (_, projectIndex) => projectIndex % week.length === index
    );
    const weeklyHabits = habits.filter(
      (habit, habitIndex) =>
        habit.frequency === "weekly" && habitIndex % week.length === index
    );

    return {
      ...day,
      tasks: dayTasks,
      projects: dayProjects,
      dailyHabits: habits.filter((habit) => habit.frequency !== "weekly"),
      weeklyHabits,
    };
  });
}

export function buildWeeklyProjectPlans(
  projects: Project[] = [],
  tasks: Task[] = [],
  habits: Habit[] = [],
  referenceDate = new Date()
): WeeklyProjectPlan[] {
  const weekKeys = getCurrentWeek(referenceDate).map((day) => day.key);

  return projects
    .map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.projectId === project.id && isTaskInWeek(task, weekKeys)
      );
      const projectHabits = habits.filter((habit) => habit.projectId === project.id);

      return {
        project,
        tasks: projectTasks,
        habits: projectHabits,
        pendingTasks: projectTasks.filter((task) => !task.completed).length,
      };
    })
    .filter((plan) => plan.tasks.length > 0 || plan.habits.length > 0)
    .sort((a, b) => b.pendingTasks - a.pendingTasks);
}
