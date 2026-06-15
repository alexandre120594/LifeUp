import type {
  PomodoroDashboardResponse,
  PomodoroSession,
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

export function buildPomodoroDashboard(
  sessions: PomodoroSession[]
): PomodoroDashboardResponse {
  let studyMinutes = 0;
  const subjectTotals = new Map<
    string,
    { color?: string | null; minutes: number; title: string }
  >();
  const totalMinutes = sessions.reduce((total, session) => {
    const minutes = session.durationMinutes;
    const subjectId = session.subjectId ?? "unknown";
    const subject = subjectTotals.get(subjectId);

    studyMinutes += minutes;
    subjectTotals.set(subjectId, {
      color: session.subject?.color ?? subject?.color ?? null,
      minutes: (subject?.minutes ?? 0) + minutes,
      title: session.subject?.name ?? subject?.title ?? "No subject",
    });

    return total + minutes;
  }, 0);

  return {
    bySubject: Array.from(subjectTotals.entries())
      .map(([id, subject]) => ({
        color: subject.color,
        id,
        minutes: subject.minutes,
        title: subject.title,
      }))
      .sort((a, b) => b.minutes - a.minutes),
    sessions,
    studyMinutes,
    totalMinutes,
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
