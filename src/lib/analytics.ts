import {
  Habit,
  Project,
  StudyMistake,
  StudyQuestionPractice,
  StudySession,
  StudySubject,
  Task,
} from "@/types/BaseInterfaces";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type StudyQuestionPeriod = "day" | "week" | "month" | "year";

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

function toLocalDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
      total: tasks.length,
      completionRate:
        tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
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
      projectName: habit.project?.title,
      streak: habit.streak ?? 0,
      totalTasks: relatedTasks.length,
      completedTasks,
      recentCheckIns,
    };
  });
}

export function getDueStudyMistakes(
  mistakes: StudyMistake[] = [],
  referenceDate = new Date()
) {
  const endOfDay = new Date(referenceDate);
  endOfDay.setHours(23, 59, 59, 999);

  return mistakes
    .filter((mistake) => {
      const reviewDate = normalizeDate(mistake.reviewDate);

      return (
        mistake.status !== "mastered" &&
        reviewDate !== null &&
        reviewDate <= endOfDay
      );
    })
    .sort((a, b) => {
      const aDate = normalizeDate(a.reviewDate)?.getTime() ?? 0;
      const bDate = normalizeDate(b.reviewDate)?.getTime() ?? 0;

      return aDate - bDate;
    });
}

export function buildWeakSubjectMistakes(mistakes: StudyMistake[] = []) {
  const subjects = new Map<
    string,
    {
      due: number;
      mastered: number;
      name: string;
      reviewed: number;
      subjectId: string;
      total: number;
      unresolved: number;
    }
  >();
  const dueMistakeIds = new Set(
    getDueStudyMistakes(mistakes).map((mistake) => mistake.id)
  );

  mistakes.forEach((mistake) => {
    const subjectId = mistake.subjectId;
    const current =
      subjects.get(subjectId) ??
      {
        due: 0,
        mastered: 0,
        name: mistake.subject?.name ?? "Subject",
        reviewed: 0,
        subjectId,
        total: 0,
        unresolved: 0,
      };

    current.total += 1;
    current.due += dueMistakeIds.has(mistake.id) ? 1 : 0;
    current.mastered += mistake.status === "mastered" ? 1 : 0;
    current.reviewed += mistake.status === "reviewed" ? 1 : 0;
    current.unresolved += mistake.status === "unresolved" ? 1 : 0;
    subjects.set(subjectId, current);
  });

  return Array.from(subjects.values()).sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }

    return b.due - a.due;
  });
}

export function buildStudyQuestionTrend(
  practices: StudyQuestionPractice[] = [],
  period: StudyQuestionPeriod = "week",
  referenceDate = new Date()
) {
  const range = getStudyQuestionPeriodRange(period, referenceDate);
  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);

  if (period === "year") {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthPractices = practices.filter((practice) => {
        const practiceDate = normalizeDate(practice.practiceDate);

        return (
          practiceDate?.getFullYear() === from.getFullYear() &&
          practiceDate.getMonth() === monthIndex
        );
      });
      const correctQuestions = monthPractices.reduce(
        (total, practice) => total + practice.correctQuestions,
        0
      );
      const wrongQuestions = monthPractices.reduce(
        (total, practice) => total + practice.wrongQuestions,
        0
      );

      return {
        date: new Date(from.getFullYear(), monthIndex, 1).toLocaleDateString(
          undefined,
          { month: "short" }
        ),
        correctQuestions,
        totalQuestions: correctQuestions + wrongQuestions,
        wrongQuestions,
      };
    });
  }

  const window: Array<{ key: string; label: string }> = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    window.push({
      key: toLocalDayKey(cursor),
      label:
        period === "day"
          ? cursor.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
            })
          : period === "month"
            ? String(cursor.getDate())
            : cursor.toLocaleDateString(undefined, { weekday: "short" }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return window.map(({ key, label }) => {
    const dayPractices = practices.filter((practice) => {
      const practiceDate = normalizeDate(practice.practiceDate);
      return practiceDate ? toDayKey(practiceDate) === key : false;
    });
    const correctQuestions = dayPractices.reduce(
      (total, practice) => total + practice.correctQuestions,
      0
    );
    const wrongQuestions = dayPractices.reduce(
      (total, practice) => total + practice.wrongQuestions,
      0
    );
    const totalQuestions = dayPractices.reduce(
      (total, practice) => total + practice.totalQuestions,
      0
    );

    return {
      date: label,
      correctQuestions,
      totalQuestions,
      wrongQuestions,
    };
  });
}

export function getStudyQuestionSummary(
  practices: StudyQuestionPractice[] = []
) {
  const totalQuestions = practices.reduce(
    (total, practice) => total + practice.totalQuestions,
    0
  );
  const correctQuestions = practices.reduce(
    (total, practice) => total + practice.correctQuestions,
    0
  );
  const wrongQuestions = practices.reduce(
    (total, practice) => total + practice.wrongQuestions,
    0
  );
  const accuracyRate =
    totalQuestions > 0
      ? Math.round((correctQuestions / totalQuestions) * 100)
      : 0;

  return {
    accuracyRate,
    correctQuestions,
    totalQuestions,
    wrongQuestions,
  };
}

export function getStudyQuestionPeriodRange(
  period: StudyQuestionPeriod,
  referenceDate = new Date()
) {
  const from = new Date(referenceDate);
  const to = new Date(referenceDate);

  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  if (period === "week") {
    const daysSinceMonday = (from.getDay() + 6) % 7;
    from.setDate(from.getDate() - daysSinceMonday);
    to.setTime(from.getTime());
    to.setDate(from.getDate() + 6);
  } else if (period === "month") {
    from.setDate(1);
    to.setFullYear(from.getFullYear(), from.getMonth() + 1, 0);
  } else if (period === "year") {
    from.setFullYear(from.getFullYear(), 0, 1);
    to.setFullYear(from.getFullYear(), 11, 31);
  }

  return {
    from: toLocalDayKey(from),
    to: toLocalDayKey(to),
  };
}

export function buildStudyQuestionsBySubject(
  practices: StudyQuestionPractice[] = []
) {
  const subjects = new Map<
    string,
    {
      accuracyRate: number;
      correctQuestions: number;
      name: string;
      subjectId: string;
      totalQuestions: number;
      wrongQuestions: number;
    }
  >();

  practices.forEach((practice) => {
    const current = subjects.get(practice.subjectId) ?? {
      accuracyRate: 0,
      correctQuestions: 0,
      name: practice.subject?.name ?? "Subject",
      subjectId: practice.subjectId,
      totalQuestions: 0,
      wrongQuestions: 0,
    };

    current.correctQuestions += practice.correctQuestions;
    current.wrongQuestions += practice.wrongQuestions;
    current.totalQuestions =
      current.correctQuestions + current.wrongQuestions;
    current.accuracyRate =
      current.totalQuestions > 0
        ? Math.round(
            (current.correctQuestions / current.totalQuestions) * 100
          )
        : 0;
    subjects.set(practice.subjectId, current);
  });

  return Array.from(subjects.values()).sort(
    (a, b) => b.totalQuestions - a.totalQuestions || a.name.localeCompare(b.name)
  );
}

export function buildStudiedTimeBySubject(
  sessions: StudySession[] = [],
  studySubjects: StudySubject[] = []
) {
  const subjects = new Map<
    string,
    {
      color?: string | null;
      id: string;
      minutes: number;
      title: string;
    }
  >();

  studySubjects.forEach((subject) => {
    subjects.set(subject.id, {
      color: subject.color,
      id: subject.id,
      minutes: 0,
      title: subject.name,
    });
  });

  sessions.forEach((session) => {
    const current = subjects.get(session.subjectId) ?? {
      color: session.subject?.color,
      id: session.subjectId,
      minutes: 0,
      title: session.subject?.name ?? "Subject",
    };

    current.minutes += session.durationMinutes;
    subjects.set(session.subjectId, current);
  });

  return Array.from(subjects.values()).sort(
    (a, b) => b.minutes - a.minutes || a.title.localeCompare(b.title)
  );
}
