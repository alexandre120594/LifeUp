import type {
  PomodoroDashboardResponse,
  PomodoroSession,
  PomodoroSummaryItem,
  Task,
} from "@/types/BaseInterfaces";

export function formatFocusDuration(minutes: number) {
  const safeMinutes = Math.max(Math.round(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function addMinutesToSummary(
  summaries: Map<string, PomodoroSummaryItem>,
  item: { id: string; title: string } | null | undefined,
  minutes: number
) {
  if (!item) {
    return;
  }

  const current = summaries.get(item.id);

  summaries.set(item.id, {
    id: item.id,
    title: item.title,
    minutes: (current?.minutes ?? 0) + minutes,
  });
}

export function buildPomodoroDashboard(
  sessions: PomodoroSession[]
): PomodoroDashboardResponse {
  const projectMinutes = new Map<string, PomodoroSummaryItem>();
  const habitMinutes = new Map<string, PomodoroSummaryItem>();
  let workMinutes = 0;
  let studyMinutes = 0;
  const totalMinutes = sessions.reduce((total, session) => {
    const minutes = session.durationMinutes;

    addMinutesToSummary(projectMinutes, session.task?.project, minutes);
    addMinutesToSummary(habitMinutes, session.task?.habit, minutes);
    if (session.focusType === "study") {
      studyMinutes += minutes;
    } else {
      workMinutes += minutes;
    }

    return total + minutes;
  }, 0);

  const sortByMinutes = (items: PomodoroSummaryItem[]) =>
    items.sort((a, b) => b.minutes - a.minutes);

  return {
    byHabit: sortByMinutes(Array.from(habitMinutes.values())),
    byProject: sortByMinutes(Array.from(projectMinutes.values())),
    sessions,
    studyMinutes,
    totalMinutes,
    workMinutes,
  };
}

export function sumTaskFocusMinutes(tasks: Task[] = []) {
  return tasks.reduce((total, task) => {
    return (
      total +
      (task.pomodoroSessions?.reduce(
        (taskTotal, session) => taskTotal + session.durationMinutes,
        0
      ) ?? 0)
    );
  }, 0);
}
